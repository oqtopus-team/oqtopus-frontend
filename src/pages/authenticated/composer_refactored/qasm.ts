import { createEmptyCircuit, insertGatePart, QuantumCircuit } from './circuit';
import { createComposerGate, getMaxGateRow, isDummyGate, RealComposerGate } from './composer';
import { GateTag, isParametrizedGate, QuantumGate } from './gates';
import { gateRenderingBlockMap } from './gates_rendering/Gates';

export function generateQASMCode(circuit: QuantumCircuit): string {
  const rowCount = circuit.length;
  const columnCount = circuit[0]?.length ?? 0;

  const circuitJSONString = JSON.stringify({
    qubitNumber: rowCount,
    columns: columnCount,
    circuit: circuit.map((circuitRow) => circuitRow.filter((g) => !isDummyGate(g)).map(toGateData)),
  });

  const codeLines = [
    '// Sent from OQTOPUS composer',
    `// ${circuitJSONString}`,
    'OPENQASM 3;',
    'include "stdgates.inc"',
    `qubit[${rowCount}] q;`,
    `bit[${rowCount}] c;`,
  ];

  for (let c = 0; c < columnCount; ++c) {
    for (let r = 0; r < rowCount; ++r) {
      const gate = circuit[r][c];
      if (isDummyGate(gate)) continue;

      if (isParametrizedGate(gate)) {
        codeLines.push(`${gate._tag}(${gate.rotationAngle}) q[${gate.targets[0]}];`);
      } else {
        codeLines.push(
          `${gate._tag} ${[...gate.controls, ...gate.targets].map((v) => `q[${v}]`).join(', ')};`
        );
      }
    }
  }

  codeLines.push('');
  codeLines.push(`c = measure q;`);

  return codeLines.join('\n');
}

type GateData = {
  _tag: GateTag;
  row: number;
  column: number;
  targets: number[];
  controls: number[];
  rotationAngle?: number;
};

function toGateData(g: RealComposerGate): GateData {
  const { _tag, row, column, targets, controls } = g;

  return isParametrizedGate(g)
    ? { _tag, row, column, targets, controls, rotationAngle: g.rotationAngle }
    : { _tag, row, column, targets, controls };
}

export function parseCircuitJSON(circuitJSON: string): QuantumCircuit | undefined {
  try {
    const { qubitNumber, columns, circuit } = JSON.parse(circuitJSON);

    const parsedCircuit = createEmptyCircuit(qubitNumber, columns);

    for (const circuitRow of circuit as GateData[][]) {
      for (const gate of circuitRow) {
        const composerGate = createComposerGate(gate._tag, gate.row, gate.column);
        composerGate.targets = gate.targets;
        composerGate.controls = gate.controls;

        parsedCircuit[gate.row][gate.column] = composerGate;

        const maxRow = getMaxGateRow(composerGate);
        for (let r = gate.row + 1; r <= maxRow; ++r) {
          insertGatePart(parsedCircuit, composerGate, r, gate.column);
        }
      }
    }

    return parsedCircuit;
  } catch (e: any) {
    console.error('failed to parse quantum circuit');
  }
}
