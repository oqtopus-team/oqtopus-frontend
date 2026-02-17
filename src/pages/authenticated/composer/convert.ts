// This module defines some functions to convert OQTOPUS Composer's quantum circuit data 
// into ones which are expected by Qulacs WASM Simulator.

import { PauliGateType, WasmOneControlOneTargetGateData, WasmOneQubitGateData, WasmOneQubitRotationGateData, WasmPauliGateData, WasmQuantumGateData } from "qulacs-wasm-simulator-client";
import * as QulacsWasmClientType from "qulacs-wasm-simulator-client/lib/main/client/QulacsSimulatorAppClient/ClientType";
import { QuantumGate } from "./gates";
import { QuantumCircuit } from "./circuit";
import { ComposerGate } from "./composer";
import { Observable } from "./observable";
import { JobsOperatorItem } from "@/api/generated";

export const convertCircuit = (circuit: QuantumCircuit, qubitNumber: number): QulacsWasmClientType.CircuitInfo => {
  const maxDepth = circuit[0]?.length ?? 0;
  const circuitSteps = [...new Array(maxDepth)]
    .map((_, s) => {
      const step = circuit.map(wire => wire[s]);
      return step.flatMap(convertComposerGate);
    }); 
  return {
    size: qubitNumber,
    circuit: circuitSteps
  };
};

export const convertObservable = (
  observable: JobsOperatorItem[],
  qubitNumber: number
): QulacsWasmClientType.ObservableInfo => {
  return {
    observable: observable.map((operatorItem) => {
      return {
        coefficient: operatorItem.coeff ?? 0,
        operators: parsePauliString(operatorItem.pauli, qubitNumber),
      }
    }),
  }
}

const parsePauliGateType = (op: string): undefined | PauliGateType => {
  switch (op) {
    case "i": return PauliGateType.I;
    case "x": return PauliGateType.X;
    case "y": return PauliGateType.Y;
    case "z": return PauliGateType.Z;
  }
}

export const parsePauliString = (pauli: string, qubitNumber: number): PauliGateType[] => {
  const step = (inp: string, parsed: PauliGateType[]) => {
    if (inp == "") return parsed; 
    const op = inp.slice(0, 1);
    const idx = inp.slice(1, 2);
    const tl = inp.slice(2);
    const parsedOp = parsePauliGateType (op.toLowerCase());
    if (!parsedOp) {
      throw new Error("Unexpected Pauli operator string.")
    }
    const parsedIdx = Number(idx);
    if (isNaN(parsedIdx) || parsedIdx > qubitNumber) {
      throw new Error("Unexpected Pauli operator index");
    } 
    const next = parsed.slice();
    next[parsedIdx] = parsedOp; 
    return step(tl, next);
  }
  return step(pauli.trim(), [])
};
export const convertComposerGate = (gate: ComposerGate): WasmQuantumGateData[] => {
  switch (gate._tag) {
    case "emptyCell": return [["i", gate.row]];
    case "multiRowGateBlock": return [["i", gate.row]];
    case "multiRowGateEmptyBlock": return [["i", gate.row]];
    case "$custom_gate": throw new Error("Custom gates are not supported.");
  }
  return [convertQuantumGate(gate)];
}
export const convertQuantumGate = (gate: QuantumGate): WasmQuantumGateData => { 
  switch (gate._tag) {
    // In the cases of non-parametric one-qubit gates:
    case "i":
    case "x":
    case "y":
    case "z":
      return [gate._tag, gate.targets[0]] as WasmPauliGateData;      
    case "h":
    case "s":
    case "sx":
    case "t":
    case "tdg":
    case "sdg":
      return [gate._tag, gate.targets[0]] as WasmOneQubitGateData;
    
    // In the cases of parametric one-qubit gates:
    case "rx":
      return ["rx", gate.targets[0], -1 * gate.rotationAngle] as WasmOneQubitRotationGateData;
    case "ry":
      return ["ry", gate.targets[0], -1 * gate.rotationAngle] as WasmOneQubitRotationGateData;
    case "rz":
      return ["rz", gate.targets[0], -1 * gate.rotationAngle] as WasmOneQubitRotationGateData;

    // In the cases of controlled gates: 
    case "cx":
      return ["cnot", gate.targets[0], gate.controls[0]] as WasmOneControlOneTargetGateData;
    case "cz":
      return ["cz", gate.targets[0], gate.controls[0]] as WasmOneControlOneTargetGateData;
    default:
      throw new Error("Unsupported gate type.");
  }
}
