import { createQuantumGate, GateTag, QuantumGate } from './gates';
import { GateRenderingBlock, gateRenderingBlockMap } from './gates_rendering/Gates';

export type Mode = 'normal' | 'eraser' | 'control';

export const ItemTypeNewGate = 'NEW_GATE' as const;
export const ItemTypeMoveGate = 'MOVE_GATE' as const;

type EmptyCellGate = { _tag: 'emptyCell' };

// multiRowGateBlock is used for all cells (except main gate cell) occupied by any gate's control or target
// or the wire connecting controls and targets of the given gate
//
// multiRowGateEmptyBlock is used specifically for empty spots between barrier targets
type MultiRowGatePart = { _tag: 'multiRowGateBlock' | 'multiRowGateEmptyBlock'; baseId: number };

export const nonInteractiveGates: ComposerGate['_tag'][] = [
  'emptyCell',
  'multiRowGateBlock',
  'multiRowGateEmptyBlock',
];

type ComposerObject = {
  readonly id: number;
  row: number;
  column: number;
};

export type RealComposerGate = QuantumGate & GateRenderingBlock & ComposerObject;
export type DummyComposerGate = (EmptyCellGate | MultiRowGatePart) & ComposerObject;

export type ComposerGate = RealComposerGate | DummyComposerGate;

export type DragGateItem = {
  type: typeof ItemTypeNewGate | typeof ItemTypeMoveGate;
  gate: RealComposerGate;
  isCreated: boolean;
};

const generateID = idGenerator();

function* idGenerator(): Generator<number> {
  let idCount = 0;
  while (true) {
    if (idCount === Number.MAX_SAFE_INTEGER) idCount = 0;
    yield ++idCount;
  }
}

export function createComposerGate(tag: GateTag, row: number, column: number): RealComposerGate {
  const quantumGate = createQuantumGate(tag);
  const block = gateRenderingBlockMap[tag];

  const gate: RealComposerGate = {
    ...quantumGate,
    ...block,
    id: generateID.next().value,
    row,
    column,
    controls: [],
    targets: [],
  };

  switch (quantumGate._tag) {
    case 'cx':
    case 'cz':
      gate.controls.push(row);
      gate.targets.push(row + 1);
      break;
    case 'swap':
      gate.targets.push(row, row + 1);
      break;
    default:
      gate.targets.push(row);
      break;
  }

  return gate;
}

export function copyGate(g: RealComposerGate): RealComposerGate {
  return {
    ...g,
    id: generateID.next().value,
    targets: [...g.targets],
    controls: [...g.controls],
  };
}

export function emptyCell(row: number, column: number): ComposerGate {
  return {
    _tag: 'emptyCell',
    id: generateID.next().value,
    row,
    column,
  };
}

export function multiQubitGateBlock(baseId: number, row: number, column: number): ComposerGate {
  return {
    _tag: 'multiRowGateBlock',
    id: generateID.next().value,
    baseId,
    row,
    column,
  };
}

export function multiQubitGateEmptyBlock(
  baseId: number,
  row: number,
  column: number
): ComposerGate {
  return {
    _tag: 'multiRowGateEmptyBlock',
    id: generateID.next().value,
    baseId,
    row,
    column,
  };
}

export function isDummyGate(g: ComposerGate): g is DummyComposerGate {
  return nonInteractiveGates.includes(g._tag);
}

export function isPartOfMultiQubitGate(g: ComposerGate): boolean {
  switch (g._tag) {
    case 'emptyCell':
      return false;
    case 'multiRowGateBlock':
    case 'multiRowGateEmptyBlock':
      return true;
    default:
      return g.targets.length + g.controls.length > 1;
  }
}

export function getMaxGateRow(g: RealComposerGate): number {
  if (g.targets.length === 0 && g.controls.length === 0) {
    throw new Error('composer gate must have at least one control or target');
  }

  return Math.max(...g.targets, ...g.controls);
}

export function hasQubitOnRow(g: RealComposerGate, q: number): boolean {
  return g.targets.includes(q) || g.controls.includes(q);
}

export function getGateHeight(g: RealComposerGate): number {
  const minRow = Math.min(...g.targets, ...g.controls);
  const maxRow = Math.max(...g.targets, ...g.controls);
  return maxRow - minRow + 1;
}
