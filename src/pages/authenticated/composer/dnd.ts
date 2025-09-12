import { GateCCNOT, GateCNOT, GateH, GateI, GateRX, GateRY, GateRZ, GateS, GateT, GateX, GateY, GateZ, QuantumGate } from "./gates";

export const ItemTypeGate = "GATE" as const;
export const ItemTypeMoveGate = "MOVE_GATE" as const;

export type DragGateItem = {
  type: typeof ItemTypeGate;
  from: typeof FromPalette;
  gateTag: string;
  sourceQubit?: number;
  sourceTimestep?: number; 
};

export type DragMoveGateItem = {
  type: typeof ItemTypeMoveGate;
  from: typeof FromCanvas;
  sourceQubit: number;
  sourceTimestep: number;
}

export const FromPalette = "palette" as const;
export const FromCanvas = "canvas" as const;


export const dragGateItemToQuantumGate = (qubitIndex:number, item: DragGateItem): QuantumGate => {
  switch (item.gateTag) {
    case "x":
      return GateX(qubitIndex);
    case "y":
      return GateY(qubitIndex);
    case "z":
      return GateZ(qubitIndex);
    case "h":
      return GateH(qubitIndex);
    case "t":
      return GateT(qubitIndex);
    case "s":
      return GateS(qubitIndex);
    case "i":
      return GateI(qubitIndex);
    case "cnot":
      return GateCNOT(qubitIndex, qubitIndex);
    case "ccnot":
      return GateCCNOT(qubitIndex, qubitIndex, qubitIndex);
    case "rx":
      return GateRX(qubitIndex, 0);
    case "ry":
      return GateRY(qubitIndex, 0);
    case "rz":
      return GateRZ(qubitIndex, 0);
    default: 
      throw new Error("Unsuppoted gate!")
    }
}
