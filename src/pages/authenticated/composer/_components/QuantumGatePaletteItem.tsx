import { useRef, useState } from 'react';
import { GateTag } from '../gates';
import clsx from 'clsx';
import { gateRenderingBlockMap } from '../gates_rendering/Gates';
import { createComposerGate } from '../composer';
import { useDraggable } from '@dnd-kit/core';

export interface Props {
  gateTag: GateTag;
  disabled: boolean;
}

export default function QuantumGatePaletteItem({ disabled, gateTag }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [gateBlock] = useState(gateRenderingBlockMap[gateTag]);

  const draggable = useDraggable({
    id: gateTag,
    data: { gate: createComposerGate(gateTag, -1, -1) },
  });

  return (
    <div
      ref={(node) => {
        ref.current = node;
        draggable.setNodeRef(node);
      }}
      {...draggable.attributes}
      {...(!disabled ? draggable.listeners : {})}
      className={clsx([
        ['text-info-content', 'font-bold'],
        gateBlock.hasBorder ? ['border', 'border-gate-operation-border'] : [],
      ])}
      style={{
        minWidth: '2.5rem',
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: draggable.isDragging || disabled ? 0.5 : 1,
        cursor: draggable.isDragging ? 'grabbing' : disabled ? 'not-allowed' : 'pointer',
        backgroundColor: gateBlock.backgroundColor,
        touchAction: 'pan-x', // keep horizontal touch actions to allow scrolling whole pallette
        transition: 'none',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {gateBlock.palletteItem}
    </div>
  );
}
