import { createContext } from 'react';
import {
  ComposerGate,
  copyGate,
  createComposerGate,
  emptyCell,
  getGateHeight,
  getMaxGateRow,
  hasQubitOnRow,
  isDummyGate,
  isPartOfMultiQubitGate,
  Mode,
  multiQubitGateBlock,
  multiQubitGateEmptyBlock,
  RealComposerGate,
} from './composer';
import { isMultiQubitGate, QuantumGate } from './gates';
import { collectAllGatesFromCustomGate, GateDefinition } from './custom_gates';
import { Reactive, ReactiveCallback, Unsubscribe } from './reactive';

export type QuantumCircuit = ComposerGate[][];

type GateMoveCallback = (row: number, cell: number, targets: number[], controls: number[]) => void;

type MultiGateSelector =
  | { kind: 'none' }
  | { kind: 'touch' }
  | { kind: 'mouse'; x1: number; y1: number; x2: number; y2: number };

export const circuitContext = createContext({} as QuantumCircuitService);

export class QuantumCircuitService {
  private _circuit: Reactive<QuantumCircuit>;
  private _supportedGates: ReadonlyArray<QuantumGate['_tag']>;
  private _mode: Reactive<Mode> = new Reactive<Mode>('normal');
  private _controlModeProgress = 0;

  private _customGates: Record<string, GateDefinition> = {};
  private _isCustomGateModalOpen: Reactive<boolean> = new Reactive(false);

  private _draggedGates = new Reactive<RealComposerGate[]>([]);
  private _selectedGates = new Reactive<RealComposerGate[]>([]);
  private _multiGateSelector = new Reactive<MultiGateSelector>({ kind: 'none' });
  private prevHoverCoords: { row: number; column: number } = { row: -1, column: -1 };

  private _isObservableCircuit = false;
  private handleRemoveGate = removeGate;
  private handleAddGate = addGate;

  constructor(
    rows = 2,
    columns = 3,
    supportedGates: ReadonlyArray<QuantumGate['_tag']>,
    useBellSampling = false,
    isObservableCircuit = false
  ) {
    this._circuit = new Reactive(createEmptyCircuit(rows, columns));
    this._supportedGates = [...supportedGates];

    this._isObservableCircuit = isObservableCircuit;
    if (isObservableCircuit) {
      // in observable circuit we allow to place gate freely in any place on circuit, without triggering
      // move back and move up. It should only be used when we don't deal with multi-qubit gates
      this.handleRemoveGate = removeGateWithFreePlacementAllowed;
      this.handleAddGate = addGateWithFreePlacementAllowed;
    }

    if (useBellSampling) {
      this.addBellSampling();
    }
  }

  get circuit(): QuantumCircuit {
    return this._circuit.value;
  }

  set circuit(c: QuantumCircuit) {
    this._circuit.value = c;
  }

  get supportedGates(): ReadonlyArray<QuantumGate['_tag']> {
    return this._supportedGates;
  }

  get mode(): Mode {
    return this._mode.value;
  }

  get controlModeProgress() {
    return this._controlModeProgress;
  }

  set controlModeProgress(progress: number) {
    this._controlModeProgress = progress;
  }

  get customGates(): Record<string, GateDefinition> {
    return this._customGates;
  }

  get isCustomGateModalOpen(): boolean {
    return this._isCustomGateModalOpen.value;
  }

  set isCustomGateModalOpen(isOpen: boolean) {
    this._isCustomGateModalOpen.value = isOpen;
  }

  get draggedGates(): RealComposerGate[] {
    return this._draggedGates.value;
  }

  get selectedGates(): RealComposerGate[] {
    return this._selectedGates.value;
  }

  set selectedGates(gates: RealComposerGate[]) {
    this._selectedGates.value = gates.sort(compareGates);

    // if we change selected gates we have to cancel setting control mode
    if (this.mode === 'control') this.toggleMode('control');
  }

  get multiGatesSelector(): MultiGateSelector {
    return this._multiGateSelector.value;
  }

  set multiGatesSelector(selector: MultiGateSelector) {
    this._multiGateSelector.value = selector;
  }

  get isObservableCircuit(): boolean {
    return this._isObservableCircuit;
  }

  onCircuitChange(cb: ReactiveCallback<QuantumCircuit>): Unsubscribe {
    return this._circuit.subscribe(cb);
  }

  onModeChange(cb: ReactiveCallback<Mode>): Unsubscribe {
    return this._mode.subscribe(cb);
  }

  onDraggedGateIdsChange(cb: ReactiveCallback<RealComposerGate[]>): Unsubscribe {
    return this._draggedGates.subscribe(cb);
  }

  onIsCustomGateModalOpen(cb: ReactiveCallback<boolean>): Unsubscribe {
    return this._isCustomGateModalOpen.subscribe(cb);
  }

  onSelectedGatesChange(cb: ReactiveCallback<RealComposerGate[]>): Unsubscribe {
    return this._selectedGates.subscribe(cb);
  }

  onMultiGateSelectorChange(cb: ReactiveCallback<MultiGateSelector>): Unsubscribe {
    return this._multiGateSelector.subscribe(cb);
  }

  toggleMode(m: Mode) {
    if (this.mode !== m) {
      this._mode.value = m;
    } else {
      this._mode.value = 'normal';
    }
  }

  toggleSelectedGate(g: RealComposerGate) {
    const updatedSelectedGates = this.selectedGates.some((gate) => gate.id === g.id)
      ? this.selectedGates.filter((gate) => gate.id !== g.id)
      : [...this.selectedGates, g];

    this._selectedGates.value = updatedSelectedGates.sort(compareGates);
  }

  // Used for ensuring that the gate references are up to date
  reselectGates() {
    this._selectedGates.value = this.selectedGates
      .map((g) => getGateById(this.circuit, g.id) as RealComposerGate | undefined)
      .filter((g) => g !== undefined)
      .sort(compareGates);
  }

  handleDragStart(draggedGates: RealComposerGate[], draggingNewGate: boolean = false) {
    this._draggedGates.value = draggedGates;
  }

  handleDragEnd() {
    this.prevHoverCoords = { row: -1, column: -1 };
    this._draggedGates.value = [];
    this.reselectGates();
  }

  addQubit() {
    const row = this.circuit.length;
    const newCircuitRow = Array.from({ length: this.circuit[0].length }).map((_, column) =>
      emptyCell(row, column)
    );
    this._circuit.value = [...this.circuit, newCircuitRow];
  }

  removeQubit() {
    const rowToRemove = this.circuit[this.circuit.length - 1];
    for (let c = rowToRemove.length - 1; c >= 0; --c) {
      let gate = rowToRemove[c];
      if (!isPartOfMultiQubitGate(gate)) continue;

      gate = getBaseGate(this.circuit, gate);
      this.handleRemoveGate(this.circuit, gate);
    }

    this._circuit.value = [...this.circuit.slice(0, -1)];
  }

  removeEmptyQubit(row: number) {
    if (!this.circuit[row].every((g) => g === undefined || g._tag == 'emptyCell')) return;
    const newCircuit = this.circuit.filter((_, currentRow) => currentRow !== row);

    for (let r = row; r < newCircuit.length; ++r) {
      for (let c = 0; c < newCircuit[r].length; ++c) {
        const gate = newCircuit[r][c];
        gate.row--;
        if (!isDummyGate(gate)) {
          gate.targets = gate.targets.map((t) => t - 1);
          gate.controls = gate.controls.map((c) => c - 1);
        }
      }
    }

    this._circuit.value = newCircuit;
  }

  updateGateRotationAngle(g: RealComposerGate, rotationAngle: number) {
    const updatedGate = { ...g, rotationAngle };
    this.circuit[g.row][g.column] = updatedGate;
    this._circuit.value = [...this.circuit];

    this.reselectGates();
  }

  updateControlsTargets(g: RealComposerGate, newTargets: number[], newControls: number[]) {
    const targets = newTargets;
    const controls = newControls;

    this.handleRemoveGate(this.circuit, g);

    const row = Math.min(...targets, ...controls);
    g = { ...g, row, targets, controls };
    this.handleAddGate(this.circuit, g, () => {});

    this._circuit.value = [...this.circuit];
    this.reselectGates();
  }

  moveGate(g: ComposerGate, row: number, column: number, cb: GateMoveCallback, isNew = false) {
    if (isDummyGate(g)) return;

    if (g.row === row && g.column === column) return;
    if (this.prevHoverCoords.row === row && this.prevHoverCoords.column === column) return;
    this.prevHoverCoords = { row, column };

    if (g.row === row && g.column === column) return;
    if (row + getGateHeight(g) > this.circuit.length) return;

    if (!isNew) this.handleRemoveGate(this.circuit, g);

    const rowDiff = row - g.row;
    const targets = g.targets.map((t) => t + rowDiff);
    const controls = g.controls.map((c) => c + rowDiff);
    g = { ...g, row, column, controls, targets };

    this.handleAddGate(this.circuit, g, cb);
    this._circuit.value = [...this.circuit];
  }

  removeGate(g: ComposerGate) {
    if (isDummyGate(g)) return;
    this.handleRemoveGate(this.circuit, g);
    this._circuit.value = [...this.circuit];
  }

  duplicateSelectedGates() {
    const columns = this.selectedGates.map((g) => g.column);
    const firstColumnOfSelectedGates = Math.min(...columns);
    const lastColumnOfSelectedGates = Math.max(...columns);

    const gatesCopies = this.selectedGates.map((gate) => {
      const gateCopy = copyGate(gate);
      gateCopy.column += lastColumnOfSelectedGates - firstColumnOfSelectedGates + 1;
      return gateCopy;
    });

    for (let i = 0; i < gatesCopies.length; i++) {
      const gate = gatesCopies[i];

      this.handleAddGate(this.circuit, gate, (row, column) => {
        if (gate.column === column) return;

        // if gate has been inserted in different column, then we update columns of all following gates
        // that share at least one row with that gate
        for (let j = i + 1; j < gatesCopies.length; j++) {
          const nextGate = gatesCopies[j];
          if (!isGateOnRow(nextGate, row)) continue;
          const distanceBetweenGates = nextGate.column - gate.column;
          gatesCopies[j].column = column + distanceBetweenGates;
        }
      });
    }

    this._circuit.value = [...this.circuit];
  }

  groupSelectedGates(def: GateDefinition) {
    if (this.selectedGates.length < 2) return;
    this.customGates[def.name] = def;

    const gates = [...this.selectedGates].sort((g1, g2) => compareGates(g2, g1));
    const occupiedRows = Array.from(
      new Set<number>(gates.map((g) => [...g.controls, ...g.targets]).flat())
    ).sort((r1, r2) => r1 - r2);

    const firstColumn = gates[gates.length - 1].column;
    const firstRow = occupiedRows[0];

    gates.forEach((g) => this.handleRemoveGate(this.circuit, g));

    const gate: RealComposerGate = {
      ...createComposerGate('$custom_gate', firstRow, firstColumn),
      _tag: '$custom_gate',
      customTag: def.name,
      targets: occupiedRows,
    };
    this.handleAddGate(this.circuit, gate, () => {});

    this.selectedGates = [];
    this.circuit = [...this.circuit];
  }

  ungroupSelectedGates() {
    const gates = this.selectedGates.filter((g) => g._tag === '$custom_gate').reverse();

    gates.forEach((g) => this.handleRemoveGate(this.circuit, g));
    const gatesToAdd = gates
      .reverse()
      .map((g) => {
        return this.customGates[g.customTag]
          ? collectAllGatesFromCustomGate(g, this.customGates[g.customTag])
          : [];
      })
      .flat();

    for (let i = 0; i < gatesToAdd.length; ++i) {
      const gate = gatesToAdd[i];
      this.handleAddGate(this.circuit, gate, (row, column) => {
        // if gate has been inserted in different column, then we update columns of all following gates
        // that share at least one row with that gate
        for (let j = i + 1; j < gatesToAdd.length; ++j) {
          const nextGate = gatesToAdd[j];
          if (!isGateOnRow(nextGate, row)) continue;
          const distanceBetweenGates = nextGate.column - gate.column;
          gatesToAdd[j].column = column + distanceBetweenGates;
        }
      });
    }

    this.selectedGates = [];
    this._circuit.value = [...this.circuit];
  }

  private addBellSampling() {
    // h q[0]; cx q[0], q[1];
    this.handleAddGate(this.circuit, createComposerGate('h', 0, 0), () => {});
    this.handleAddGate(this.circuit, createComposerGate('cx', 0, 1), () => {});
  }
}

export function createEmptyCircuit(rows: number, columns: number): QuantumCircuit {
  const circuit: QuantumCircuit = [];

  for (let r = 0; r < rows; ++r) {
    const circuitRow: ComposerGate[] = [];
    for (let c = 0; c < columns; ++c) {
      circuitRow.push(emptyCell(r, c));
    }
    circuit.push(circuitRow);
  }

  return circuit;
}

function addGateWithFreePlacementAllowed(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  onInsert: GateMoveCallback
) {
  circuit[g.row][g.column] = g;
  onInsert(g.row, g.column, g.targets, g.controls);
}

function removeGateWithFreePlacementAllowed(circuit: QuantumCircuit, g: RealComposerGate) {
  circuit[g.row][g.column] = emptyCell(g.row, g.column);
}

function addGate(circuit: QuantumCircuit, g: RealComposerGate, onInsert: GateMoveCallback) {
  // we will look for first column to which we can put the gate
  // also, in case we move multi-qubit gate, we assign its head to base gate
  // as insert will handle inserting whole multi-row gate
  let finalColumn: number | undefined = g.column;
  let finalRow = g.row;
  let baseGate = g;

  if (isMultiQubitGate(g)) {
    finalColumn = getFirstColumnToWhichCanMoveNewMultiQubitGate(circuit, g, g.row, g.column);
  } else {
    finalColumn = getFirstColumnToWhichCanMoveNewGate(circuit, g.row, g.column)[0];
  }

  if (finalColumn === undefined) {
    return;
  }

  insertGate(circuit, baseGate, finalRow, finalColumn, onInsert);
  appendEmptyGatesAtCircuitEnd(circuit);
}

function removeGate(circuit: QuantumCircuit, g: RealComposerGate) {
  const maxRow = getMaxGateRow(g);

  for (let r = g.row; r <= maxRow; ++r) {
    circuit[r][g.column] = emptyCell(r, g.column);
  }

  for (let r = g.row; r <= maxRow; ++r) {
    moveBack(circuit, circuit[r][g.column + 1], r, g.column);
  }

  keepOnlyOneEmptyColumnAtCircuitEnd(circuit);
}

/**************************/
/******* INSERTING *******/
/************************/
function insertGate(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number,
  onInsert: GateMoveCallback
) {
  if (isMultiQubitGate(g)) {
    insertMultiQubitGate(circuit, g, row, column, onInsert);
  } else {
    // recursively we move element at given position forward, such recursive call results in whole row moved
    if (circuit[row][column] !== undefined && circuit[row][column]._tag !== 'emptyCell') {
      moveUp(circuit, circuit[row][column], row, column + 1);
    }
    circuit[row][column] = { ...g, row, column };
    onInsert(row, column, g.targets, g.controls);
  }

  ensureNoGateCanBeMovedBack(circuit, column);
}

// it is used because in some cases when we have gates after multiRowGateEmptyBlock, then when this multiRowGateEmptyBlock
// is moved up, there is sometimes possibility to move back some gates before the multiRowGateEmptyBlock gate.
function ensureNoGateCanBeMovedBack(circuit: QuantumCircuit, column: number) {
  for (let row = 0; row < circuit.length; ++row) {
    if (circuit[row][column + 1] !== undefined && circuit[row][column + 2] !== undefined) {
      moveBack(circuit, circuit[row][column + 2], row, column + 1, true);
    }
  }
}

function insertMultiQubitGate(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number,
  onInsert: GateMoveCallback
) {
  const maxRow = getMaxGateRow(g);

  for (let r = row; r <= maxRow; ++r) {
    // recursively we move element at given position forward by one, such recursive call results in whole row moved
    if (circuit[r][column] !== undefined && circuit[r][column]._tag !== 'emptyCell') {
      moveUp(circuit, circuit[r][column], r, column + 1);
    }
  }

  circuit[row][column] = { ...g, row, column };

  for (let r = row + 1; r <= maxRow; ++r) {
    insertGatePart(circuit, g, r, column);
  }

  onInsert(row, column, g.targets, g.controls);
}

export function insertGatePart(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number
) {
  if (g._tag === 'barrier' && !hasQubitOnRow(g, row)) {
    circuit[row][column] = multiQubitGateEmptyBlock(g.id, row, column);
  } else {
    circuit[row][column] = multiQubitGateBlock(g.id, row, column);
  }
}

function getFirstColumnToWhichCanMoveNewMultiQubitGate(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number
): number | undefined {
  const qubitRows = getNonEmptyGatesRows(g);
  const maxRow = getMaxGateRow(g);

  const rowsFirstColumn: Array<number> = [];
  for (let r = row; r <= maxRow; ++r) {
    const rowColumns = getFirstColumnToWhichCanMoveNewGate(
      circuit,
      r,
      column,
      !qubitRows.includes(r),
      g,
      row
    );
    if (rowColumns.length === 0) return;
    rowsFirstColumn.push(rowColumns[0]);
  }

  // from each row we find first column to which we can place it
  // and then among those we select the highest one
  return rowsFirstColumn.sort((a, b) => b - a)[0];
}

function getFirstColumnToWhichCanMoveNewGate(
  circuit: QuantumCircuit,
  row: number,
  column: number,
  isGateMultiQubitGateEmptyBlock?: boolean,
  baseGate?: RealComposerGate,
  baseRow?: number
): Array<number> {
  const result: Array<number> = [];

  for (let c = column; c >= 0; --c) {
    // can't place at multiRowGateEmptyBlock with the exception when we have two multiRowGateEmptyBlock column by column, then we
    // can place it between them. If we want to insert gate on the column where multiRowGateEmptyBlock is and there is no partial
    // height behind it, then we can place it in one column after
    const currColumnGate = circuit[row][c];
    const prevColumnGate = circuit[row][c - 1];
    if (
      currColumnGate?._tag === 'multiRowGateEmptyBlock' &&
      prevColumnGate?._tag !== 'emptyCell' &&
      prevColumnGate?._tag !== 'multiRowGateEmptyBlock'
    ) {
      // in case the gate is part of multi-qubit gate, we need to check if we can move the gate at which we are hovering
      // it is possible only if any non-empty row of both of those two gates intersect with each other
      // if so we add current column, otherwise we force the gate to be added one column after current one
      baseRow !== undefined &&
      baseGate &&
      areNonEmptyRowsIntersecting(circuit, baseGate, baseRow, column)
        ? result.push(c)
        : result.push(c + 1);

      if (isGateMultiQubitGateEmptyBlock) continue;
      else break;
    }

    // we look for first column at which we may place the gate. So we check if column before current one
    // is not empty. If so then we add current column. However in case we encounter multiRowGateEmptyBlock, we have
    // to check columns before the prevColumnGate.
    if (prevColumnGate?._tag !== 'emptyCell') {
      if (prevColumnGate?._tag === 'multiRowGateEmptyBlock') {
        // when c-1 is multiRowGateEmptyBlock, then we check if in column c-2 is non empty gate that is also
        // not a multiRowGateEmptyBlock. If so then we can place current gate at current column.
        if (
          circuit[row][c - 2]?._tag !== 'emptyCell' &&
          circuit[row][c - 2]?._tag !== 'multiRowGateEmptyBlock'
        ) {
          result.push(c);

          if (isGateMultiQubitGateEmptyBlock) continue;
          else break;
        } else {
          c--;
        }
      } else {
        result.push(c);
        if (isGateMultiQubitGateEmptyBlock) continue;
        else break;
      }
    }
  }

  // we reverse the order here, because in case of one-row gates we always use lowest column found
  return result.reverse();
}

// verify if there is an intersection of any non-empty row of the gate we drag and the gate we are hovering at
function areNonEmptyRowsIntersecting(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number
): boolean | undefined {
  const qubitRows = getNonEmptyGatesRows(g);
  const maxRow = getMaxGateRow(g);

  // check the column at which we hover
  for (let r = row; r <= maxRow; ++r) {
    const currentCellGate = isPartOfMultiQubitGate(circuit[r][column])
      ? getBaseGate(circuit, circuit[r][column])
      : circuit[r][column];

    if (isDummyGate(currentCellGate)) return;

    const currentGateNonEmptyRows = getNonEmptyGatesRows(currentCellGate);
    if (!currentGateNonEmptyRows) return;

    const qubitRowsIntersection = currentGateNonEmptyRows.some((r) => qubitRows.includes(r));
    if (!qubitRowsIntersection) return false;
  }

  return true;
}

/****************************/
/******* MOVING BACK *******/
/**************************/
function moveBack(
  circuit: QuantumCircuit,
  g: ComposerGate,
  row: number,
  cell: number,
  moveWholeRow = false
) {
  let finalColumn: number | undefined = cell;
  let finalRow = row;
  let baseGate: RealComposerGate | undefined = undefined;

  // if gate is part of multi-qubit gate, then we want to take base gate
  // because the move logic is based on the base gate
  if (isPartOfMultiQubitGate(g)) {
    baseGate = getBaseGate(circuit, g);
    finalRow = baseGate.row;

    finalColumn = getFirstColumnToWhichCanMoveBackMultiQubit(circuit, baseGate, finalRow, cell);
  } else {
    finalColumn = getColumnsToWhichCanMoveBack(circuit, row, cell)[0];
  }

  if (finalColumn === undefined) {
    // if multi-qubit gate is not moved and the gate part in this row is multiRowGateEmptyBlock, then it is possible
    // that some other elements in next columns will be able to move back before the multiRowGateEmptyBlock,
    // so we leave current gate as is and recursively move back following gates
    //
    // we also enable this when we check if any gates can be moved back after inserting new gate. Then the
    // moveWholeRow variable is set to true
    if (g._tag === 'multiRowGateEmptyBlock' || moveWholeRow) {
      // recursively we move next element back by one, such recursive call results in whole row moved
      if (circuit[g.row][g.column + 1] !== undefined) {
        moveBack(circuit, circuit[g.row][g.column + 1], g.row, g.column, moveWholeRow);
      }
    }
    return;
  }

  if (baseGate && isMultiQubitGate(baseGate)) {
    moveMultiQubitGateBack(circuit, baseGate, finalRow, finalColumn, moveWholeRow);
  } else {
    circuit[g.row][g.column] = emptyCell(g.row, g.column);
    circuit[finalRow][finalColumn] = { ...g, row: finalRow, column: finalColumn };

    // recursively we move next element back by one, such recursive call results in whole row moved
    if (circuit[g.row][g.column + 1] !== undefined) {
      moveBack(circuit, circuit[g.row][g.column + 1], g.row, g.column, moveWholeRow);
    }
  }
}

function moveMultiQubitGateBack(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number,
  moveWholeRow = false
) {
  const maxRow = getMaxGateRow(g);

  for (let r = g.row; r <= maxRow; ++r) {
    circuit[r][g.column] = emptyCell(r, g.column);
  }

  circuit[row][column] = { ...g, row, column };

  for (let r = g.row + 1; r <= maxRow; ++r) {
    const gateAtNewPosition = circuit[r][column];

    if (g._tag === 'barrier' && !hasQubitOnRow(g, r)) {
      // unlike other gates types, in case of multiRowGateEmptyBlock there is possibility
      // that on new position of gate that is moved back, we will encounter some non-empty gate.
      // In that case we just move them up after the multiRowGateEmptyBlock
      if (gateAtNewPosition !== undefined && gateAtNewPosition._tag !== 'emptyCell') {
        moveUp(circuit, gateAtNewPosition, r, column + 1);
      }
      circuit[r][column] = multiQubitGateEmptyBlock(g.id, r, column);
    } else {
      circuit[r][column] = multiQubitGateBlock(g.id, r, column);
    }
  }

  for (let r = g.row; r <= maxRow; ++r) {
    if (circuit[r][g.column + 1] !== undefined) {
      moveBack(circuit, circuit[r][g.column + 1], r, g.column, moveWholeRow);
    }
  }
}

function getFirstColumnToWhichCanMoveBackMultiQubit(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  cell: number
): number | undefined {
  const qubitRows = getNonEmptyGatesRows(g);
  const maxRow = getMaxGateRow(g);

  const allRowsResult: Array<{ row: number; results: Array<number> }> = [];
  for (let r = row; r <= maxRow; ++r) {
    const rowResults = getColumnsToWhichCanMoveBack(circuit, r, cell, !qubitRows.includes(r));
    if (rowResults.length === 0) return;
    allRowsResult.push({ row: r, results: rowResults });
  }

  const nonHeightResults = allRowsResult.filter(({ row }) => qubitRows.includes(row));
  const nonHeightResultsCommonRows = nonHeightResults[0].results.filter((column) =>
    nonHeightResults.every(({ results }) => results.includes(column))
  );

  if (nonHeightResultsCommonRows.length > 0) return nonHeightResultsCommonRows[0];

  // find only those columns that repeat for each gate's row
  // and then return first column
  return allRowsResult[0].results.filter((column) =>
    allRowsResult.every(({ results }) => results.includes(column))
  )[0];
}

function getColumnsToWhichCanMoveBack(
  circuit: QuantumCircuit,
  row: number,
  cell: number,
  isMultiQubitGateEmptyBlock = false
): Array<number> {
  const result: Array<number> = [];

  for (let c = cell; c >= 0; c--) {
    const currentGate = circuit[row][c];

    // if multiRowGateEmptyBlock we check whether the element behind is not empty
    // if it is neither empty nor multiRowGateEmptyBlock then we break, because we cannot move gate back to this column
    // if not, then we continue, because gate might be moved behind the multiRowGateEmptyBlock
    if (currentGate?._tag === 'multiRowGateEmptyBlock') {
      if (
        circuit[row][c - 1]?._tag !== 'emptyCell' &&
        circuit[row][c - 1]?._tag !== 'multiRowGateEmptyBlock'
      ) {
        break;
      } else {
        continue;
      }
    }

    // if gate that we are trying to move up is multiRowGateEmptyBlock, then it is possible that it can move before
    // encountered non-empty gate, that is why we continue here in such case
    if (circuit[row][c]?._tag !== 'emptyCell') {
      if (isMultiQubitGateEmptyBlock) continue;
      else break;
    }

    result.push(c);
  }

  // we reverse the order as we want to place gate at the lowest possible column
  return result.reverse();
}

/**************************/
/******* MOVING UP *******/
/************************/
function moveUp(circuit: QuantumCircuit, g: ComposerGate, row: number, column: number) {
  if (g._tag === 'emptyCell') return;

  let finalColumn: number | undefined = column;
  let finalRow = row;
  let baseGate: RealComposerGate | undefined = undefined;

  // if gate is part of multi-qubit gate, then we want to take base gate
  // because the move logic is based on the base gate
  if (isPartOfMultiQubitGate(g)) {
    baseGate = getBaseGate(circuit, g);
    if (!baseGate) return;
    finalRow = baseGate.row;

    finalColumn = getFirstColumnToWhichCanMoveUpMultiQubit(
      circuit,
      baseGate,
      finalRow,
      finalColumn
    );
    if (finalColumn === undefined) return;

    const isMovingMoreThanOneColumn = finalColumn - g.column > 1;

    moveMultiQubitUp(circuit, baseGate, finalRow, finalColumn, isMovingMoreThanOneColumn);
  } else {
    finalColumn = getColumnToWhichCanMoveUp(circuit, finalRow, finalColumn);
    if (finalColumn === undefined) return;
    const isMovingMoreThanOneColumn = finalColumn - g.column > 1;
    let nextCellToMove = finalColumn;
    if (isMovingMoreThanOneColumn) {
      // in case of the next gate being multiRowGateEmptyBlock, we don't want to move that gate
      // so in that case we will move gate from cell + 2
      nextCellToMove =
        circuit[g.row][g.column + 1]?._tag === 'multiRowGateEmptyBlock'
          ? g.column + 2
          : g.column + 1;
    }

    // recursively we move next element back by one, such recursive call results in whole row moved
    moveUp(circuit, circuit[finalRow][nextCellToMove], finalRow, finalColumn + 1);

    circuit[g.row][g.column] = emptyCell(g.row, g.column);
    circuit[finalRow][finalColumn] = { ...g, row: finalRow, column: finalColumn };
  }
}

function moveMultiQubitUp(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number,
  isMovingMoreThanOneColumn = false
) {
  const qubitRows = getNonEmptyGatesRows(g);
  const maxRow = getMaxGateRow(g);

  for (let r = g.row; r <= maxRow; ++r) {
    if (!qubitRows.includes(r)) {
      moveUp(circuit, circuit[r][column], r, column + 1);
      continue;
    }

    let nextCellToMove = column;
    if (isMovingMoreThanOneColumn) {
      // in case of the next gate being multiRowGateEmptyBlock, we don't want to move that gate
      // so in that case we will move gate from cell + 2
      nextCellToMove =
        circuit[r][g.column + 1]?._tag === 'multiRowGateEmptyBlock' ? g.column + 2 : g.column + 1;
    }
    moveUp(circuit, circuit[r][nextCellToMove], r, column + 1);
  }

  circuit[g.row][g.column] = emptyCell(g.row, g.column);
  circuit[row][column] = { ...g, row, column };

  for (let r = g.row + 1; r <= maxRow; ++r) {
    circuit[r][g.column] = emptyCell(r, g.column);

    if (g._tag === 'barrier' && !hasQubitOnRow(g, r)) {
      circuit[r][column] = multiQubitGateEmptyBlock(g.id, r, column);
    } else {
      circuit[r][column] = multiQubitGateBlock(g.id, r, column);
    }
  }
}

// Usually, when we move up, it is enough to move gate to the new column (which is one column after its previous one)
// However, when we encounter multiRowGateEmptyBlock, it is possible that we will have to move the given gate up by
// one more column to place it after gate with empty block. It happens when there is no row in which there are
// non-empty gate parts of both gates, because only then can we also move up multi-qubit gate with multiRowGateEmptyBlock
// gate we encountered.
function getFirstColumnToWhichCanMoveUpMultiQubit(
  circuit: QuantumCircuit,
  g: RealComposerGate,
  row: number,
  column: number
): number | undefined {
  const isMovingFromColumnBefore = column - g.column === 1;
  const gateEmptyRows: Array<number> = [];
  const maxRow = getMaxGateRow(g);

  for (let r = row; r <= maxRow; ++r) {
    if (circuit[r][column]._tag === 'multiRowGateEmptyBlock') {
      // in case we encounter multiRowGateEmptyBlock and the gate before is also multiRowGateEmptyBlock, we want to place
      // new gate in between them, so we do not add this gate here, which will result in moving up
      // of the encountered gate
      if (!isMovingFromColumnBefore && circuit[r][column - 1]._tag === 'multiRowGateEmptyBlock') {
        continue;
      }

      gateEmptyRows.push(r);
    }
  }

  // if no multiRowGateEmptyBlock in new row, then we can simply move up by one;
  if (gateEmptyRows.length === 0) return column;

  const newGateQubitRows = getNonEmptyGatesRows(g);
  if (!newGateQubitRows) return column;

  // we loop each row at which we encountered multiRowGateEmptyBlock, get base gate and verify if new gate's
  // non-empty elements overlap with non-empty elements of the multi-qubit gate we encountered. If there
  // is no overlap of non-empty elements we have to move new gate by one more column than we wanted.
  // Otherwise, if for each row with multiRowGateEmptyBlock we will find overlap, then we simply return the cell we intended
  // to move the new gate to in the first place.
  for (const r of gateEmptyRows) {
    const currentGate = getBaseGate(circuit, circuit[r][column]);
    const currentGateQubitRows = getNonEmptyGatesRows(currentGate);

    const overlap = currentGateQubitRows.some((r) => newGateQubitRows.includes(r));
    if (!overlap) {
      return column + 1;
    }
  }

  return column;
}

// when moving up one-row gate when we encounter multiRowGateEmptyBlock we simply
// move the gate by one more column, otherwise we move it to the column we intended to in the first place
function getColumnToWhichCanMoveUp(circuit: QuantumCircuit, row: number, column: number): number {
  return circuit[row][column]?._tag === 'multiRowGateEmptyBlock' ? column + 1 : column;
}

/**************************/
/**** UTILS FUNCTIONS ****/
/************************/
// if we are reaching the end of the circuit row, we have to append new empty gates
// at the end of each row, so that we are able to add new elements. We check if we have
// any non-empty gates at the last column and we append new empty gates only if we do
function appendEmptyGatesAtCircuitEnd(circuit: QuantumCircuit) {
  let shouldAdd = false;
  for (let r = 0; r < circuit.length; ++r) {
    if (circuit[r][circuit[r].length - 1]._tag !== 'emptyCell') {
      shouldAdd = true;
      break;
    }
  }

  if (!shouldAdd) return;

  for (let r = 0; r < circuit.length; ++r) {
    const rowLength = circuit[r].length;
    circuit[r][rowLength] = emptyCell(r, rowLength);
  }
}

function keepOnlyOneEmptyColumnAtCircuitEnd(circuit: QuantumCircuit) {
  let firstEmptyColumnAtCircuitEnd = circuit[0].length - 1;

  // last column is guaranteed to be empty, so we start from next to last column
  circuitLoop: for (let c = circuit[0].length - 2; c >= 0; --c) {
    for (let r = 0; r < circuit.length; ++r) {
      if (circuit[r][c]._tag !== 'emptyCell') {
        break circuitLoop;
      }
    }
    firstEmptyColumnAtCircuitEnd = c;
  }

  if (firstEmptyColumnAtCircuitEnd === circuit[0].length - 1) return;

  for (let r = 0; r < circuit.length; ++r) {
    circuit[r] = circuit[r].slice(0, firstEmptyColumnAtCircuitEnd + 1);
  }
}

// It returns all rows that gate occupies which are not empty (all but multiRowEmptyBlock parts)
// for example for CZ gate we treat the wire connecting its control and target also as non-empty row
// in case of barrier however, the row without controls and targets is visually empty, so we do not include it multiRowEmptyBlock
export function getNonEmptyGatesRows(gate: RealComposerGate): Array<number> {
  if (gate._tag !== 'barrier') {
    const firstRow = Math.min(...gate.targets, ...gate.controls);
    const lastRow = Math.max(...gate.targets, ...gate.controls);

    return Array.from({ length: lastRow - firstRow + 1 }, (_, index) => firstRow + index);
  }

  return [...gate.controls, ...gate.targets];
}

// gets the main gate of the multi-qubit gate. It is always the top part of the gate.
export function getBaseGate(circuit: QuantumCircuit, g: ComposerGate): RealComposerGate {
  switch (g._tag) {
    case 'emptyCell':
      throw new Error('unexpected empty cell when trying to get base gate of multi row gate');
    case 'multiRowGateBlock':
    case 'multiRowGateEmptyBlock':
      const baseGate = getGateById(circuit, g.baseId);
      if (!baseGate || isDummyGate(baseGate)) {
        throw new Error(`expected real gate but got gate with tag=${baseGate?._tag}`);
      }
      return baseGate;
    default:
      if (!isMultiQubitGate(g)) {
        throw new Error(`gate with tag=${g._tag} is not multi qubit`);
      }
      return g;
  }
}

function getGateById(circuit: QuantumCircuit, id: number): ComposerGate | undefined {
  for (let r = 0; r < circuit.length; ++r) {
    for (let c = 0; c < circuit[r].length; ++c) {
      if (circuit[r][c].id === id) return circuit[r][c];
    }
  }

  return undefined;
}

function isGateOnRow(g: RealComposerGate, row: number): boolean {
  return g.row <= row && getMaxGateRow(g) >= row;
}

function compareGates(g1: RealComposerGate, g2: RealComposerGate): number {
  const columnDiff = g1.column - g2.column;

  if (columnDiff !== 0) {
    return columnDiff;
  } else {
    return g1.row - g2.row;
  }
}
