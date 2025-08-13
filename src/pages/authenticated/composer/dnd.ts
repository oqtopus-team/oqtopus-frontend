import { GateCCNOT, GateCNOT, GateCZ, GateH, GateI, GateRX, GateRY, GateRZ, GateS, GateSdg, GateSwap, GateSX, GateT, GateTdg, GateX, GateY, GateZ, OpBarrier, QuantumGate } from "./gates";

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
    case "sdg":
      return GateSdg(qubitIndex);
    case "tdg":
      return GateTdg(qubitIndex);
    case "sx":
      return GateSX(qubitIndex);
    case "i":
      return GateI(qubitIndex);
    case "cnot":
      return GateCNOT(qubitIndex, qubitIndex);
    case "ccnot":
      return GateCCNOT(qubitIndex, qubitIndex, qubitIndex);
    case "cz":
      return GateCZ(qubitIndex, qubitIndex);
    case "swap":
      return GateSwap(qubitIndex, qubitIndex);
    case "rx":
      return GateRX(qubitIndex, 0);
    case "ry":
      return GateRY(qubitIndex, 0);
    case "rz":
      return GateRZ(qubitIndex, 0);
    case "barrier":
      return OpBarrier(qubitIndex);
    default: 
      throw new Error("Unsuppoted gate!")
    }
}
