import { useEffect, useState } from "react"
import QuantumCircuitCanvas from "./QuantumCircuitCanvas"
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import clsx from "clsx"
import QuantumGatePalette from "./QuantumGatePalette";
import { DummyGate, Mode } from "../composer";
import { GateI, GateX, GateY, GateZ, QuantumGate } from "../gates";
import { Observable, transpose } from "../observable";
import { QuantumCircuit } from "../circuit";
import { Input } from "@/pages/_components/Input";

type OperatorGate = GateX | GateY | GateZ | GateI | DummyGate;

const allGates: QuantumGate["_tag"][] =
  [
    "i",
    "x",
    "y",
    "z",
  ]

const circuitOfObservable = (ob: Observable): QuantumCircuit => {
  return {
    qubitNumber: ob.qubitNumber,
    steps: transpose(ob.operators).flatMap((gs) => gs.filter(g => g !== undefined)),
  };
}
export interface ObservableComposerProps {
  observable: Observable;
  onObservableUpdate: (o: Observable) => void;
}

const renderPauli = (operators: (QuantumGate | DummyGate)[]) => {
  return operators.reduce((prev, gate) => {
    switch (gate._tag) {
      case "$dummy":
        return prev == "" ? "I" : `${prev} ⊗ I`;
      case "i":
      case "x":
      case "y":
      case "z":
        return prev == "" ? gate._tag.toUpperCase() : `${prev} ⊗ ${gate._tag.toUpperCase()}`;
      default:
        return prev;
    }

  }, "")
}
export default (props: ObservableComposerProps) => {
  const [circuit, setCircuit] = useState<QuantumCircuit>({ qubitNumber: 0, steps: [] });
  const [grabbingGate, setGrabbingGate] = useState<null | QuantumGate["_tag"]>(null);
  const [mode, setMode] = useState<Mode>("normal");

  useEffect(() => {
    setCircuit(circuitOfObservable(props.observable));
  }, [props.observable]);

  const handleDragFromGatePalette = (gateTag: QuantumGate["_tag"]) => {
    setGrabbingGate(gateTag);
  }

  const toggleMode = (m: Mode) => () => {
    if (mode !== m) {
      setMode(m);
    }
    else {
      setMode("normal");
    }
  }

  const handleObservableUpdate = (c: QuantumCircuit) => {
    const gateMatrix = c.steps.reduce<QuantumGate[][]>((prev, gate) => {
      return [
        ...prev.slice(0, gate.target),
        [...prev[gate.target], gate],
        ...prev.slice(gate.target + 1)
      ];
    }, [...new Array(c.qubitNumber)].map((_) => []));

    const operators = transpose(gateMatrix);

    const newObservable: Observable = {
      qubitNumber: c.qubitNumber,
      coeffs: [...new Array(operators.length)].map((_, i) => props.observable.coeffs[i] ?? 1.0),
      operators: transpose(gateMatrix)
    }
    props.onObservableUpdate(newObservable);
  }

  const handleCoefficientUpdate = (timestep: number, coeff: number) => {
    props.onObservableUpdate({
      ...props.observable,
      coeffs: props.observable.coeffs.map((c, i) => i === timestep ? coeff : c)
    })
  }

  return (
    <div className="flex items-stretch">
      <div className="w-1/2">
        <DndProvider backend={HTML5Backend}>
          <div
            className={clsx([
              ["w-full"]
            ])}
          >
            <QuantumGatePalette
              mode={mode}
              toggleMode={toggleMode}
              supportedGates={allGates}
              onDragStart={handleDragFromGatePalette}
              onDragEnd={() => setGrabbingGate(null)}
            />
          </div>

          <QuantumCircuitCanvas
            circuit={circuit}
            mode={mode}
            toggleMode={toggleMode}
            onCircuitUpdate={handleObservableUpdate}
            draggingFromPalette={grabbingGate !== null}
            fixedQubitNumber
          />
        </DndProvider>

      </div>

      <div className="w-1/2">
        <div className="h-full flex items-center">
          <div className="flex flex-col gap-3">

            {props.observable.coeffs
              .map((coeff, i) => {
                return (
                  <div
                    className="flex flex-nowrap gap-4 items-center"
                    key={i}
                  >
                    <div className={clsx([
                      ["w-1/3", "flex"],
                      [i == 0 ? "justify-center" : "justify-end"]
                    ])}
                    >
                      {i == 0
                          ? <div>H = </div>
                          : <div>+</div>
                      }

                    </div>
                    <div className="w-1/3">
                      <Input
                        type="number"
                        value={coeff}
                        step={0.0000001}
                        onInput={(ev) => {
                          const coeff = (ev.target as HTMLInputElement).valueAsNumber;
                          handleCoefficientUpdate(i, coeff)
                        }}
                      />
                    </div>
                    <div>×</div>
                    <div className="w-1/3">
                      {renderPauli(props.observable.operators[i])}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}