import { RefObject, useRef } from 'react';
import QuantumGateElement from './QuantumGateElement';
import clsx from 'clsx';
import { ComposerGate } from '../composer';

export interface Props {
  row: number;
  column: number;
  gate: ComposerGate;
  static?: boolean;
  selected: boolean;
  circuitGrid: RefObject<HTMLDivElement | null>;
}

export default (props: Props) => {
  const { gate } = props;

  return (
    <div
      className={clsx([
        ['w-full', 'h-full', 'flex', 'items-center', 'justify-center'],
        ['relative'],
      ])}
    >
      <QuantumGateElement
        gate={gate}
        selected={props.selected}
        static={props.static}
        row={props.row}
        column={props.column}
        circuitGrid={props.circuitGrid}
      />
    </div>
  );
};
