import { QuantumGate } from "./gates"

export type Observable = {
  qubitNumber: number;
  operators: QuantumGate[][];
  coeffs: number[];
}

export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length == 0) return [];
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))
} 