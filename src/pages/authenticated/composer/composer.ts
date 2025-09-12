import { QuantumGate } from "./gates";

export type Mode = "normal" | "eraser" | "control";
export type ExtendedGate =
  | { _tag: "$controlBit", target: number; from: number, to: number }
  | { _tag: "$controlWire", target: number; from: number, to: number }
  | DummyGate
  | QuantumGate
  ;

export type DummyGate = { _tag: "$dummy"; target: number };
