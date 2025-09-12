import { GateCNOT, GateH, QuantumGate } from "./gates";

export interface QuantumCircuit {
  qubitNumber: number;
  steps: Array<QuantumGate>;
}

