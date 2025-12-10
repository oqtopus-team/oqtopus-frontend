import {
  Collision,
  CollisionDetection,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cellSize, gateBlockSize } from './gates_rendering/constants';
import { isDummyGate, RealComposerGate } from './composer';
import clsx from 'clsx';
import { isCustomGate } from './gates';
import { useContext, useRef, useState } from 'react';
import { circuitContext } from './circuit';

/**
 * We detect collisions based on the middle of the top cell of the gate
 * and not based on the middle of the whole gate like the default collision detector
 * because we need to compensate for the fact that gates can occupy multiple cells in column
 */
const detectCollision: CollisionDetection = ({
  droppableContainers,
  droppableRects,
  collisionRect,
}) => {
  const collisions: Collision[] = [];

  const topCellMiddleY = collisionRect.top + gateBlockSize / 2;
  const middleX = collisionRect.left + collisionRect.width / 2;

  for (const droppableContainer of droppableContainers) {
    const { id } = droppableContainer;
    const dropRect = droppableRects.get(id);

    if (!dropRect) continue;

    const dropX = dropRect.left + dropRect.width / 2;
    const dropY = dropRect.top + gateBlockSize / 2;

    if (Math.abs(dropX - middleX) > cellSize || Math.abs(dropY - topCellMiddleY) > cellSize) {
      continue;
    }

    const distance = Math.sqrt(Math.pow(dropX - middleX, 2) + Math.pow(dropY - topCellMiddleY, 2));
    collisions.push({ id, data: { droppableContainer, value: distance } });
  }

  return collisions.sort((a, b) => a.data!!.value - b.data!!.value);
};

export function DndContextProvider({ children }: React.PropsWithChildren) {
  const [draggedGate, setDraggedGate] = useState<RealComposerGate | undefined>(undefined);
  const isDraggingNewGate = useRef(false);
  const heldGateRef = useRef<RealComposerGate | undefined>(undefined);
  const circuitService = useContext(circuitContext);

  // minimum activation constraint to prevent dragging from triggering
  // when we for example want to just click on the gate to select it
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 1 } }));

  function handleGateMoved(row: number, column: number, targets: number[], controls: number[]) {
    isDraggingNewGate.current = false;

    if (heldGateRef.current) {
      heldGateRef.current.row = row;
      heldGateRef.current.column = column;
      heldGateRef.current.targets = targets;
      heldGateRef.current.controls = controls;
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={detectCollision}
      onDragStart={(e) => {
        const data = e.active.data.current;
        if (!data) return;

        if ('row' in data && 'column' in data) {
          isDraggingNewGate.current = false;
          const gate = circuitService.circuit[data.row][data.column];
          if (!isDummyGate(gate)) {
            heldGateRef.current = gate;
            setDraggedGate(gate);
            circuitService.handleDragStart([gate]);
          }
        } else if ('gate' in data) {
          isDraggingNewGate.current = true;
          heldGateRef.current = data.gate;
          setDraggedGate(data.gate);
          circuitService.handleDragStart([data.gate]);
        }
      }}
      onDragOver={(e) => {
        // in regular circuits we move gate when hovering over given cell
        if (!circuitService.isObservableCircuit) {
          const gateOverData = e.over?.data.current;
          if (!gateOverData) return;

          const heldGate = heldGateRef.current;
          if (!heldGate) return;

          if (
            circuitService.selectedGates.length > 1 &&
            circuitService.selectedGates.some((g) => g.id === heldGate.id)
          ) {
            circuitService.moveSelectedGates(
              heldGate,
              gateOverData.row,
              gateOverData.column,
              handleGateMoved
            );
          } else {
            circuitService.moveGateOnHover(
              heldGate,
              gateOverData.row,
              gateOverData.column,
              handleGateMoved,
              isDraggingNewGate.current
            );
          }
        }
      }}
      onDragEnd={(e) => {
        // in observable circuits we move gate only when we drop the gate on given cell
        if (circuitService.isObservableCircuit) {
          const gateOverData = e.over?.data.current;
          if (!gateOverData) return;

          const heldGate = heldGateRef.current;
          if (!heldGate) return;

          circuitService.moveGateOnDrop(
            heldGate,
            gateOverData.row,
            gateOverData.column,
            handleGateMoved,
            isDraggingNewGate.current
          );
        }
        circuitService.handleDragEnd();
      }}
      onDragAbort={() => {
        circuitService.handleDragEnd();
      }}
      onDragCancel={() => {
        circuitService.handleDragEnd();
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {draggedGate && (
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 'auto',
              minWidth: `${gateBlockSize}px`,
              minHeight: `${gateBlockSize}px`,
              userSelect: 'none',
            }}
          >
            {'renderComposerItem' in draggedGate ? (
              draggedGate.renderComposerItem({
                targets: draggedGate.targets,
                controls: draggedGate.controls,
                styles: clsx(['text-primary-content']),
                isSettingControl: false,
                customTag: isCustomGate(draggedGate) ? draggedGate.customTag : undefined,
              })
            ) : (
              <div
                className={clsx([
                  ['w-full', 'h-full', 'rounded'],
                  ['flex', 'items-center', 'justify-center'],
                  ['bg-gate-atomic', 'text-center', 'align-middle'],
                ])}
                style={{
                  backgroundColor: draggedGate.backgroundColor,
                  width: `${gateBlockSize}px`,
                  height: `${gateBlockSize}px`,
                }}
              >
                <span className={clsx([['text-primary-content', 'font-bold'], ['text-xl']])}>
                  {draggedGate.composerItem}
                </span>
              </div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
