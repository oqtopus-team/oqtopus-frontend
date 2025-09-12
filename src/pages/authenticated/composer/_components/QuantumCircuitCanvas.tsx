import { useEffect, useState } from "react";
import { QuantumGate, Down, Up, GateS, ControlWireDirection, compareGate, GateCNOT, gateName } from "../gates";
import { QuantumCircuit } from "../circuit";
import { DragGateItem, dragGateItemToQuantumGate, DragMoveGateItem, ItemTypeGate, ItemTypeMoveGate } from "../dnd";
import clsx from "clsx";
import QuantumCircuitGateCell, { ControlQubit, ControlWire, EmptyCell, Gate, PreviewControl, } from "./QuantumCircuitGateCell";
import QuantumCircuitDropCell, { DropCellPart } from "./QuantumCircuitDropCell";
import { DummyGate, ExtendedGate, Mode } from "../composer";
import { t } from "i18next";
import QuantumGateElement from "./QuantumGateElement";
import { Slider } from "@mui/material";
import { Input } from "@/pages/_components/Input";
import { Button } from "@/pages/_components/Button";
import { Spacer } from "@/pages/_components/Spacer";

type FoldCircuitState = {
  composed: (QuantumGate | undefined)[][];
  circuit: (DummyGate | QuantumGate)[];
}

const compareExtendedGate = (lhs: ExtendedGate, rhs: ExtendedGate): boolean => {
  switch (lhs._tag) {
    case "$controlBit":
      return rhs._tag === "$controlBit" && lhs.from === rhs.from && lhs.to === rhs.to;
    case "$controlWire":
      return rhs._tag === "$controlWire" && lhs.from === rhs.from && lhs.to === rhs.to;
    case "$dummy":
      return rhs._tag === "$dummy" && lhs.target === rhs.target;
    default:
      if (rhs._tag == "$controlBit" || rhs._tag == "$controlWire" || rhs._tag === "$dummy") return false;
      return compareGate(lhs, rhs);
  }
}
const foldCircuit = (circuit: QuantumCircuit): ComposedProgram => {
  if (circuit.steps.length == 0) {
    return [...new Array(circuit.qubitNumber)].map((_, i) => [
      { _tag: "$dummy", target: i }
    ])
  }
  const state: FoldCircuitState = {
    composed: [...new Array(circuit.qubitNumber)].map(_ => []),
    circuit: circuit.steps
  }
  while (state.circuit.length > 0) {
    const [gateHead, ...circuitRest] = state.circuit;
    state.circuit = circuitRest;

    const toBeInserted = (gate: QuantumGate | { _tag: "dummy" }, i: number): ExtendedGate | undefined => {
      switch (gate._tag) {
        case "dummy":
          return undefined;
        case "cnot":
          return (
            i == gate.target
              ? gate
              : i == gate.control
                ? {
                  _tag: "$controlBit",
                  target: i,
                  from: Math.min(gate.control, gate.target),
                  to: Math.max(gate.control, gate.target)
                }
                : {
                  _tag: "$controlWire",
                  target: i,
                  from: Math.min(gate.control, gate.target),
                  to: Math.max(gate.control, gate.target)
                }
          )
        case "ccnot":
          return (
            i == gate.target
              ? gate
              : (i == gate.control1 || i == gate.control2)
                ? {
                  _tag: "$controlBit",
                  target: i,
                  from: Math.min(gate.control1, gate.control2, gate.target),
                  to: Math.max(gate.control1, gate.control2, gate.target),
                }
                : {
                  _tag: "$controlWire",
                  target: i,
                  from: Math.min(gate.control1, gate.control2, gate.target),
                  to: Math.max(gate.control1, gate.control2, gate.target),
                }
          )
        default:
          throw new Error("Invalid gate");
      }
    }
    let insertPos = 0;
    let to = 0;
    switch (gateHead._tag) {
      case "cnot":
        const di = gateHead.control < gateHead.target ? (-1) : (+1);
        insertPos = calcMaxDepth(
          state.composed.slice(
            Math.min(gateHead.control, gateHead.target),
            Math.max(gateHead.control, gateHead.target) + 1
          )
        );
        to = gateHead.control;
        for (let i = gateHead.target; true; i = i + di) {
          state.composed[i] =
            [
              ...state.composed[i],
              ...new Array(insertPos - state.composed[i].length),
              toBeInserted(gateHead, i)
            ]
          if (i == to) break;
        }
        break;
      case "ccnot":
        const [ccnotFrom, _, ccnotTo] = [
          gateHead.control1,
          gateHead.control2,
          gateHead.target
        ].sort();
        insertPos = calcMaxDepth(
          state.composed.slice(
            Math.min(gateHead.control1, gateHead.control2, gateHead.target),
            Math.max(gateHead.control1, gateHead.control2, gateHead.target) + 1
          )
        );
        for (let i = ccnotFrom; i <= ccnotTo; i = i + 1) {
          state.composed[i] =
            [
              ...state.composed[i],
              ...new Array(insertPos - state.composed[i].length),
              toBeInserted(gateHead, i)
            ]
        }
        break;

      default:
        state.composed[gateHead.target].push(gateHead._tag !== "$dummy" ? gateHead : undefined);
    }
  }
  const maxDepth = calcMaxDepth(state.composed);
  const rearranged = state.composed.map(w =>
    w.length < maxDepth
      ? [...w, ...new Array(maxDepth - w.length)]
      : w
  );
  return rearranged;
}


const calcMaxShiftRange = (qFrom: number, qTo: number, tFrom: number, c: ComposedProgram): [number, number] => {
  const maxDepth = calcMaxDepth(c);
  let result: [number, number] = [qFrom, qTo];
  let gatesAtTimestep: (ExtendedGate | undefined)[];
  for (let i = tFrom; i < maxDepth; i++) {
    gatesAtTimestep = c.map(w => w[i]).slice(result[0], result[1] + 1);
    result = gatesAtTimestep.reduce((prev, g) => {
      if (!g) return prev;
      switch (g._tag) {
        case "$controlBit":
        case "$controlWire":
          return [Math.min(g.from, result[0]), Math.max(g.to, result[1])];
        case "cnot":
          return [Math.min(g.control, g.target, result[0]), Math.max(g.control, g.target, result[1])];
        case "ccnot":
          return [
            Math.min(g.control1, g.control2, g.target, result[0]),
            Math.max(g.control1, g.control2, g.target, result[1])
          ];
        default:
          return prev;
      }
    }, result);
  }
  return result;
}

const insertEmptyCells = (tIndex: number, qFrom: number, qTo: number, c: ComposedProgram): ComposedProgram => {
  const inserted = c.slice(qFrom, qTo + 1).map(w => {
    return [
      ...w.slice(0, tIndex),
      undefined,
      ...w.slice(tIndex)
    ]
  })
  return [
    ...c.slice(0, qFrom),
    ...inserted,
    ...c.slice(qTo + 1)
  ];
}

const swapCell = (qIndex: number, timestep1: number, timestep2: number, c: ComposedProgram): void => {
  const tmp = c[qIndex][timestep1];
  c[qIndex][timestep1] = c[qIndex][timestep2];
  c[qIndex][timestep2] = tmp;
}

const handleControlQubitClick = (
  holdingControlQubit: HoldingControlQubit,
  composed: ComposedProgram,
  setHoldingControlQubit: (h: HoldingControlQubit) => void
) =>
  (qIndex: number, tIndex: number) => {
    if (holdingControlQubit.valueOf() !== false) {
      return;
    }
    const controlQubit = composed[qIndex][tIndex];
    if (!controlQubit) {
      throw new Error("Impossible!");
    }
    // TODO CNOT自体ではなく、CNOTの制御ビットをクリックすることで制御ビット操作モードに入れるようにしたい。
  }

const handleDragControlQubit = (
  holdingControlQubit: HoldingControlQubit,
  composed: ComposedProgram,
  setHoldingControlQubit: (h: HoldingControlQubit) => void,
  setComposedProgram: (c: ComposedProgram) => void
) =>
  (
    qubitIndex: number,
    timestep: number,
    part: DropCellPart
  ) => {
    if (holdingControlQubit === false) {
      throw new Error("Impossible!");
    }
    const targetGate = composed[holdingControlQubit.targetQubitIndex][holdingControlQubit.timestep];
    if (!targetGate) {
      throw new Error("Impossible!");
    }
    const newComposed = (() => {
      if (
        composed
          .map(w => w[timestep])
          .filter(g => {
            if (g?._tag === "$controlBit" || g?._tag === "$controlWire") {
              return g !== undefined && false === [...new Array(g.to - g.from + 1)]
                .map((_, i) => i + g.from)
                .includes(holdingControlQubit.targetQubitIndex);
            }
            return g !== undefined
              && g._tag !== "$dummy"
              && false == compareExtendedGate(g, targetGate)
          })
          .length > 0
      ) {
        const [insertPos, shouldShift] = [
          timestep + (part === "right" ? +1 : 0),
          timestep < holdingControlQubit.timestep || (timestep == holdingControlQubit.timestep && part == "left")
        ];
        if (shouldShift) {
          holdingControlQubit.timestep++;
        }
        timestep = insertPos;
        return composed.map(w => [
          ...w.slice(0, insertPos),
          undefined,
          ...w.slice(insertPos)
        ]);
      }
      else {
        return [...composed];
      }
    })();

    swapCell(holdingControlQubit.targetQubitIndex, holdingControlQubit.timestep, timestep, newComposed);
    const timestepBefore = holdingControlQubit.timestep;
    holdingControlQubit.timestep = timestep;
    if (newComposed.map(w => w[timestepBefore]).some(g => g !== undefined) === false) {
      newComposed.forEach(w => {
        w.splice(timestepBefore, 1);
      })
      if (timestepBefore < holdingControlQubit.timestep) {
        holdingControlQubit.timestep--;
      }
    }
    setComposedProgram(newComposed);
    setHoldingControlQubit({
      ...holdingControlQubit,
      hovered: qubitIndex,
    });
  }

const handleDragIn = (
  holdingGate: HoldingGate,
  setHoldingGate: (h: HoldingGate) => void,
  composed: ComposedProgram,
  setComposedProgram: (composed: ComposedProgram) => void,
  // setShadowPos: (pos: [number, number]) => void
  draggingFromCanvas: DraggingFromCanvasState,
  setDraggingFromCanvas: (d: DraggingFromCanvasState) => void
) =>
  (
    qubitIndex: number,
    timestep: number,
    part: DropCellPart,
    item: DragGateItem | DragMoveGateItem,
  ) => {
    const effComposed = (() => {
      if (item.type === "MOVE_GATE") {
        return composed.map((w, i) => {
          return i === item.sourceQubit
            ? [...w.slice(0, item.sourceTimestep), undefined, ...w.slice(item.sourceTimestep + 1)]
            : w
        })
      }
      return [...composed];
    })();
    const hoveredCell = effComposed[qubitIndex][timestep];
    const maxDepth = calcMaxDepth(effComposed);
    const [newComposed, newHoldingGate, shouldShift] =
      ((): [ComposedProgram, HoldingGate, boolean] => {
        if (hoveredCell && hoveredCell._tag !== "$dummy") {
          const checkPos = part == "left"
            ? timestep - 1
            : timestep + 1;
          // 隣が空いていれば空白を入れる必要はない
          if (effComposed[qubitIndex][checkPos] === undefined
            && checkPos >= 0
            && checkPos <= maxDepth - 1
          ) {
            return [
              [...composed],
              { dropQubitIndex: qubitIndex, dropTimestep: checkPos, part },
              false
            ];
          }
          else {
            // 　空白を入れる
            const insertPos = part == "right" ? timestep + 1 : timestep;
            return [
              composed.map(w => [
                ...w.slice(0, insertPos),
                undefined,
                ...w.slice(insertPos),
              ]),
              { dropQubitIndex: qubitIndex, dropTimestep: insertPos, part },
              draggingFromCanvas.isDragging &&
              (timestep < draggingFromCanvas.sourceTimestep
                || (timestep == draggingFromCanvas.sourceTimestep && part == "left")
              )
            ];
          }

        }
        else {
          // ホバーしたセルが空白であればなにもしなくてよい
          return [
            [...composed],
            { dropQubitIndex: qubitIndex, dropTimestep: timestep, part },
            false
          ];
        }
      })();
    setComposedProgram(newComposed);
    setHoldingGate(newHoldingGate);
    if (shouldShift && draggingFromCanvas.isDragging) {
      setDraggingFromCanvas({
        ...draggingFromCanvas,
        sourceTimestep: draggingFromCanvas.sourceTimestep + 1
      })
    }
  }

export const staticCircuitProps = (circuit: QuantumCircuit): Props => ({
  circuit,
  mode: "normal",
  toggleMode: _1 => () => { },
  onCircuitUpdate: _ => { },
  draggingFromPalette: false,
  fixedQubitNumber: true,
  static: true
});

interface Props {
  circuit: QuantumCircuit;
  mode: Mode;
  toggleMode: (m: Mode) => () => void;
  onCircuitUpdate: (newCircuit: QuantumCircuit) => void;
  draggingFromPalette: boolean;
  fixedQubitNumber: boolean;
  static: boolean;
}

type ComposedProgram = (undefined | ExtendedGate)[][];

const calcMaxDepth = (composed: ComposedProgram) => {
  return composed.reduce((prev, gs) => {
    return (gs.length >= prev) ? gs.length : prev
  }, 0);
}

const reconstructCircuit = (composed: ComposedProgram, qubitNumber: number, circuitDepth: number): QuantumCircuit => {
  const toGate = (x: ExtendedGate | undefined, qIndex: number): undefined | QuantumGate => {
    if (!x) return { _tag: "$dummy", target: qIndex } as unknown as QuantumGate;
    switch (x._tag) {
      case "$controlBit":
        return undefined;
      case "$controlWire":
        return undefined;
      default:
        return x as unknown as QuantumGate
    }
  };

  return {
    qubitNumber,
    steps: [...new Array(circuitDepth)]
      .flatMap((_, timestep) => composed.map((gs, i) => toGate(gs[timestep], i)).filter(x => x !== undefined))
  };
}

const handleDropNewGate = (
  qubitIndex: number,
  timestep: number,
  item: DragGateItem,
  composedProgram: ComposedProgram,
  handleComposedProgramUpdated: (newComposed: ComposedProgram) => void,
  setHoldingControlQubit: (h: HoldingControlQubit) => void,
) => {
  const hole = composedProgram[qubitIndex][timestep];
  if (hole && hole._tag !== "$dummy") return;
  const newComposed = [...composedProgram];
  newComposed[qubitIndex][timestep] = dragGateItemToQuantumGate(qubitIndex, item);
  handleComposedProgramUpdated(newComposed);
  switch (item.gateTag) {
    case "cnot":
      setHoldingControlQubit({ targetQubitIndex: qubitIndex, hovered: qubitIndex, timestep, rest: 1 })
      return;
    case "ccnot":
      setHoldingControlQubit({ targetQubitIndex: qubitIndex, hovered: qubitIndex, timestep, rest: 2 })
      return;
  }
};

const handleMoveGate = (
  qubitIndex: number,
  timestep: number,
  item: DragMoveGateItem,
  composedProgram: ComposedProgram,
  handleComposedProgramUpdated: (newComposed: ComposedProgram) => void,
  setHoldingControlQubit: (h: HoldingControlQubit) => void,
  draggingFromCanvas: DraggingFromCanvasState,
  setDraggingFromCanvas: (d: DraggingFromCanvasState) => void
) => {
  if (draggingFromCanvas.isDragging === false) {
    throw new Error("Impossible!");
  }
  const { sourceTimestep } = draggingFromCanvas;
  const hole = composedProgram[qubitIndex][timestep];
  if (hole) return;
  const newComposed = [...composedProgram];
  const movingGate = (() => {
    const originalGate = composedProgram[item.sourceQubit][sourceTimestep];
    if (!originalGate) {
      throw new Error("Impossible!");
    }
    switch (originalGate._tag) {
      case "cnot":
        return { ...originalGate, control: qubitIndex, target: qubitIndex };
      case "ccnot":
        return { ...originalGate, control1: qubitIndex, control2: qubitIndex, target: qubitIndex };
      default:
        return { ...originalGate, target: qubitIndex };
    }
  })();
  newComposed[qubitIndex][timestep] = movingGate;
  composedProgram[item.sourceQubit][sourceTimestep] = undefined;
  handleComposedProgramUpdated(newComposed);
  switch (movingGate._tag) {
    case "cnot":
      setHoldingControlQubit({ targetQubitIndex: qubitIndex, hovered: qubitIndex, timestep, rest: 1 });
      break;

    case "ccnot":
      setHoldingControlQubit({ targetQubitIndex: qubitIndex, hovered: qubitIndex, timestep, rest: 2 })
      break;
  }
}
type HoldingGate =
  | false
  | { dropQubitIndex: number, dropTimestep: number, part: DropCellPart };

type HoldingControlQubit =
  | false
  | { targetQubitIndex: number; timestep: number, rest: number, hovered: number };

type DraggingFromCanvasState =
  | { isDragging: false }
  | { isDragging: true, sourceQubitIndex: number, sourceTimestep: number }
  ;

type GateViewer =
  | false
  | { gate: QuantumGate, timestep: number, values: any[] }

type GateViewerEventType =
  | { readonly _tag: "ParametrizedGateParamChange", params: Array<number> }
  ;
const handleGateViewer = (
  ev: GateViewerEventType,
  gateViewerState: GateViewer,
  setGateViewerState: (gv: GateViewer) => void
) => {
  if (gateViewerState === false) {
    return;
  }
  const gate = gateViewerState.gate;
  switch (ev._tag) {
    case "ParametrizedGateParamChange":
      switch (gate._tag) {
        case "rx":
        case "ry":
        case "rz":
          return setGateViewerState({
            ...gateViewerState,
            values: [ev.params[0]]
          });
        default:
          return;
      }
  }
}

const handleGateVierwerUpdate = (
  composedProgram: ComposedProgram,
  handleComposedProgramUpdated: (c: ComposedProgram) => void,
  gateViewerState: GateViewer,
  setGateViewerState: (gs: GateViewer) => void
) => {
  if (gateViewerState === false) {
    return;
  }

  const newComposed: ComposedProgram = (() => {
    switch (gateViewerState.gate._tag) {
      case "rx":
      case "ry":
      case "rz":

        return composedProgram.map((w, qIndex) =>
          qIndex !== gateViewerState.gate.target
            ? w
            : w.map((g, tIndex) =>
              gateViewerState.timestep !== tIndex
                ? g
                : { ...gateViewerState.gate, arg: gateViewerState.values[0] * Math.PI }
            )
        );
      default:
        return [...composedProgram];
    }
  })();

  handleComposedProgramUpdated(newComposed);
}
export default (props: Props) => {
  const [qubitNumber, setQubitNumber] = useState(props.circuit.qubitNumber);
  const [circuitDepth, setCircuitDepth] = useState(0);
  const [composedProgram, setComposedProgram] = useState<ComposedProgram>([]);
  const [holdingControlQuit, setHoldingControlQubit] = useState<HoldingControlQubit>(false)
  const [holdingGate, setHoldingGate] = useState<HoldingGate>(false);
  const [draggingFromCanvas, setDraggingFromCanvas] = useState<DraggingFromCanvasState>({ isDragging: false });

  const [gateViewer, setGateViewer] = useState<GateViewer>(false);

  useEffect(() => {
    const composed = foldCircuit(props.circuit);
    setComposedProgram(composed);
    setQubitNumber(props.circuit.qubitNumber);
  }, [props.circuit]);

  useEffect(() => {
    const maxDepth = calcMaxDepth(composedProgram)
    setCircuitDepth(maxDepth);
  }, [composedProgram])

  useEffect(() => {
    if (draggingFromCanvas.isDragging) {
      const {
        sourceQubitIndex: qIndex,
        sourceTimestep: tIndex
      } = draggingFromCanvas
      const originralGate = composedProgram[qIndex][tIndex];
      switch (originralGate?._tag) {
        case "cnot":
          composedProgram[qIndex][tIndex] = {
            ...originralGate,
            control: originralGate.target
          }
          handleComposedProgramUpdated(composedProgram, qubitNumber.valueOf())
          break;
      }
    }
  }, [draggingFromCanvas])

  useEffect(() => {
    if (holdingControlQuit === false) {
      props.toggleMode("normal")();
    }
    else {
      if (props.mode !== "control") {
        props.toggleMode("control")();
      }
    }
  }, [holdingControlQuit]);

  const mkCellElement = (qIndex: number, gatesAtTimestep: (undefined | ExtendedGate)[]) => {
    const gate = gatesAtTimestep[qIndex];

    if (gate) {
      switch (gate._tag) {
        case "$controlBit":
          return ControlQubit(
            [
              gate.from < qIndex ? [Up] : [],
              gate.to > qIndex ? [Down] : []
            ].flat()
          );
        case "$controlWire":
          return ControlWire;
        default:
          return Gate(gate);
      }
    }
    return EmptyCell;
  };

  const handleComposedProgramUpdated = (composed: ComposedProgram, qubitNumber: number) => {
    let dropsCnt = 0;
    for (let i = calcMaxDepth(composed) - 1; i >= 0; i--) {
      if (composed.map(w => w[i]).every(g => g === undefined)) {
        dropsCnt++;
      }
      else break;
    }
    const newComposed = dropsCnt == 0
      ? [...composed]
      : composed.map(w => w.slice(0, (-1) * dropsCnt));
    const newCircuitDepth = calcMaxDepth(newComposed);
    const newCircuit = reconstructCircuit(newComposed, qubitNumber, newCircuitDepth);
    props.onCircuitUpdate(newCircuit);
  }

  const handleDrop = (qubitIndex: number, timestep: number, item: DragGateItem | DragMoveGateItem) => {
    (() => {
      switch (item.type) {
        case ItemTypeGate:
          return handleDropNewGate(
            qubitIndex,
            timestep,
            item,
            composedProgram,
            (c) => handleComposedProgramUpdated(c, qubitNumber.valueOf()),
            setHoldingControlQubit
          );
        case ItemTypeMoveGate:
          return handleMoveGate(
            qubitIndex,
            timestep,
            item,
            composedProgram,
            (c) => handleComposedProgramUpdated(c, qubitNumber.valueOf()),
            setHoldingControlQubit,
            draggingFromCanvas,
            setDraggingFromCanvas
          );
      }
    })();
    setHoldingGate(false);
  }

  const handleSetControlQubit = (
    composed: ComposedProgram,
    setComposedProgram: (c: ComposedProgram) => void,
    holdingControlQubit: HoldingControlQubit,
    setHoldingControlQubit: (h: HoldingControlQubit) => void
  ) => (cqIndex: number, cqTimestep: number) => {
    if (holdingControlQubit === false) {
      throw new Error("Impossible!");
    }
    if (holdingControlQubit.timestep !== cqTimestep) return;
    const controlledGate = composed[holdingControlQubit.targetQubitIndex][holdingControlQubit.timestep];
    if (!controlledGate) {
      throw new Error("Impossible!")
    }
    const [from, to] = [cqIndex, holdingControlQubit.targetQubitIndex].sort();

    const newItem = (i: number): ExtendedGate => {
      if (i === cqIndex) return { _tag: "$controlBit", from, to, target: cqIndex };
      if (i === holdingControlQubit.targetQubitIndex) {
        switch (controlledGate._tag) {
          case "cnot":
            controlledGate.control = cqIndex;
            return controlledGate;
          case "ccnot":
            const controlkey = holdingControlQubit.rest === 2
              ? "control2"
              : "control1"
              ;
            controlledGate[controlkey] = cqIndex;
            return controlledGate;
          default:
            throw new Error("Impossible!");
        }
      }
      return { _tag: "$controlWire", from, to, target: i };
    }

    const newComposed = composed.map((w, i) => {
      return (i < from || i > to)
        ? w
        // ){...w, [cqTimestep]: newItem(i) }
        : [...w.slice(0, cqTimestep), newItem(i), ...w.slice(cqTimestep + 1)]
    });
    handleComposedProgramUpdated(newComposed, qubitNumber.valueOf());
    const controlQubitRest = holdingControlQubit.rest;
    if (controlQubitRest == 1) {
      setHoldingControlQubit(false);
    }
    else {
      setHoldingControlQubit({
        ...holdingControlQubit,
        rest: controlQubitRest - 1
      })
    }
  }

  const handleAddQubitButton = () => {
    // setComposedProgram(foldCircuit({ ...props.circuit, qubitNumber: qubitNumber.valueOf() + 1 }))
    props.onCircuitUpdate({
      ...props.circuit,
      qubitNumber: props.circuit.qubitNumber.valueOf() + 1
    });
  }

  const handleGateElementClick = (qIndex: number, tIndex: number) => {
    if (props.mode == "eraser") {
      handleComposedProgramUpdated(composedProgram.map((w, i) =>
        i === qIndex
          ? [...w.slice(0, tIndex), undefined, ...w.slice(tIndex + 1)]
          : w
      ), qubitNumber.valueOf())
    }
    else if (props.mode == "control") {
      return;
    }
    else {
      const clickedGate = composedProgram[qIndex][tIndex];
      if (!clickedGate || clickedGate._tag == "$dummy") return;
      switch (clickedGate._tag) {
        case "rx":
        case "ry":
        case "rz":
          setGateViewer({
            gate: clickedGate,
            timestep: tIndex,
            values: [clickedGate.arg / Math.PI]
          })
          return;
        default:
          setGateViewer(false);
          return;
      }
    }

  }

  const handleControlledGateClick = (qIndex: number, tIndex: number) => {
    if (props.mode === "eraser") return;

    const gate = composedProgram[qIndex][tIndex];
    switch (gate?._tag) {
      case "cnot":
        const [cnotFrom, cnotTo] = [gate.control, gate.target].sort();

        composedProgram.forEach((w, i) => {
          w[tIndex] = i == qIndex
            ? ({ ...gate, control: qIndex })
            : [...new Array(cnotTo - cnotFrom + 1)].map((_, j) => cnotFrom + j).includes(i)
              ? undefined
              : w[tIndex];
        });
        handleComposedProgramUpdated(composedProgram, qubitNumber.valueOf());
        
        setHoldingControlQubit({ targetQubitIndex: qIndex, hovered: qIndex, timestep: tIndex, rest: 1 });
        props.toggleMode("control")();
        break;
      case "ccnot":
        composedProgram.forEach((w, i) => {
          w[tIndex] = i == qIndex ? { ...gate, control1: qIndex, control2: qIndex } : undefined;
        });
        handleComposedProgramUpdated(composedProgram, qubitNumber.valueOf());
        setHoldingControlQubit({ targetQubitIndex: qIndex, hovered: qIndex, timestep: tIndex, rest: 2 });
        props.toggleMode("control")();
        break;
      default:
        return;
    }
    // if (props.mode === "eraser") {
    //   handleComposedProgramUpdated((() => {
    //     composedProgram[qIndex][tIndex] = undefined;
    //     return composedProgram;
    //   })(), qubitNumber.valueOf());
    //   setHoldingControlQubit(false);
    // }
  };

  const handleQubitClick = (qIndex: number) => {
    const wire = composedProgram[qIndex];
    if (props.mode === "eraser") {
      if (wire.every(g => g === undefined || g._tag === "$dummy")) {
        handleComposedProgramUpdated([
          ...composedProgram.slice(0, qIndex),
          ...composedProgram.slice(qIndex + 1)
        ], composedProgram.length - 1);
      }
    }
  }


  return (
    <div
      className={clsx([
        ["flex"],
        [gateViewer === false ? "gap-0" : "gap-3"]
      ])}
    >
      <div
        className={clsx([
          ["relative", "min-h-64", "my-5"],
          ["transition-all"],
          gateViewer === false ? ['w-full'] : ['w-[calc(60%-24px)]'],
          ["overflow-auto"],
          ["border", "border-neutral-content", "rounded-sm"]
        ])}
      >
        <div
          className={clsx([
            ['flex']
          ])}
        >
          <div
            className={clsx([
              ['py-5', 'pl-2'],
            ])}
          >
            {[...new Array(qubitNumber)].map((_, qIndex) => {
              return (
                <div
                  className={clsx([
                    ['h-[64px]', 'w-8'],
                    ['flex', 'justify-center', 'items-center']
                  ])}
                  key={qIndex}
                  onClick={() => handleQubitClick(qIndex)}
                >
                  <span
                    className={clsx([
                      props.mode === "eraser" 
                        ? (composedProgram[qIndex].every(x => x === undefined || x._tag == "$dummy")
                            ? ["text-neutral-content hover:text-status-job-failed"] 
                            : ["text-disable-bg"]
                          )
                        : []
                    ])}
                  >q{qIndex}</span>
                </div>
              )
            })
            }
            {
              props.fixedQubitNumber === false
                ? <div
                  className={clsx([
                    ['h-8', 'w-8'],
                    ['flex', 'justify-center', 'items-center'],
                    ['rounded-full', 'bg-neutral-content', 'text-primary-content'],
                    ['hover:bg-primary'],
                    ['cursor-pointer']
                  ])}
                  onClick={handleAddQubitButton}
                >
                  <span>+</span>
                </div>
                : null
            }
          </div>
          <div
            className={clsx([
              ['relative', 'h-full', 'w-full']
            ])}
          >
            <div
              style={{
                gridTemplateRows: `repeat(${qubitNumber}, 64px)`,
                gridTemplateColumns: `repeat(${circuitDepth}, 64px)`,
              }}
              className={clsx([
                ["absolute", "top-0", "left-0", "p-5",],
                ["grid", "grid-flow",],
                ["z-20", "w-full",],
                ["transition-all", "duration-300"]
              ])}
            >
              {
                [...new Array(qubitNumber)].map((_, qIndex) =>
                  [... new Array(circuitDepth)].map((_, tIndex) => {
                    // slice of quantum circuit at current timestep
                    const gatesAtTimestep = composedProgram.map(row => row[tIndex]);

                    const elm = mkCellElement(qIndex, gatesAtTimestep);

                    return (
                      <div
                        className={clsx([
                          'relative', 'w-full', 'h-full'
                        ])}
                        key={`cell-q${qIndex}-t${tIndex}`}
                      >
                        <div
                          className={clsx([
                            'absolute', 'top-0', 'left-0',
                            'w-full', 'h-full', 'z-20',
                            'flex', 'items-center', 'justify-center'
                          ])}
                        >
                          <QuantumCircuitGateCell
                            element={elm}
                            qubitIndex={qIndex}
                            timestep={tIndex}
                            isDragging={draggingFromCanvas.isDragging && draggingFromCanvas.sourceQubitIndex === qIndex && draggingFromCanvas.sourceTimestep === tIndex}
                            // isDragging={false}
                            previewControl={(() => {
                              // FIXME Avoid inlining long process. Split to function.
                              if (holdingControlQuit === false || holdingControlQuit.timestep !== tIndex) return null;
                              if (holdingControlQuit.targetQubitIndex === qIndex) {
                                return {
                                  _tag: "controlledGate",
                                  directions: [
                                    qIndex < holdingControlQuit.hovered ? ["down"] : [],
                                    qIndex > holdingControlQuit.hovered ? ["up"] : []
                                  ].flat() as ("down" | "up")[]
                                };
                              }
                              const [from, to] = [holdingControlQuit.hovered, holdingControlQuit.targetQubitIndex].sort();
                              if (holdingControlQuit.hovered === qIndex) {
                                return {
                                  _tag: "controlQubit",
                                  directions: [holdingControlQuit.targetQubitIndex >= qIndex ? "down" : "up"]
                                };
                              }
                              if (qIndex > from && qIndex < to) {
                                return { _tag: "controlWire" }
                              }
                              return null
                            })()
                            }
                            static={props.static}
                            focused={
                              holdingGate !== false
                              && qIndex == holdingGate.dropQubitIndex
                              && tIndex == holdingGate.dropTimestep
                            }
                            active={
                              (gateViewer !== false
                                && gateViewer.gate.target == qIndex
                                && gateViewer.timestep == tIndex)
                              || (holdingControlQuit !== false
                                && holdingControlQuit.targetQubitIndex == qIndex
                                && holdingControlQuit.timestep == tIndex
                              )
                            }
                            onClickGateElement={props.static ? (_1, _2) => { } : handleGateElementClick}
                            onClickControlQubit={props.static ? (..._) => { } : handleControlQubitClick(holdingControlQuit, composedProgram, setHoldingControlQubit)}
                            onClickControlledGate={props.static ? (..._) => { } : handleControlledGateClick}
                            onDragStart={props.static
                              ? (..._) => { }
                              : () => {
                                setDraggingFromCanvas({
                                  isDragging: true,
                                  sourceQubitIndex: qIndex,
                                  sourceTimestep: tIndex
                                });
                              }
                            }
                            onDragEnd={props.static
                              ? () => { }
                              : () => {
                                setDraggingFromCanvas({ isDragging: false });
                              }
                            }
                            key={`q${qIndex}-t${tIndex}`}
                          />
                        </div>
                        <div
                          className={clsx([
                            ['absolute', 'top-0', 'left-0'],
                            ['z-10'],
                            ['w-full', 'h-full'],
                            ['flex', 'justify-center', 'items-center']
                          ])}
                        >
                          <div
                            className={clsx([
                              ['w-full', 'h-1'],
                              ['bg-neutral-content']
                            ])}
                          />
                        </div>
                      </div>
                    )
                  })
                )
              }
            </div>

            <div
              style={{
                gridTemplateRows: `repeat(${qubitNumber}, 64px)`,
                gridTemplateColumns: `repeat(${circuitDepth}, 64px)`,
              }}
              className={clsx([
                ["absolute", "top-0", "left-0", "p-5",],
                ["grid", "grid-flow-col",],
                [props.draggingFromPalette || draggingFromCanvas.isDragging || holdingControlQuit !== false ? "z-30" : "z-10"]
              ])}
            >
              {props.static === false && circuitDepth > 0
                ? [...new Array(circuitDepth)].map((_, tIndex) =>
                  [...new Array(qubitNumber)].map((_, qIndex) => {
                    return (
                      <div
                        className={clsx([
                          'relative', 'w-full', 'h-full',
                          'flex', 'justify-center', 'items-center'
                        ])}
                        key={`drop-cell-q${qIndex}-t${tIndex}`}
                      >
                        <QuantumCircuitDropCell
                          qubitIndex={qIndex}
                          timestep={tIndex}
                          part={"left"}
                          holdingControlQubit={holdingControlQuit}
                          onDragIn={handleDragIn(
                            holdingGate,
                            setHoldingGate,
                            composedProgram,
                            setComposedProgram,
                            draggingFromCanvas,
                            setDraggingFromCanvas
                          )}
                          onDrop={(qubit, timestep, _, item) => handleDrop(qubit, timestep, item)}
                          onDragControlQubit={handleDragControlQubit(
                            holdingControlQuit,
                            composedProgram,
                            setHoldingControlQubit,
                            setComposedProgram
                          )}
                          onSetControlQubit={handleSetControlQubit(
                            composedProgram,
                            setComposedProgram,
                            holdingControlQuit,
                            setHoldingControlQubit
                          )}
                        />
                        <QuantumCircuitDropCell
                          qubitIndex={qIndex}
                          timestep={tIndex}
                          part={"right"}
                          holdingControlQubit={holdingControlQuit}
                          onDragIn={handleDragIn(
                            holdingGate,
                            setHoldingGate,
                            composedProgram,
                            setComposedProgram,
                            draggingFromCanvas,
                            setDraggingFromCanvas
                          )} onDrop={(qubit, timestep, _, item) => handleDrop(qubit, timestep, item)}
                          onDragControlQubit={handleDragControlQubit(
                            holdingControlQuit,
                            composedProgram,
                            setHoldingControlQubit,
                            setComposedProgram
                          )}
                          onSetControlQubit={handleSetControlQubit(
                            composedProgram,
                            setComposedProgram,
                            holdingControlQuit,
                            setHoldingControlQubit
                          )}
                        />
                      </div>
                    )
                  })
                )
                : null
              }
            </div>
          </div>
        </div>
        <div>
          {/* {draggingFromCanvas.isDragging ? `{ isDragging: true, sourceQubitIndex: ${draggingFromCanvas.sourceQubitIndex}, sourceTimestep: ${draggingFromCanvas.sourceTimestep}` : "{ isDragging: false }"} */}
          <div>
            {/* {holdingGate ? `{ dropTimestep: ${holdingGate.dropTimestep}, dropQubitIndex ${holdingGate.dropQubitIndex}}` : "false"} */}
          </div>
        </div>
        {/* {holdingControlQuit ? `{ hovered: ${holdingControlQuit.hovered}, timestep: ${holdingControlQuit.timestep}, rest: ${holdingControlQuit.rest}, targetQubit: ${holdingControlQuit.targetQubitIndex}}` : "false"} */}
      </div>

      {/* Gate Viewer */}
      <div
        className={clsx([
          gateViewer !== false ? ['w-[40%]'] : ['w-0', 'border-0'],
          ["relative", "min-h-64", "my-5", "p-3"],
          ["transition-all"],
          ["overflow-auto", "rounded"],
          ["border", "border-neutral-content", "rounded-sm"]
        ])}
      >
        {gateViewer !== false
          ? (
            <div className="p-2 flex flex-col gap-5 h-full">
              <div className="w-full flex justify-center">
                <h1
                  className={clsx([
                    ["text-primary", "font-bold", "text-xl"],
                    ["mb-3"]
                  ])}
                >
                  {t("composer.gate_viewer.title")}
                </h1>

                <div
                  className="ml-auto cursor-pointer rounded-full "
                  onClick={() => setGateViewer(false)}
                >
                  <img
                    src="/img/common/sidebar_arrow.svg"
                    alt=""
                    width="25"
                    height="25"
                  />
                </div>
              </div>
              <div className="w-full">

                <div className="grid grid-cols-8 ">
                  <span className="col-span-2">
                    <QuantumGateElement
                      gate={gateViewer.gate}
                      qubitIndex={0}
                      timestep={0}
                      active={false}
                      static={props.static}
                      isDragging={false}
                      onClick={() => { }}
                    />
                  </span>
                  <div className="col-span-6">
                    <h2 className="font-bold text-base-content">
                      {gateName(gateViewer.gate)}
                    </h2>
                  </div>
                </div>

                <Spacer className="h-6" />

                {(() => {
                  switch (gateViewer.gate._tag) {
                    case "rx":
                    case "ry":
                    case "rz":
                      return (
                        <div className="w-full mt-5">
                          <div className="grid grid-cols-12 gap-3 items-center justify-center">
                            <div className="sm:col-span-12 col-span-12">
                              Param
                            </div>
                            <div className="sm:col-span-8 col-span-12 px-3">
                              <div className="flex flex-col">
                                <Slider
                                  key="param-slider1"
                                  aria-label="θ"
                                  onChange={(ev, val) => handleGateViewer(
                                    { _tag: "ParametrizedGateParamChange", params: [val] },
                                    gateViewer,
                                    setGateViewer
                                  )}
                                  value={Number(gateViewer.values[0])}
                                  min={0}
                                  max={2}
                                  step={0.001}
                                />
                                <div className="flex w-full">
                                  <span className="mr-auto"> 0</span>
                                  <span className="ml-auto">2π</span>
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-4 col-span-12 flex items-center">
                              <Input
                                type="number"
                                max={2}
                                min={0}
                                step={0.001}
                                value={gateViewer.values[0]}
                                onChange={(ev) => {
                                  const value = Number(ev.target.value);
                                  if (isNaN(value)) return;
                                  handleGateViewer({
                                    _tag: "ParametrizedGateParamChange",
                                    params: [value]
                                  }, gateViewer, setGateViewer)
                                }}
                              />
                              <span className="mx-2">π</span>
                            </div>
                          </div>
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>

              {props.static === false ?
                <div className="w-full mt-auto">
                  <Button
                    onClick={() => handleGateVierwerUpdate(
                      composedProgram,
                      (c) => handleComposedProgramUpdated(c, qubitNumber.valueOf()),
                      gateViewer,
                      setGateViewer,
                    )}
                    color="secondary"
                  >
                    {t('composer.gate_viewer.update')}
                  </Button>
                </div>
                : null}
            </div>
          )
          : null
        }
      </div>
    </div>
  );
}