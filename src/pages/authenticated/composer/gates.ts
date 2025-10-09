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

export type CustomGateTag = '$custom_gate';
export type GateTag = (typeof supportedGates)[number] | CustomGateTag;
export type ParametrizedGateTag = Extract<GateTag, 'rx' | 'ry' | 'rz'>;
export type RegularGateTag = Exclude<GateTag, ParametrizedGateTag | CustomGateTag>;

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

type CustomQuantumGate = BaseQuantumGate & {
  readonly _tag: CustomGateTag;
  customTag: string;
};

export type QuantumGate = RegularQuantumGate | ParametrizedQuantumGate | CustomQuantumGate;

export const parametrizedGates: ParametrizedGateTag[] = ['rx', 'ry', 'rz'];
export const controlledGates: GateTag[] = ['cx', 'cz'];
const multiQubitGates: GateTag[] = [...controlledGates, 'swap']

export function createQuantumGate(tag: GateTag): QuantumGate {
  if (tag === 'rx' || tag === 'ry' || tag === 'rz') {
    return {
      _tag: tag,
      targets: [],
      controls: [],
      rotationAngle: Math.PI / 2,
    };
  } else if (tag === '$custom_gate') {
    return {
      _tag: tag,
      customTag: '',
      targets: [],
      controls: [],
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

export function isCustomGate(g: QuantumGate): g is CustomQuantumGate {
  return g._tag === '$custom_gate';
}

export function isMultiQubitGate(g: QuantumGate): boolean {
  return [...g.controls, ...g.targets].length > 1;
}

export function isGateMultiQubitByDefault(tag: GateTag): boolean {
  return multiQubitGates.includes(tag);
}

export function isControlledGate(g: QuantumGate): boolean {
  return g.controls.length > 0;
}
