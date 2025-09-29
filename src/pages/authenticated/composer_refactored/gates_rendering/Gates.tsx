import clsx from 'clsx';
import { GateTag } from '../gates';
import Barrier from './Barrier';
import CNOTGate from './CNOTGate';
import CZGate from './CZGate';
import SwapGate from './SwapGate';

export const GATE_CELL_SIZE = 64;
export const GATE_BLOCK_SIZE = 40;

export enum GateColor {
  NONE = 'transparent',
  GATE_ATOMIC = '#5179d5',
  GATE_CONTROLLED = '#8255a7',
  GATE_PARAMETRIZED = '#c13c3c',
}

export type RenderProps = { targets: number[]; controls: number[]; styles: string };

export type GateRenderingBlock = Readonly<
  {
    label: string;
    name: string;
    backgroundColor: GateColor;
    hasBorder: boolean;
    palletteItem: React.ReactNode;
  } & (
    | { renderComposerItem: (props: RenderProps) => React.ReactNode }
    | { composerItem: React.ReactNode }
  )
>;

export const gateRenderingBlockMap: Record<GateTag, GateRenderingBlock> = {
  i: {
    label: 'I',
    name: 'I Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>I</span>,
    composerItem: <span>I</span>,
  },
  x: {
    label: 'X',
    name: 'X Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>X</span>,
    composerItem: <span>X</span>,
  },
  y: {
    label: 'Y',
    name: 'Y Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>Y</span>,
    composerItem: <span>Y</span>,
  },
  z: {
    label: 'Z',
    name: 'Z Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>Z</span>,
    composerItem: <span>Z</span>,
  },
  h: {
    label: 'H',
    name: 'Hadamard Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>H</span>,
    composerItem: <span>H</span>,
  },
  t: {
    label: 'T',
    name: 'T Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>T</span>,
    composerItem: <span>T</span>,
  },
  s: {
    label: 'S',
    name: 'S Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>S</span>,
    composerItem: <span>S</span>,
  },
  sdg: {
    label: 'S†',
    name: 'Sdag Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span className="dagger-gate"> X</span>,
    composerItem: <span className="dagger-gate"> X</span>,
  },
  tdg: {
    label: 'T†',
    name: 'Tdag Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span className="dagger-gate">T</span>,
    composerItem: <span className="dagger-gate">T</span>,
  },
  sx: {
    label: 'SX',
    name: 'SX Gate',
    backgroundColor: GateColor.GATE_ATOMIC,
    hasBorder: false,
    palletteItem: <span>SX</span>,
    composerItem: <span>SX</span>,
  },
  rx: {
    label: 'RX',
    name: 'RX Gate',
    backgroundColor: GateColor.GATE_PARAMETRIZED,
    hasBorder: false,
    palletteItem: <span>RX</span>,
    composerItem: <span className={clsx('text-xs')}>RX(θ)</span>,
  },
  ry: {
    label: 'RY',
    name: 'RY Gate',
    backgroundColor: GateColor.GATE_PARAMETRIZED,
    hasBorder: false,
    palletteItem: <span>RY</span>,
    composerItem: <span className={clsx('text-xs')}>RY(θ)</span>,
  },
  rz: {
    label: 'RZ',
    name: 'RZ Gate',
    backgroundColor: GateColor.GATE_PARAMETRIZED,
    hasBorder: false,
    palletteItem: <span>RZ</span>,
    composerItem: <span className={clsx('text-xs')}>RZ(θ)</span>,
  },
  cx: {
    label: 'CNot',
    name: 'Controlled Not Gate',
    backgroundColor: GateColor.GATE_CONTROLLED,
    hasBorder: false,
    palletteItem: (
      <img
        style={{ padding: 4 }}
        src={`/img/composer/gate-cnot.svg`}
        className="h-full w-auto object-contain"
      />
    ),
    composerItem: <span>RX</span>,
    renderComposerItem: CNOTGate,
  },
  cz: {
    label: 'CZ',
    name: 'Controlled Z Gate',
    backgroundColor: GateColor.GATE_CONTROLLED,
    hasBorder: false,
    palletteItem: (
      <img
        style={{ padding: 4 }}
        src={`/img/composer/gate-cz.svg`}
        className="h-full w-auto object-contain"
      />
    ),
    renderComposerItem: CZGate,
  },
  swap: {
    label: 'Swap',
    name: 'Swap Gate',
    backgroundColor: GateColor.GATE_CONTROLLED,
    hasBorder: false,
    palletteItem: (
      <img
        style={{ padding: 4 }}
        src={`/img/composer/gate-swap.svg`}
        className="h-full w-auto object-contain"
      />
    ),
    renderComposerItem: SwapGate,
  },
  barrier: {
    label: 'Barrier',
    name: 'Barrier',
    backgroundColor: GateColor.NONE,
    hasBorder: true,
    palletteItem: <img style={{ padding: 4 }} className="p-2" src={`/img/composer/barrier.svg`} />,
    renderComposerItem: Barrier,
  },
};
