import { ControlledGateTag, QuantumGate } from "./gates";

export type Mode = "normal" | "eraser" | "control";
export type ExtendedGate =
  | { _tag: "$controlBit", baseGateTag: ControlledGateTag, target: number; from: number, to: number }
  | { _tag: "$controlWire", baseGateTag: ControlledGateTag, target: number; from: number, to: number }
  | DummyGate
  | QuantumGate
  ;

export type DummyGate = { _tag: "$dummy"; target: number };
