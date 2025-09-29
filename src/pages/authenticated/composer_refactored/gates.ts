export const supportedGates = [
  'i',
  'x',
  'y',
  'z',
  'h',
  't',
  's',
  'sdg',
  'tdg',
  'sx',
  'rx',
  'ry',
  'rz',
  'cx',
  //   "ccnot",
  'cz',
  'swap',
  'barrier',
] as const;

export type GateTag = (typeof supportedGates)[number];
export type ParametrizedGateTag = Extract<GateTag, 'rx' | 'ry' | 'rz'>;
export type RegularGateTag = Exclude<GateTag, ParametrizedGateTag>;

type BaseQuantumGate = {
  readonly _tag: GateTag;
  targets: number[];
  controls: number[];
};

type RegularQuantumGate = BaseQuantumGate & {
  readonly _tag: RegularGateTag;
};

type ParametrizedQuantumGate = BaseQuantumGate & {
  readonly _tag: ParametrizedGateTag;
  rotationAngle: number;
};

export type QuantumGate = RegularQuantumGate | ParametrizedQuantumGate;

export const parametrizedGates: ParametrizedGateTag[] = ['rx', 'ry', 'rz'];

export function createQuantumGate(tag: GateTag): QuantumGate {
  if (tag === 'rx' || tag === 'ry' || tag === 'rz') {
    return {
      _tag: tag,
      targets: [],
      controls: [],
      rotationAngle: Math.PI / 2,
    };
  } else {
    return {
      _tag: tag,
      targets: [],
      controls: [],
    };
  }
}

export function isParametrizedGate(g: QuantumGate): g is ParametrizedQuantumGate {
  return parametrizedGates.includes(g._tag as ParametrizedGateTag);
}

export function isMultiQubitGate(g: QuantumGate): boolean {
  return [...g.controls, ...g.targets].length > 1;
}

function isControlledGate(g: QuantumGate): boolean {
  return g.controls.length > 0;
}
