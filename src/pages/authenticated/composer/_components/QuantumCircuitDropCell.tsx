import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DragGateItem, DragMoveGateItem, FromCanvas, ItemTypeGate, ItemTypeMoveGate } from "../dnd";
import clsx from "clsx";

export type DropCellPart = "left" | "right";

export interface Props {
  qubitIndex: number;
  timestep: number;
  part: DropCellPart;
  holdingControlQubit: false | { targetQubitIndex: number; timestep: number };
  onDragIn: (qubit: number, timestep: number, part: DropCellPart, item: DragGateItem) => void;
  onDrop: (qubit: number, timestep: number, part: DropCellPart, item: DragGateItem) => void;
  onDragControlQubit: (qubit: number, timestep: number, part: DropCellPart) => void;
  onSetControlQubit: (controlQubitIndex: number, timestep: number) => void
}

export default (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const wasOverRef = useRef(false);

  const [{ isOver, item }, drop] = useDrop<DragGateItem, void, { isOver: boolean, item: DragGateItem }>({
    accept: [ItemTypeGate, ItemTypeMoveGate],
    drop: (item) => {
      props.onDrop(props.qubitIndex, props.timestep, props.part, item);
    },  
    collect: (monitor) => ({
      item: monitor.getItem(),
      isOver: monitor.isOver({ shallow: true }),
    })
  });

  useEffect(() => {
    if (ref.current) {
      drop(ref.current);
    }
  }, [ drop ])

  useEffect(() => {
    if (isOver && !wasOverRef.current) {
      // at the first time item drags in
      props.onDragIn(props.qubitIndex, props.timestep, props.part, item)
      wasOverRef.current = true;
    } else if (!isOver && wasOverRef.current) {
      // at the first time drags out
      wasOverRef.current = false;
    }  
  }, [isOver]);

  const handleMouseEnter = () => {
    if (props.holdingControlQubit === false) return;
    props.onDragControlQubit(props.qubitIndex, props.timestep, props.part);
  }

  const handleClick = () => {
    if (props.holdingControlQubit === false) return;
    props.onSetControlQubit(props.qubitIndex, props.timestep)
  }
  return (
    <div
      ref={ref}
      className={clsx([
        ["w-1/2", "h-full"],
        // ["border", props.part == "left" ? "border-status-job-failed" : "border-status-job-succeeded"]
      ])}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
    </div>
  )
}
