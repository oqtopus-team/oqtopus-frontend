// This module defines some functions to convert OQTOPUS Composer's quantum circuit data 
// into ones which are expected by Qulacs WASM Simulator.

import { PauliGateType, WasmOneControlOneTargetGateData, WasmOneQubitGateData, WasmOneQubitRotationGateData, WasmPauliGateData, WasmQuantumGateData } from "qulacs-wasm-simulator-client";
import * as QulacsWasmClientType from "qulacs-wasm-simulator-client/lib/main/client/QulacsSimulatorAppClient/ClientType";
import * as P from "./parser/observable/parser";
import { QuantumGate } from "./gates";
import { QuantumCircuit } from "./circuit";
import { ComposerGate } from "./composer";
import { JobsS3OperatorItem } from "@/api/generated";

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
  observable: JobsS3OperatorItem[],
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

export const parsePauliString = (pauli: string, qubitNumber: number): PauliGateType[] => {
  const parseResult = P.parseObservable(pauli);
  switch (parseResult._tag) {
    case "ParseOk":
      const gates = parseResult.value;
      if (gates.length > qubitNumber) {
        // TODO: better error handling 
        throw new Error("incorrect qubit index")
      }
      return gates;
    case "ParseFail":
      throw new Error(parseResult.value);
  }

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
    case "t":
      return [gate._tag, gate.targets[0]] as WasmOneQubitGateData;

      // Following gates are not supported by Qulacs simulator!
    case "sx":
      // return ["sqrtx", gate.targets[0]] as unknown as WasmOneQubitGateData;
    case "tdg":
      // return ["tdag", gate.targets[0]] as unknown as WasmOneQubitGateData;
    case "sdg":
      // return ["sdag", gate.targets[0]] as unknown as WasmOneQubitGateData;
      throw new Error("Unsupported gate type.")    
    // In the cases of parametric one-qubit gates:
    case "rx":
      return ["rx", gate.targets[0], (-1) * gate.rotationAngle] as WasmOneQubitRotationGateData;
    case "ry":
      return ["ry", gate.targets[0], (-1) * gate.rotationAngle] as WasmOneQubitRotationGateData;
    case "rz":
      return ["rz", gate.targets[0], (-1) * gate.rotationAngle] as WasmOneQubitRotationGateData;

    // In the cases of controlled gates: 
    case "cx":
      return ["cnot", gate.targets[0], gate.controls[0]] as WasmOneControlOneTargetGateData;
    case "cz":
      return ["cz", gate.targets[0], gate.controls[0]] as WasmOneControlOneTargetGateData;
    default:
      throw new Error("Unsupported gate type.");
  }
}
