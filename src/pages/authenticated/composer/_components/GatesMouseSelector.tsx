import clsx from 'clsx';
import { useContext, useEffect, useRef, useState } from 'react';
import { circuitContext, getBaseGate } from '../circuit';
import { RealComposerGate } from '../composer';
import { cellSize } from '../gates_rendering/constants';

type Props = {
  grid: React.RefObject<HTMLDivElement | null>;
};

export default function GatesMouseSelector({ grid }: Props) {
  const selectorRef = useRef<HTMLDivElement>(null);
  const circuitService = useContext(circuitContext);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    return circuitService.onMultiGateSelectorChange((m) => {
      if (m.kind !== 'mouse') {
        setIsVisible(false);
        return;
      }

      const { x1, y1, x2, y2 } = m;
      if (x1 === x2 && y1 === y2) return;

      adjustSelectorPositionAndSize(x1, y1, x2, y2);
      circuitService.selectedGates = findGatesWhichOverlapWithSelector(x1, y1, x2, y2) ?? [];
      setIsVisible(true);
    });
  }, []);

  function adjustSelectorPositionAndSize(x1: number, y1: number, x2: number, y2: number) {
    const selector = selectorRef.current;
    if (!selector) return;

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);

    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    selector.style.left = `${minX}px`;
    selector.style.top = `${minY}px`;
    selector.style.width = `${width}px`;
    selector.style.height = `${height}px`;
  }

  function findGatesWhichOverlapWithSelector(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): RealComposerGate[] | undefined {
    if (!grid.current) return;

    const numberOfRows = circuitService.circuit.length;
    const numberOfColumns = circuitService.circuit[0].length;

    const { x: startX, y: startY } = grid.current.getBoundingClientRect();

    const [firstColumn, secondColumn] =
      findSelectorColumnRange(x1, x2, startX, numberOfColumns) ?? [];
    if (firstColumn === undefined || secondColumn === undefined) return;

    const [firstRow, secondRow] = findSelectorRowRange(y1, y2, startY, numberOfRows) ?? [];
    if (firstRow === undefined || secondRow === undefined) return;

    const [startColumn, endColumn] =
      firstColumn < secondColumn ? [firstColumn, secondColumn] : [secondColumn, firstColumn];
    const [startRow, endRow] = firstRow < secondRow ? [firstRow, secondRow] : [secondRow, firstRow];

    const gatesToSelect: RealComposerGate[] = [];
    for (let r = startRow; r <= endRow; ++r) {
      for (let c = startColumn; c <= endColumn; ++c) {
        const gate = circuitService.circuit[r][c];

        switch (gate._tag) {
          case 'emptyCell':
            continue;
          case 'multiRowGateBlock':
          case 'multiRowGateEmptyBlock':
            gatesToSelect.push(getBaseGate(circuitService.circuit, gate));
            break;
          default:
            gatesToSelect.push(gate);
            break;
        }
      }
    }

    return gatesToSelect.filter(filterSelectedDuplicates);
  }

  function findSelectorColumnRange(
    selectorStartX: number,
    selectorEndX: number,
    circuitStartX: number,
    columnsCount: number
  ): [number, number] | undefined {
    if (selectorStartX < circuitStartX && selectorEndX < circuitStartX) return;

    const circuitEndX = circuitStartX + getColumnsWidth(columnsCount);
    if (selectorStartX > circuitEndX && selectorEndX > circuitEndX) return;

    // in case a start/end position of selector is outside of the circuit,
    // then we accordingly assign either start or end column
    let startColumn = selectorStartX > circuitEndX ? columnsCount - 1 : 0;
    let endColumn = selectorEndX > circuitEndX ? columnsCount - 1 : 0;

    for (let c = 0; c < columnsCount; ++c) {
      const cellStartCoordinate = circuitStartX + getColumnsWidth(c);
      const cellEndCoordinate = cellStartCoordinate + getColumnWidth(c);

      if (selectorStartX > cellStartCoordinate && selectorStartX < cellEndCoordinate) {
        startColumn = c;
      }

      if (selectorEndX > cellStartCoordinate && selectorEndX < cellEndCoordinate) {
        endColumn = c;
      }
    }

    return [startColumn, endColumn];
  }

  function findSelectorRowRange(
    selectorStartY: number,
    selectorEndY: number,
    circuitStartY: number,
    rowsCount: number
  ): [number, number] | undefined {
    if (selectorStartY < circuitStartY && selectorEndY < circuitStartY) return;

    const circuitEndY = circuitStartY + rowsCount * cellSize;
    if (selectorStartY > circuitEndY && selectorEndY > circuitEndY) return;

    // in case a start/end position of selector is outside of the circuit,
    // then we accordingly assign either start or end row
    let startRow = selectorStartY > circuitEndY ? rowsCount - 1 : 0;
    let endRow = selectorEndY > circuitEndY ? rowsCount - 1 : 0;

    for (let r = 0; r < rowsCount; ++r) {
      const rowStartCoordinate = circuitStartY + r * cellSize;
      const rowEndCoordinate = rowStartCoordinate + cellSize;

      if (selectorStartY > rowStartCoordinate && selectorStartY < rowEndCoordinate) {
        startRow = r;
      }

      if (selectorEndY > rowStartCoordinate && selectorEndY < rowEndCoordinate) {
        endRow = r;
      }
    }

    return [startRow, endRow];
  }

  function getColumnWidth(columnIdx: number): number {
    if (!grid.current) return cellSize;
    return grid.current.children[0].children[columnIdx].getBoundingClientRect().width;
  }

  function getColumnsWidth(numberOfColumns: number) {
    if (!grid.current) return 0;

    // each cell in the column has to have the same width
    // so it is sufficient to determine each column width by the first row cells
    const firstRow = grid.current.children[0];
    const cells = firstRow.children;

    if (!cells) return 0;

    return Array.from(cells)
      .slice(0, numberOfColumns)
      .map((c) => c.getBoundingClientRect().width)
      .reduce((totalWidth, cellWidth) => totalWidth + cellWidth, 0);
  }

  function filterSelectedDuplicates(
    gate: RealComposerGate,
    index: number,
    gatesToSelect: RealComposerGate[]
  ) {
    return index === gatesToSelect.findIndex((gate2) => gate2.id === gate.id);
  }

  return (
    <div
      className={clsx(
        'absolute',
        'top-0',
        'left-0',
        'w-full',
        'h-full',
        'pointer-events-none',
        'overflow-hidden'
      )}
    >
      <div
        hidden={!isVisible}
        ref={selectorRef}
        className={clsx(
          ['fixed', 'pointer-events-none'],
          ['border-2', 'border-dashed', 'border-gray-400']
        )}
      />
    </div>
  );
}
