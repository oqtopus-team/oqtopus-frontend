import { createEmptyCircuit, insertGatePart, QuantumCircuit } from './circuit';
import { createComposerGate, getMaxGateRow, isDummyGate, RealComposerGate } from './composer';
import { GateDefinition } from './custom_gates';
import { GateTag, isCustomGate, isParametrizedGate } from './gates';

export function generateQASMCode(
  circuit: QuantumCircuit,
  gateDefinitions: GateDefinition[]
): string {
  const rowCount = circuit.length;
  const columnCount = circuit[0]?.length ?? 0;

  const circuitJSONString = JSON.stringify({
    qubitNumber: rowCount,
    columns: columnCount,
    circuit: circuit.map((circuitRow) =>
      circuitRow.filter((g) => !isDummyGate(g)).map((g) => toGateData(g as RealComposerGate))
    ),
  });

  const codeLines = [
    '// Sent from OQTOPUS composer',
    `// ${circuitJSONString}`,
    'OPENQASM 3;',
    'include "stdgates.inc"',
    ...mapGateDefinitionsToCode(gateDefinitions),
    `qubit[${rowCount}] q;`,
    `bit[${rowCount}] c;`,
  ];

  for (let c = 0; c < columnCount; ++c) {
    for (let r = 0; r < rowCount; ++r) {
      const gate = circuit[r][c];
      if (isDummyGate(gate)) continue;

      if (isParametrizedGate(gate)) {
        codeLines.push(`${gate._tag}(${gate.rotationAngle}) q[${gate.targets[0]}];`);
      } else if (isCustomGate(gate)) {
        codeLines.push(
          `${gate.customTag} ${[...gate.controls, ...gate.targets].map((v) => `q[${v}]`).join(', ')};`
        );
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

export function mapGateDefinitionsToCode(definitions: GateDefinition[]): string[] {
  const result: string[] = [];
  for (const def of definitions) {
    const paramsString = def.params.join(', ');
    result.push(`gate ${def.name} ${paramsString} {`);

    def.singleGateParams.forEach((gateParams) => {
      const paramsString = gateParams.params.join(', ');

      const tag = 'customTag' in gateParams ? gateParams.customTag : gateParams._tag;
      const rotationAngleString =
        'rotationAngle' in gateParams ? `(${gateParams.rotationAngle})` : '';

      result.push(`  ${tag}${rotationAngleString} ${paramsString};`);
    });

    result.push('}');
  }
  return result;
}

type GateData = {
  _tag: GateTag;
  row: number;
  column: number;
  targets: number[];
  controls: number[];
  rotationAngle?: number;
  customTag?: string;
};

function toGateData(g: RealComposerGate): GateData {
  const { _tag, row, column, targets, controls } = g;

  if (isParametrizedGate(g)) {
    return { _tag, row, column, targets, controls, rotationAngle: g.rotationAngle };
  } else if (isCustomGate(g)) {
    return { _tag, row, column, targets, controls, customTag: g.customTag };
  } else {
    return { _tag, row, column, targets, controls };
  }
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

        if (composerGate._tag === '$custom_gate' && gate.customTag) {
          composerGate.customTag = gate.customTag;
        }

        if (isParametrizedGate(composerGate) && gate.rotationAngle) {
          composerGate.rotationAngle = gate.rotationAngle;
        }

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
