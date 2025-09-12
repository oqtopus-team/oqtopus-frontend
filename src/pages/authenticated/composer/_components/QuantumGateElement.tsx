import clsx, { ClassValue } from "clsx";
import { ControlWireDirection, Down, QuantumGate, Up, labelOfGate } from "../gates";
import { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { DragMoveGateItem, FromCanvas, ItemTypeGate, ItemTypeMoveGate } from "../dnd";
import { DummyGate } from "../composer";

interface Props {
  qubitIndex: number;
  timestep: number;
  gate: QuantumGate | DummyGate;
  isDragging: boolean;
  static?: boolean;
  active: boolean;
  previewDirections?: ("up" | "down")[];
  onClick: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  resetControlGate?: () => void
}

interface ControlledGateProps {
  label: string;
  wireDirections: ControlWireDirection[];
  previewWire: boolean;
  resetControlGate?: () => void;
  onClick?: () => void;
  static?: boolean;
}

const ControlledGate = (props: ControlledGateProps) => {
  return (
    <div
      className={clsx([
        ['relative', 'w-full', 'h-full']
      ])}
      onClick={() => {
        props.onClick?.();
        props.resetControlGate?.();
      }}
    >
      <div
        className={clsx([
          ['absolute', 'top-0', 'left-0', 'z-20'],
          ["w-full", "h-full", "rounded-full"],
          ["flex", "items-center", "justify-center"],
          ["bg-gate-controlled", "text-center", "align-middle"]
        ])}
      >
        <span
          className={clsx([
            ["text-primary-content", "font-bold"],
            ["text-2xl"]
          ])}
        >
          +
        </span>
      </div>
      {props.wireDirections.includes(Up)
        ? (
          <div
            className={clsx([
              ['absolute', 'top-[-12px]', 'left-0', 'z-10'],
              ["w-full", "h-[12px]"],
              ["flex", "items-center", "justify-center"],
              props.previewWire ? ["opacity-50"] : []
            ])}
          >
            <div
              className={clsx([
                ["bg-gate-controlled", "font-bold"],
                ["text-2xl"],
                ['h-full', 'w-1']
              ])}
            />
          </div>
        )
        : <></>
      }
      {props.wireDirections.includes(Down)
        ? (
          <div
            className={clsx([
              ['absolute', 'bottom-[-12px]', 'left-0', 'z-10'],
              ["w-full", "h-[12px]"],
              ["flex", "items-center", "justify-center"],
              props.previewWire ? ["opacity-50"] : []
            ])}
          >
            <div
              className={clsx([
                ["bg-gate-controlled", "font-bold"],
                ["text-2xl"],
                ['h-full', 'w-1']
              ])}
            />
          </div>
        )
        : <></>
      }
    </div>
  )
}

export default function QuantumGateElement(props: Props) {
  const gate = props.gate
  const ref = useRef<HTMLDivElement>(null);
  const executedRef = useRef(false)
  const [{ isDragging }, drag, preview] = useDrag<DragMoveGateItem, void, { isDragging: boolean }>(() => ({
    type: ItemTypeMoveGate,
    item: {
      type: ItemTypeMoveGate,
      from: FromCanvas,

      sourceQubit: props.qubitIndex,
      sourceTimestep: props.timestep,
    },
    end: () => {
      props.onDragEnd?.();
      executedRef.current = false;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }))

  useEffect(() => {
    if (ref.current && props.static === false) {
      drag(ref.current);
    }
  }, [drag])

  useEffect(() => {
    if (isDragging && executedRef.current == false) {
      props.onDragStart?.();
      executedRef.current = true;
    }
  }, [isDragging])

  return (
    <div
      ref={ref}
      className={clsx([
        ["w-10", "h-10"],
        ["text-primary-content"],
        ["transition-all", "duration-300"],
        props.static === true
          ? []
          : [props.isDragging ? "cursor-grabbing" : "cursor-pointer"],
        [props.isDragging ? "opacity-50" : "opacity-100"],
        props.active ? ["shadow-md", "ring-4", "ring-primary", "ring-opacity-50"] : []
      ])}
    >
      {
        (() => {
          switch (gate._tag) {
            case "x":
            case "y":
            case "z":
            case "h":
            case "s":
            case "t":
            case "i":
              return (
                <div
                  className={clsx([
                    ["w-full", "h-full", "rounded",],
                    ["flex", "items-center", "justify-center"],
                    props.isDragging ? ["opacity-50"] : [],
                    ["bg-gate-atomic", "text-center", "align-middle"]
                  ])}
                  onClick={props.onClick}
                >
                  <span
                    className={clsx([
                      ["text-primary-content", "font-bold"],
                      ["text-xl"]
                    ])}
                  >
                    {labelOfGate(gate)}
                  </span>
                </div>
              )
            // parameterized gates
            case "rx":
            case "ry":
            case "rz":
              return (
                <div
                  className={clsx([
                    ["w-full", "h-full", "rounded",],
                    ["flex", "flex", "items-center", "justify-center"],
                    ["bg-gate-parametrized"],
                  ])}
                  onClick={props.onClick}
                >
                  <span
                    className={clsx([
                      ["text-primary-content", "font-bold"],
                      ["text-xs"]
                    ])}
                  >
                    {labelOfGate(gate)}
                  </span>
                  <span
                    className={clsx([
                      ["text-primary-content"],
                      ["text-xs"]
                    ])}
                  >
                    (θ)
                  </span>
                </div>
              )


            case "cnot":
              const cnotWireDirections = (() => {
                return [
                  (props.previewDirections?.includes("up") || gate.control < gate.target) ? [Up] : [],
                  (props.previewDirections?.includes("down") || gate.control > gate.target) ? [Down] : []
                ].flat() as ControlWireDirection[]
              })()
              return (
                <ControlledGate
                  wireDirections={cnotWireDirections}
                  previewWire={props.previewDirections !== undefined}
                  label="+"
                  onClick={props.onClick}
                  resetControlGate={props.resetControlGate}
                />
              );
            case "ccnot":
              const ccnotWireDirections = (() => {
                return [
                  (props.previewDirections?.includes("up") || gate.control1 < gate.target || gate.control2 < gate.target) ? [Up] : [],
                  (props.previewDirections?.includes("down") || gate.control1 > gate.target || gate.control2 > gate.target) ? [Down] : []
                ].flat() as ControlWireDirection[]
              })()
              return (
                <ControlledGate
                  wireDirections={ccnotWireDirections}
                  label="+"
                  previewWire={props.previewDirections !== undefined}
                  resetControlGate={props.resetControlGate}
                />
              );
          }

        })()
      }
    </div>
  )
}
