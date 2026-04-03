import { JobsS3OperatorItem } from '@/api/generated';
import { ComposerGate } from './composer';
import { parsePauliString } from './convert';
import { roundNumber } from './misc';

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

export const renderObservableExprComponent = (
  observable: JobsS3OperatorItem[],
  qubitNumber: number,
): string[] => {
  return observable.flatMap(({ pauli, coeff }) => {
    const operators = parsePauliString(pauli, qubitNumber);
    if (!coeff) return [];
    const renderedOperators = operators.map(op => `\\hat{${op.toUpperCase()}}`).join('\\otimes');
    const roundedCoeff = roundNumber(coeff, 5);
    return roundedCoeff == 1 
      ? [ `${renderedOperators}`]
      : [ `${coeff}\\;${renderedOperators}` ];
  });
}

export const isZeroOperator = (operator: JobsS3OperatorItem[]): boolean => {
  return operator.length <= 0;
}

export const mkZeroOperator = (qubitNumber: number): JobsS3OperatorItem[] => {
  return [{
    coeff: 0,
    pauli: [...new Array(qubitNumber)].map((_, i) => `I${i}`).join(""),
  }]
}

export const renderObservableExpr = (
  observable: JobsS3OperatorItem[],
  qubitNumber: number,
  combinator: string = '\\ +\\ '
): string => {
  const components = renderObservableExprComponent(observable, qubitNumber);
  return components.length > 0   
    ? components.join(combinator)
    : "\\hat{0}";
}