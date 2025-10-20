import QuantumCircuitCanvas from './QuantumCircuitCanvas';

import clsx from 'clsx';
import QuantumGatePalette from './QuantumGatePalette';
import {
  Collision,
  CollisionDetection,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { isDummyGate, RealComposerGate } from '../composer';
import { useContext, useRef, useState } from 'react';
import { circuitContext } from '../circuit';
import { gateBlockSize } from '../gates_rendering/constants';
import { isCustomGate } from '../gates';

export interface QuantumCircuitComposerProps {
  fixedQubitNumber?: boolean;
}

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

    const distance = Math.sqrt(Math.pow(dropX - middleX, 2) + Math.pow(dropY - topCellMiddleY, 2));
    collisions.push({ id, data: { droppableContainer, value: distance } });
  }

  return collisions.sort((a, b) => a.data!!.value - b.data!!.value);
};

export default (props: QuantumCircuitComposerProps) => {
  const [draggedGate, setDraggedGate] = useState<RealComposerGate | undefined>(undefined);
  const isDraggingNewGate = useRef(false);
  const circuitService = useContext(circuitContext);

  // minimum activation constraint to prevent dragging from triggering
  // when we for example want to just click on the gate to select it
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 1 } }));

  return (
    <div id="quantum-circuit-composer">
      <DndContext
        sensors={sensors}
        collisionDetection={detectCollision}
        onDragStart={(e) => {
          console.log('DRAG START', e);
          const data = e.active.data.current;
          if (!data) return;

          if ('row' in data && 'column' in data) {
            isDraggingNewGate.current = false;
            const gate = circuitService.circuit[data.row][data.column];
            if (!isDummyGate(gate)) {
              setDraggedGate(gate);
              circuitService.handleDragStart([gate]);
            }
          } else if ('gate' in data) {
            isDraggingNewGate.current = true;
            setDraggedGate(data.gate);
            circuitService.handleDragStart([data.gate]);
          }
        }}
        onDragOver={(e) => {
          console.log('DRAG OVER', e);
          const overData = e.over?.data.current;
          if (!overData) return;

          circuitService.moveGate(
            circuitService.draggedGates[0],
            overData.row,
            overData.column,
            (row, column, targets, controls) => {
              isDraggingNewGate.current = false;
              circuitService.draggedGates[0].row = row;
              circuitService.draggedGates[0].column = column;
              circuitService.draggedGates[0].targets = targets;
              circuitService.draggedGates[0].controls = controls;
            },
            isDraggingNewGate.current
          );
        }}
        onDragEnd={(e) => {
          console.log('DRAG END', e, e.over, !!e.over);
          circuitService.handleDragEnd();
        }}
        onDragAbort={(e) => {
          console.log('DRAG ABORT', e);
          circuitService.handleDragEnd();
        }}
        onDragCancel={(e) => {
          console.log('DRAG CANCEL', e);
          circuitService.handleDragEnd();
        }}
      >
        <div className={clsx([['w-full']])}>
          <QuantumGatePalette />
        </div>

        <QuantumCircuitCanvas static={false} fixedQubitNumber={props.fixedQubitNumber ?? false} />
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
    </div>
  );
};
