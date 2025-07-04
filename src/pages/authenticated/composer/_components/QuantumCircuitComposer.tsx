import { useState } from "react"
import QuantumCircuitCanvas from "./QuantumCircuitCanvas"
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { QuantumCircuit } from "../circuit"
import { GateCNOT, GateH, GateX, GateZ, QuantumGate } from "../gates"
import clsx from "clsx"
import QuantumGatePalette from "./QuantumGatePalette";
import { Mode } from "../composer";

export interface QuantumCircuitComposerProps {
  supportedGates: Array<QuantumGate["_tag"]>;
  circuit: QuantumCircuit;
  onCircuitUpdate: (c: QuantumCircuit) => void;
  fixedQubitNumber?: boolean;
}
export default (props: QuantumCircuitComposerProps) => {

  const [grabbingGate, setGrabbingGate] = useState<null | QuantumGate["_tag"]>(null);

  const [mode, setMode] = useState<Mode>("normal");

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={clsx([
          ["w-full"]
        ])}
      >
        <QuantumGatePalette
          mode={mode}
          toggleMode={toggleMode}
          supportedGates={props.supportedGates}
          onDragStart={handleDragFromGatePalette}
          onDragEnd={() => setGrabbingGate(null)}
        />
      </div>

      <QuantumCircuitCanvas
        circuit={props.circuit}
        mode={mode}
        toggleMode={toggleMode}
        onCircuitUpdate={props.onCircuitUpdate}
        draggingFromPalette={grabbingGate !== null}
        fixedQubitNumber={props.fixedQubitNumber || false}
      />
    </DndProvider>
  )
}