import { useContext, useEffect, useRef, useState } from "react";
import { createQuantumGate, GateTag } from "../gates";
import { useDrag } from "react-dnd";
// import { FromPalette, ItemTypeGate } from "../dnd";
import clsx from "clsx";
import { gateRenderingBlockMap } from "../gates_rendering/Gates";
import { createComposerGate, DragGateItem, ItemTypeNewGate } from "../composer";
import { circuitContext } from "../circuit";

export interface Props {
  gateTag: GateTag;
  disabled: boolean;
}

export default function QuantumGatePaletteItem({ disabled, gateTag }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [gateBlock] = useState(gateRenderingBlockMap[gateTag]);
  const circuitService = useContext(circuitContext);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypeNewGate,
      item: () => {
        const gate = createComposerGate(gateTag, -1, -1);
        circuitService.handleDragStart([gate.id]);
        return { gate, isCreated: false };
      },
      canDrag: disabled === false,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end(draggedItem, monitor) {
        circuitService.handleDragEnd();
      },
    }),
    [gateTag, disabled]
  );

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [ref, drag]);

  // useEffect(() => {
  //   if (isDragging) {
  //     onDragStart();
  //   } else {
  //     onDragEnd();
  //   }
  // }, [isDragging]);

  return (
    <div
      ref={ref}
      className={clsx([
        ["text-info-content", "font-bold"],
        gateBlock.hasBorder ? ["border", "border-gate-operation-border"] : [],
      ])}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "0.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isDragging || disabled ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : disabled ? "not-allowed" : "pointer",
        backgroundColor: gateBlock.backgroundColor,
      }}
    >
      {gateBlock.palletteItem}
    </div>
  );
}
