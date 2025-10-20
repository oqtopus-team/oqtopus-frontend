import { ReactNode, useContext, useRef } from 'react';
import clsx from 'clsx';
import { ComposerGate, getGateHeight, isDummyGate } from '../composer';
import { isControlledGate, isCustomGate } from '../gates';
import { circuitContext } from '../circuit';
import { cellBlockDiff, cellSize, gateBlockSize } from '../gates_rendering/constants';
import { useDraggable, useDroppable } from '@dnd-kit/core';

export interface Props {
  row: number;
  column: number;
  gate: ComposerGate;
  static?: boolean;
  selected: boolean;
}

export default (props: Props) => {
  const { gate } = props;
  const circuitService = useContext(circuitContext);
  const ref = useRef<HTMLDivElement>(null);

  const draggable = useDraggable({
    id: `r${props.row}-c${props.column}`,
    data: { row: props.row, column: props.column },
  });
  const droppable = useDroppable({
    id: `r${props.row}-c${props.column}`,
    data: { row: props.row, column: props.column },
  });

  const isGateDragged = circuitService.draggedGates.some((g) => gate.id === g.id);
  const canDragGate = !isDummyGate(gate) && !props.static;

  function renderGate(): ReactNode {
    if (isDummyGate(gate)) return null;
    if ('renderComposerItem' in gate)
      return gate.renderComposerItem({
        targets: gate.targets,
        controls: gate.controls,
        styles: clsx(
          ['text-primary-content'],
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
            ref={(node) => {
              ref.current = node;
              draggable.setNodeRef(node);
              droppable.setNodeRef(node);
            }}
            {...draggable.attributes}
            // skipping listeners disable dragging
            {...(canDragGate ? draggable.listeners : {})}
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
              touchAction: 'none',
              transition: 'none',
              userSelect: 'none',
              outline: 'none',
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
