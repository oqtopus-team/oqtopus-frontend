import { ComposerGate } from './composer';

export type Observable = {
  operators: ComposerGate[][];
  coeffs: number[];
};

export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length == 0) return [];
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

export function filterEmptyRowsAfterLastGate(circuit: ComposerGate[][]): ComposerGate[][] {
  return circuit.slice(0, circuit.findLastIndex((r) => r.some((g) => g._tag !== 'emptyCell')) + 1);
}
