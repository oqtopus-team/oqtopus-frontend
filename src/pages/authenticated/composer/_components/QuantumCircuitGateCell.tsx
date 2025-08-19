import { useRef } from "react";
import { ControlledGateTag, ControlWireDirection, Down, QuantumGate, Up } from "../gates";
import QuantumGateElement from "./QuantumGateElement";
import clsx from "clsx";
import { DummyGate } from "../composer";
import { RxCross2 } from "react-icons/rx";

export type GateCellElement =
  | { readonly _tag: "gate", gate: QuantumGate | DummyGate }
  | { readonly _tag: "controlWire", gateTag: ControlledGateTag, }
  | { readonly _tag: "controlQubit", gateTag: ControlledGateTag, directions: ControlWireDirection[] }
  | { readonly _tag: "emptyCell" }
  ;

export const Gate = (gate: QuantumGate | DummyGate): GateCellElement => ({ _tag: "gate", gate });
export const ControlWire = (gateTag: ControlledGateTag): GateCellElement => ({ _tag: "controlWire", gateTag });
export const ControlQubit = (gateTag: ControlledGateTag, directions: ControlWireDirection[]): GateCellElement => ({
  _tag: "controlQubit",
  gateTag,
  directions
});
export const EmptyCell: GateCellElement = { _tag: "emptyCell" };

export type PreviewControl =
  | { _tag: "controlWire", gateTag: ControlledGateTag, }
  | { _tag: "controlQubit", gateTag: ControlledGateTag, directions: ("up" | "down")[] }
  | { _tag: "controlledGate", gateTag: ControlledGateTag, directions: ("up" | "down")[] }
  ;

export interface Props {
  qubitIndex: number;
  timestep: number;
  element: GateCellElement;
  focused: boolean;
  static?: boolean;
  active: boolean;
  selected: boolean;
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
              baseGateTag={props.previewControl.gateTag}
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
                  selected={props.selected}
                  static={props.static}
                  qubitIndex={props.qubitIndex}
                  timestep={props.timestep}
                  previewDirections={props.previewControl?.directions}
                  onClick={() => props.onClickGateElement(props.qubitIndex, props.timestep)}
                  onDragStart={props.onDragStart}
                  onDragEnd={props.onDragEnd}
                  resetControlGate={
                    () => {
                      if (element.gate._tag === "cnot" || element.gate._tag === "ccnot" || element.gate._tag === "cz" || element.gate._tag === "swap") {
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
                baseGateTag={element.gateTag}
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
  baseGateTag: ControlledGateTag;
  isConnectedUp: boolean;
  isConnectedDown: boolean;
  handleClick: () => void;
  isPreview?: boolean;
}
export const ControlQubitCell = (props: ControlQubitCellProps) => {
  switch (props.baseGateTag) {
    case "cnot":
    case "ccnot":
    case "cz":
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
   case "swap":
    return (
        <div className={clsx([props.isPreview ? ["opacity-50"] : []])} onClick={(props.handleClick)}>
          <div
            className={clsx([
              ['relative', 'w-full', 'h-full']
            ])}
          >
            <div
              className={clsx([
                ['absolute', 'top-0', 'left-0', 'z-20'],
                ["w-full", "h-full", "rounded-full"],
                ["flex", "items-center", "justify-center"],
                ["text-center", "align-middle"]
              ])}
            >
              <div
                className={clsx(
                  ["w-[32px]", "h-[32px]"], 
                  ["text-gate-controlled", "font-bold", "text-3xl"],
                  ["flex", "justify-center", "items-center"]
                )}
              >
                <RxCross2 style={{ strokeWidth: 0.5}} />
              </div>
            </div>
          </div>
          {props.isConnectedUp && <div
            className={clsx([
              ['absolute', 'top-0', 'left-0', 'z-10'],
              ["w-full", "h-[32px]"],
              ["flex", "items-center", "justify-center"],
            ])}
          >
            <div
              className={clsx([
                ["bg-gate-controlled", "font-bold"],
                ["text-2xl"],
                ['h-full', 'w-1']
              ])}
            />
          </div>}
          {props.isConnectedDown && <div
            className={clsx([
              ['absolute', 'bottom-0', 'left-0', 'z-10'],
              ["w-full", "h-[32px]"],
              ["flex", "items-center", "justify-center"],
            ])}
          >
            <div
              className={clsx([
                ["bg-gate-controlled", "font-bold"],
                ["text-2xl"],
                ['h-full', 'w-1']
              ])}
            />
          </div>}
        </div>
      );
  }
}