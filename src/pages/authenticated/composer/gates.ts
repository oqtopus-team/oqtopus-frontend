export type Complex = [number, number];

export type GateI = { readonly _tag: "i"; target: number };
export type GateX = { readonly _tag: "x"; target: number };
export type GateY = { readonly _tag: "y"; target: number };
export type GateZ = { readonly _tag: "z"; target: number };
export type GateH = { readonly _tag: "h"; target: number };
export type GateT = { readonly _tag: "t"; target: number };
export type GateS = { readonly _tag: "s"; target: number };
export type GateRX = { readonly _tag: "rx"; target: number; arg: number };
export type GateRY = { readonly _tag: "ry"; target: number; arg: number }; // 修正
export type GateRZ = { readonly _tag: "rz"; target: number; arg: number }; // 修正
export type GateCNOT = { readonly _tag: "cnot"; target: number; control: number };
export type GateCCNOT = { readonly _tag: "ccnot"; target: number; control1: number; control2: number };
export type OpBarrier = { readonly _tag: "barrier"; target: number };

export type QuantumGate =
  | GateI
  | GateX
  | GateY
  | GateZ
  | GateH
  | GateT
  | GateS
  | GateRX
  | GateRY
  | GateRZ
  | GateCNOT
  | GateCCNOT
  | OpBarrier;

export const GateI = (target: number): GateI => ({ _tag: "i", target });
export const GateX = (target: number): GateX => ({ _tag: "x", target });
export const GateY = (target: number): GateY => ({ _tag: "y", target });
export const GateZ = (target: number): GateZ => ({ _tag: "z", target });
export const GateH = (target: number): GateH => ({ _tag: "h", target });
export const GateT = (target: number): GateT => ({ _tag: "t", target });
export const GateS = (target: number): GateS => ({ _tag: "s", target });
export const GateRX = (target: number, arg: number): GateRX => ({ _tag: "rx", target, arg });
export const GateRY = (target: number, arg: number): GateRY => ({ _tag: "ry", target, arg });
export const GateRZ = (target: number, arg: number): GateRZ => ({ _tag: "rz", target, arg });
export const GateCNOT = (control: number, target: number): GateCNOT => ({ _tag: "cnot", control, target });
export const GateCCNOT = (control1: number, control2: number, target: number): GateCCNOT => ({ _tag: "ccnot", control1, control2, target });
export const OpBarrier = (target: number): OpBarrier => ({ _tag: "barrier", target });

export const labelOfGate = (gate: QuantumGate): string => {
  switch (gate._tag) {
    case "barrier": return "Barrier";
    case "ccnot": return "CCNot";
    case "cnot": return "CNot";
    case "i": return "i";
    case "h": return "H";
    case "rx": return "RX";
    case "ry": return "RY";
    case "rz": return "RZ";
    case "s": return "S";
    case "t": return "T";
    case "x": return "X";
    case "y": return "Y";
    case "z": return "Z"; 
  }
}

export const isControlledGate = (g: QuantumGate) : g is GateCNOT | GateCCNOT => {
  return g._tag == "cnot" || g?._tag == "ccnot"
}


export type ControlWireDirection = "up" | "down";

export const Up: ControlWireDirection = "up";
export const Down: ControlWireDirection = "down";

export const compareGate = (lhs: QuantumGate, rhs: QuantumGate): boolean => {
  if (lhs.target != rhs.target) return false;

  switch (lhs._tag) {
    case "cnot":
      return rhs._tag === "cnot" && lhs.control === rhs.control;
    case "ccnot":
      return rhs._tag === "ccnot" && lhs.control1 === rhs.control1 && lhs.control2 === rhs.control2;
    case "rx":
      return rhs._tag === "rx" && lhs.arg === rhs.arg;
    case "ry":
      return rhs._tag === "ry" && lhs.arg === rhs.arg;
    case "rz":
      return rhs._tag === "rz" && lhs.arg === rhs.arg;
    default:
      return lhs._tag === rhs._tag;
  }
}

export const gateName =(g: QuantumGate): string => {
  switch(g._tag) {
    case "ccnot": return "Toffoli Gate";
    case "cnot": return "Controlled Not Gate";
    case "i": return "Identity Gate";
    case "h": return "Hadamard Gate";
    case "rx": return "RX Gate";
    case "ry": return "RY Gate";
    case "rz": return "RZ Gate";
    case "s": return "S Gate";
    case "t": return "T Gate";
    case "x": return "X Gate";
    case "y": return "Y Gate";
    case "z": return "Z Gate";
    case "barrier": return "Barrier" 
  }
}


export const allGates: QuantumGate["_tag"][] =
  ["x",
    "y",
    "z",
    "h",
    "s",
    "t",
    "cnot",
    // "ccnot",
    "rx",
    "ry",
    "rz",
    "barrier"
  ]