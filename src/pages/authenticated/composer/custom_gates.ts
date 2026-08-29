import { getNonEmptyGatesRows } from './circuit';
import { createComposerGate, RealComposerGate } from './composer';
import {
  controlledGates,
  CustomGateTag,
  isCustomGate,
  isParametrizedGate,
  ParametrizedGateTag,
  RegularGateTag,
} from './gates';

type RegularGateParams = {
  _tag: RegularGateTag;
};

type ParametrizedGateParams = {
  _tag: ParametrizedGateTag;
  rotationAngle: number;
};

type CustomGateParams = {
  _tag: CustomGateTag;
  customTag: string;
};

export type GateParams = (RegularGateParams | ParametrizedGateParams | CustomGateParams) & {
  params: string[];
};

export type GateDefinition = {
  name: string;
  params: string[];
  singleGateParams: GateParams[];
};

// generate param names from a to z, in case letters would repeat it will create names like a1, b1 etc.
export function* paramNameGenerator(): Generator<string> {
  let charCode = 'a'.charCodeAt(0);
  let charRepeatCount = 0;

  while (true) {
    let name = String.fromCharCode(charCode);
    if (charRepeatCount > 0) name += String(charRepeatCount);

    yield name;

    charCode++;
    if (charCode > 'z'.charCodeAt(0)) {
      charCode = 'a'.charCodeAt(0);
      charRepeatCount++;
    }
  }
}

// Regex to enforce gate names starting with letter or underscore, and containing only letters, digits and '_'
const customGateNameRegex = /^(([a-z]|[A-Z]|\_){1}([a-z]|[A-Z]|[0-9]|\_)*)$/;
export function isGateNameValid(gateName: string): boolean {
  return customGateNameRegex.test(gateName);
}

export function mapCustomGateRowsToParamsNames(rows: Set<number>): Record<number, string> {
  const generateParamName = paramNameGenerator();
  const sortedRows = Array.from(rows).sort((r1, r2) => r1 - r2);

  return sortedRows.reduce<Record<number, string>>((result, row) => {
    result[row] = generateParamName.next().value;
    return result;
  }, {});
}

export function createGateParams(
  gates: RealComposerGate[],
  rowParamMap: Record<number, string>
): GateParams[] {
  return gates.map((g) => convertGateToGateParams(g, rowParamMap));
}

function convertGateToGateParams(
  g: RealComposerGate,
  rowParamMap: Record<number, string>
): GateParams {
  const params = [...g.controls, ...g.targets].map((r) => rowParamMap[r]);

  if (isCustomGate(g)) {
    return { _tag: g._tag, params, customTag: g.customTag };
  }

  if (isParametrizedGate(g)) {
    return { _tag: g._tag, params, rotationAngle: g.rotationAngle };
  }

  return { _tag: g._tag, params };
}

export function collectAllGatesFromCustomGate(
  customGate: RealComposerGate,
  def: GateDefinition
): RealComposerGate[] {
  const gates: RealComposerGate[] = [];
  for (const gateParams of def.singleGateParams) {
    // param's indices and custom gate's targets are in the same order, so from that
    // we may determine which rows of the custom gate the given gate occupies
    const rows = gateParams.params.map((p) => customGate.targets[def.params.indexOf(p)]);
    const minRow = Math.min(...rows);

    // determine the column to which we should insert the given gate
    // we look for all rows that the gate occupies and find the highest free cell
    // among the gates created from the specific custom gate
    let column = customGate.column;
    for (const g of gates) {
      for (const r of getNonEmptyGatesRows(g)) {
        if (rows.includes(r) && column <= g.column) column = g.column + 1;
      }
    }

    const gateToAdd = createComposerGate(gateParams._tag, minRow, column);

    if (controlledGates.includes(gateToAdd._tag)) {
      gateToAdd.controls = [rows[0]];
      gateToAdd.targets = [rows[1]];
    } else {
      gateToAdd.targets = rows;
    }

    if (gateToAdd._tag === '$custom_gate' && 'customTag' in gateParams) {
      gateToAdd.customTag = gateParams.customTag;
    } else if (isParametrizedGate(gateToAdd) && 'rotationAngle' in gateParams) {
      gateToAdd.rotationAngle = gateParams.rotationAngle;
    }

    gates.push(gateToAdd);
  }

  return gates;
}
