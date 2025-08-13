import clsx, { ClassValue } from "clsx";
import { DaggerGateTag, getDaggerGateBaseLabel, QuantumGate } from "../gates";
import QuantumGatePaletteItem from "./QuantumGatePaletteItem";
import { Mode } from "../composer";
import "./Composer.css";

interface AtomicGateProps {
  label: string;
  classes: ClassValue[];
}

const AtomicGate = (props: AtomicGateProps) => {
  return (
    <div
      className={clsx([
        ["flex", "items-center", "justify-center"],
        ["w-10", "h-10", "rounded"],
        props.classes
      ])}
    >
      <div
        className={clsx([
          ["text-info-content", "font-bold"]
        ])}
      >
        {props.label.toUpperCase()}
      </div>
    </div>
  )
}

const DaggerGate = ({ tag }: { tag: DaggerGateTag }) => {
  return (
    <div
      className={clsx([
        ["flex", "items-center", "justify-center"],
        ["w-10", "h-10", "rounded"],
        ["bg-gate-atomic"]
      ])}
    >
      <div
        className={clsx([
          ["text-info-content", "font-bold"],
          ["dagger-gate"]
        ])}
      >
        {getDaggerGateBaseLabel(tag)}
      </div>
    </div>
  )
}

const CNotGate = () => {
  return (
    <div
      className={clsx([
        "w-10", "h-10", "rounded",
        "flex", "justify-center", "items-center", "p-1",
        "bg-gate-controlled",
      ])}
    >
      <img
        src={`/img/composer/gate-cnot.svg`}
        className="h-full w-auto object-contain"
      />
    </div>
  )
}

const CCNotGate = () => {
  return (
    <div
      className={clsx([
        "w-10", "h-10", "rounded",
        "flex", "justify-center", "items-center", "p-1",
        "bg-gate-controlled",
      ])}
    >
      <img
        src={`/img/composer/gate-ccnot.svg`}
        className="h-full w-auto object-contain"
      />
    </div>
  )
}

const CZGate = () => {
  return (
    <div
      className={clsx([
        "w-10", "h-10", "rounded",
        "flex", "justify-center", "items-center", "p-1",
        "bg-gate-controlled",
      ])}
    >
      <img
        src={`/img/composer/gate-cz.svg`}
        className="h-full w-auto object-contain"
      />
    </div>
  )
}

const SwapGate = () => {
  return (
    <div
      className={clsx([
        "w-10", "h-10", "rounded",
        "flex", "justify-center", "items-center", "p-1",
        "bg-gate-controlled",
      ])}
    >
      <img
        src={`/img/composer/gate-swap.svg`}
        className="h-full w-auto object-contain"
      />
    </div>
  )
}

const BarrierGate = () => {
  return (
    <div
        className={clsx([
          ["flex", "items-center", "justify-center"],
          ["w-10", "h-10", "rounded"],
          ['border', 'border-gate-operation-border'],
        ])}
      >
        <img
          className="p-2"
          src={`/img/composer/barrier.svg`}
        />
      </div>
  )
}

export interface QuantumGatePaletteProps {
  supportedGates: QuantumGate["_tag"][];
  mode: Mode;
  toggleMode: (m: Mode) => () => void
  onDragStart: (gate: QuantumGate["_tag"]) => void;
  onDragEnd: () => void;
}

export default (props: QuantumGatePaletteProps) => {
  return (
    <div
      className={clsx([
        "flex gap-1"
      ])}
    >
      {
        props.supportedGates.map((gateTag) => {
          switch (gateTag) {
            case "x":
            case "y":
            case "z":
            case "h":
            case "t":
            case "s":
            case "sx":
            case "i":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode !== "normal"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <AtomicGate
                    label={gateTag}
                    classes={["bg-gate-atomic"]}
                  />
                </QuantumGatePaletteItem>
              )
            case "sdg":
            case "tdg":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode !== "normal"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <DaggerGate tag={gateTag} />
                </QuantumGatePaletteItem>
              )
            case "cnot":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode == "eraser"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <CNotGate
                  />
                </QuantumGatePaletteItem>
              )
            case "ccnot":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode != "normal"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <CCNotGate
                  />
                </QuantumGatePaletteItem>
              )
            case "cz":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode == "eraser"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <CZGate />
                </QuantumGatePaletteItem>
              )
            case "swap":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode == "eraser"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <SwapGate />
                </QuantumGatePaletteItem>
              )
            case "rx":
            case "ry":
            case "rz":
              return (
                <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode == "eraser"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <AtomicGate
                    label={gateTag}
                    classes={["bg-gate-parametrized"]}
                  />
                </QuantumGatePaletteItem>
              )
            case "barrier":
              return <QuantumGatePaletteItem
                  gateTag={gateTag}
                  key={gateTag}
                  disabled={props.mode !== "normal"}
                  onDragStart={() => props.onDragStart(gateTag)}
                  onDragEnd={props.onDragEnd}
                >
                  <BarrierGate />
                </QuantumGatePaletteItem>
            default:
              return null;
          }
        })
      }
      <div
        className={clsx([
          ["flex", "items-center", "justify-center"],
          ["w-10", "h-10", "rounded"],
          ['cursor-pointer'],
          ['border', 'border-gate-operation-border'],
          props.mode == "eraser" ? ['bg-gate-operation-enabled'] : []
        ])}
        onClick={props.toggleMode("eraser")}
      >
        <img
          className="p-2"
          src={`/img/composer/eraser.svg`}
        />
      </div>
    </div>
  )
}