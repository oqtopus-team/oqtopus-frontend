import { ReactNode, RefObject, useContext, useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  ComposerGate,
  DragGateItem,
  getGateHeight,
  isDummyGate,
  ItemTypeMoveGate,
  ItemTypeNewGate,
  RealComposerGate,
} from '../composer';
import { isControlledGate, isCustomGate, isMultiQubitGate } from '../gates';
import { GATE_CELL_SIZE } from '../gates_rendering/Gates';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import { circuitContext } from '../circuit';
import { cellBlockDiff, cellSize, gateBlockSize } from '../gates_rendering/constants';

export interface Props {
  row: number;
  column: number;
  gate: ComposerGate;
  static?: boolean;
  selected: boolean;
  circuitGrid: RefObject<HTMLDivElement | null>;
}

export default (props: Props) => {
  const { gate, circuitGrid } = props;
  const circuitService = useContext(circuitContext);
  const ref = useRef<HTMLDivElement>(null);
  const gateRef = useRef<ComposerGate>(gate);

  const [, drop] = useDrop<DragGateItem>({
    accept: [ItemTypeNewGate, ItemTypeMoveGate],
    hover(item, monitor) {
      if (!circuitService.isObservableCircuit) {
        handleMoveGate(item, monitor);
      }
    },
    drop(item, monitor) {
      if (circuitService.isObservableCircuit) {
        handleMoveGate(item, monitor);
      }
    },
  });

  const [, drag] = useDrag<DragGateItem>(() => ({
    type: ItemTypeMoveGate,
    canDrag: () => !isDummyGate(gateRef.current) && !props.static,
    item: () => {
      const gate = gateRef.current;
      circuitService.handleDragStart([gate.id]);

      return {
        type: ItemTypeMoveGate,
        gate: gate as RealComposerGate, // we validate it in canDrag so we can assume it's RealComposerGate here
        isCreated: true,
      };
    },
    end: () => {
      circuitService.handleDragEnd();
    },
  }));

  useEffect(() => {
    gateRef.current = gate;
  }, [props]);

  const isGateDragged = circuitService.draggedGateIds.some((id) => gate.id === id);

  drag(drop(ref));

  function handleMoveGate(item: DragGateItem, monitor: DropTargetMonitor) {
    const { gate, isCreated } = item;
    let actualRow = determineCurrentRow(props.row, monitor.getClientOffset());

    if (isMultiQubitGate(gate)) {
      actualRow = determineFirstRow(
        actualRow,
        monitor.getSourceClientOffset(),
        monitor.getClientOffset()
      );
    }

    if (!isCreated) {
      circuitService.moveGate(
        gate,
        actualRow,
        props.column,
        (row, column, targets, controls) => {
          item.isCreated = true;
          item.gate = { ...gate, row, column, targets, controls } as any;
        },
        true
      );
    } else {
      circuitService.moveGate(gate, actualRow, props.column, (row, column, targets, controls) => {
        item.gate.row = row;
        item.gate.column = column;
        item.gate.targets = targets;
        item.gate.controls = controls;
      });
    }
  }

  /**
   * When dragging multi-row gate and we start dragging from parts of the gate that are on the further rows
   * then it doesn't automatically detect and adjust which row of the gate we are dragging and it would place
   * it incorrectly, e.g. when dragging by the bottom part of the gate from row 1 to 2, it would not place
   * bottom of the gate at row 2, but the top of the gate. Therefore, we need to adjust it manually depending
   * on the position of the gate.
   */
  function determineFirstRow(hoverRow: number, source: XYCoord | null, offset: XYCoord | null) {
    if (!offset || !source) return hoverRow;

    let firstRow = hoverRow - Math.floor((offset.y - source.y) / GATE_CELL_SIZE);

    if (firstRow < 0) {
      firstRow = 0;
    } else if (firstRow >= circuitService.circuit.length) {
      firstRow = circuitService.circuit.length - 1;
    }
    return firstRow;
  }

  /**
   * Due to the fact that when dragging on multi-row always provided first row of multi-row gate as hovered row
   * We calculate real row on which we hover basing on the actual position on which we hover on a grid
   * We also clamp the value between 0 and last available row to prevent overflowing values
   */
  function determineCurrentRow(defaultRow: number, offset: XYCoord | null) {
    if (!circuitGrid.current || !offset) return defaultRow;

    const gridStartY = circuitGrid.current.getBoundingClientRect().y;
    const offsetY = offset.y;

    let currentRow = Math.floor((offsetY - gridStartY) / GATE_CELL_SIZE);

    if (currentRow < 0) {
      currentRow = 0;
    } else if (currentRow >= circuitService.circuit.length) {
      currentRow = circuitService.circuit.length - 1;
    }

    return currentRow;
  }

  function renderGate(): ReactNode {
    if (isDummyGate(gate)) return null;
    if ('renderComposerItem' in gate)
      return gate.renderComposerItem({
        targets: gate.targets,
        controls: gate.controls,
        styles: clsx(
          props.selected
            ? ['shadow-md', 'rounded', 'ring-4', 'ring-primary', 'ring-opacity-50']
            : []
        ),
        isSettingControl: circuitService.mode === 'control' && props.selected,
        customTag: isCustomGate(gate) ? gate.customTag : undefined,
      });

    return (
      <div
        className={clsx([
          ['w-full', 'h-full', 'rounded'],
          ['flex', 'items-center', 'justify-center'],
          isGateDragged ? ['opacity-50'] : [],
          ['bg-gate-atomic', 'text-center', 'align-middle'],
          props.selected ? ['shadow-md', 'ring-4', 'ring-primary', 'ring-opacity-50'] : [],
        ])}
        style={{
          backgroundColor: gate.backgroundColor,
          width: `${gateBlockSize}px`,
          height: `${gateBlockSize}px`,
        }}
      >
        <span className={clsx([['text-primary-content', 'font-bold'], ['text-xl']])}>
          {gate.composerItem}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'table-cell',
        position: 'relative',
        minWidth: `${cellSize}px`,
        height: `${cellSize}px`,
        zIndex: !isDummyGate(gate) ? '1' : '0',
        verticalAlign: 'middle',
        textAlign: 'center',
      }}
      onClick={() => {
        if (isDummyGate(gate)) {
          circuitService.selectedGates = [];
        }
      }}
    >
      {/* Ensure table-cell has height of cellSize at most even if gate's height is greater */}
      <div style={{ maxHeight: `${cellSize}px` }}>
        <div
          style={{
            minWidth: `${cellSize}px`,
            padding: `${cellBlockDiff / 2}px`,
            height: !isDummyGate(gate) ? `${getGateHeight(gate) * cellSize}px` : `${cellSize}px`,
          }}
        >
          <div
            ref={ref}
            className={clsx([
              ['text-primary-content'],
              props.static === true || isDummyGate(gate)
                ? []
                : [isGateDragged ? 'cursor-grabbing' : 'cursor-pointer'],
              [isGateDragged ? 'opacity-50' : 'opacity-100'],
            ])}
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 'auto',
              minWidth: `${gateBlockSize}px`,
              minHeight: `${gateBlockSize}px`,
            }}
            onClick={(e) => {
              if (isDummyGate(gate)) return;

              switch (circuitService.mode) {
                case 'normal':
                  if (e.shiftKey) {
                    circuitService.toggleSelectedGate(gate);
                  } else {
                    circuitService.selectedGates = [gate];
                  }
                  break;
                case 'eraser':
                  circuitService.removeGate(gate);
                  break;
                case 'control':
                  circuitService.toggleMode('control');
                  circuitService.controlModeProgress++;
                  break;
              }
            }}
            onDoubleClick={(e) => {
              if (e.shiftKey) return;
              if (circuitService.mode === 'eraser') return;
              if (isDummyGate(gate) || !isControlledGate(gate)) return;

              circuitService.selectedGates = [gate];
              circuitService.controlModeProgress = 0;
              circuitService.toggleMode('control');
            }}
          >
            {renderGate()}
          </div>
        </div>
      </div>
    </div>
  );
};
