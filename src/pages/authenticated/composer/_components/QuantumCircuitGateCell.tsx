import { useRef } from "react";
import { ControlWireDirection, Down, QuantumGate, Up } from "../gates";
import QuantumGateElement from "./QuantumGateElement";
import clsx from "clsx";
import { DummyGate } from "../composer";

export type GateCellElement =
  | { readonly _tag: "gate", gate: QuantumGate | DummyGate }
  | { readonly _tag: "controlWire" }
  | { readonly _tag: "controlQubit", directions: ControlWireDirection[] }
  | { readonly _tag: "emptyCell" }
  ;

export const Gate = (gate: QuantumGate | DummyGate): GateCellElement => ({ _tag: "gate", gate });
export const ControlWire: GateCellElement = { _tag: "controlWire" };
export const ControlQubit = (directions: ControlWireDirection[]): GateCellElement => ({
  _tag: "controlQubit",
  directions
});
export const EmptyCell: GateCellElement = { _tag: "emptyCell" };

export type PreviewControl =
  | { _tag: "controlWire" }
  | { _tag: "controlQubit", directions: ("up" | "down")[] }
  | { _tag: "controlledGate", directions: ("up" | "down")[] }
  ;

export interface Props {
  qubitIndex: number;
  timestep: number;
  element: GateCellElement;
  focused: boolean;
  active: boolean;
  isDragging: boolean;
  previewControl: PreviewControl | null;
  onClickGateElement: (qubitIndex: number, timestep: number) => void;
  onClickControlQubit: (qubitIndex: number, timestep: number) => void;
  onClickControlledGate: (qubitIndex: number, timestep: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export default (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { element } = props;

  return (
    <div
      ref={ref}
      className={clsx([
        ["w-full", "h-full", "flex", "items-center", "justify-center"],
        [ "relative"],
      ])}
    >
      {(() => {
        if (props.previewControl?._tag === "controlQubit") {
          return (
            <ControlQubitCell
              isPreview
              isConnectedDown={props.previewControl.directions.includes("down")}
              isConnectedUp={props.previewControl.directions.includes("up")}
              handleClick={() => props.onClickControlQubit(props.qubitIndex, props.timestep)}
            />
          );
        }
        else if (props.previewControl?._tag === "controlWire") {
          return (
            <ControlWireCell isPreview />
          );
        }
        switch (element._tag) {
          case "gate":
            return (
              <>
                <QuantumGateElement
                  isDragging={props.isDragging}
                  gate={element.gate}
                  active={props.active}
                  qubitIndex={props.qubitIndex}
                  timestep={props.timestep}
                  previewDirections={props.previewControl?.directions}
                  onClick={() => props.onClickGateElement(props.qubitIndex, props.timestep)}
                  onDragStart={props.onDragStart}
                  onDragEnd={props.onDragEnd}
                  resetControlGate={
                    () => {
                      if (element.gate._tag === "cnot" || element.gate._tag === "ccnot") {
                        props.onClickControlledGate(props.qubitIndex, props.timestep);
                      }
                    }}
                >
                </QuantumGateElement>
              </>
            )
          case "controlQubit":
            return (
              <ControlQubitCell
                isConnectedDown={element.directions.includes(Down)}
                isConnectedUp={element.directions.includes(Up)}
                handleClick={() => {
                  props.onClickControlQubit(props.qubitIndex, props.timestep)
                }}
              />
            )
          case "controlWire":
            return <ControlWireCell />
        }
      })()
      }
      {
        props.focused
          ? (
            <div
              className={clsx([
                ['absolute', 'top-0', 'left-0'],
                ['w-full', 'h-full'],
                ['flex', 'items-center', 'justify-center']
              ])
              }
            >
              <div
                className={clsx([
                  ['w-[60%]', 'h-[60%]', 'rounded-full'],
                  ['bg-secondary', 'opacity-30']
                ])}
              >
              </div>
            </div>
          ) : null
      }
    </div>
  )
}

export const ControlWireCell = (props: { isPreview?: boolean }) => {
  return (
    <>
      <div
        className="flex-col justify-center h-full"
      >
        <div className="flex justify-center items-center h-full">
          <div
            className={clsx([
              ["bg-gate-controlled w-1 h-full"],
              props.isPreview ? ["opacity-50"] : []
            ])}
          ></div>
        </div>
      </div>
    </>
  )
}

interface ControlQubitCellProps {
  isConnectedUp: boolean;
  isConnectedDown: boolean;
  handleClick: () => void;
  isPreview?: boolean;
}
export const ControlQubitCell = (props: ControlQubitCellProps) => {
  return (
    <>
      <div
        className={clsx([
          ["flex-col", "justify-center", "h-full"],
          props.isPreview ? ["opacity-50"] : []
        ])}
        onClick={(props.handleClick)}
      >
        <div className="flex justify-center items-center h-[24px]">
          {
            props.isConnectedUp
              ? <div className="bg-gate-controlled w-1 h-full"></div>
              : <div className="h-full"></div>
          }
        </div>
        <div
          className="bg-gate-controlled w-[16px] h-[16px] rounded-full"
        >
        </div>
        <div className="flex justify-center items-center h-[24px]">
          {
            props.isConnectedDown
              ? <div className="bg-gate-controlled w-1 h-full"></div>
              : <div className="h-full"></div>
          }
        </div>
      </div>
    </>
  )
}