import clsx from "clsx";
import { QuantumGate } from "../gates";
import { Mode } from "../composer";
import "./Composer.css";
import QuantumGatePaletteItem from "./QuantumGatePaletteItem";
import { useContext, useEffect, useState } from "react";
import { circuitContext } from "../circuit";

export default () => {
  const circuitService = useContext(circuitContext);
  const [mode, setMode] = useState(circuitService.mode);

  useEffect(() => circuitService.onModeChange(setMode), []);

  // TODO: disable multi qubit gates when there's only one row
  return (
    <div className={clsx(["flex gap-1"])}>
      {circuitService.supportedGates.map((gateTag) => (
        <QuantumGatePaletteItem gateTag={gateTag} key={gateTag} disabled={mode !== "normal"} />
      ))}
      <div
        className={clsx([
          ["flex", "items-center", "justify-center"],
          ["w-10", "h-10", "rounded"],
          ["cursor-pointer"],
          ["border", "border-gate-operation-border"],
          mode == "eraser" ? ["bg-gate-operation-enabled"] : [],
        ])}
        onClick={() => circuitService.toggleMode("eraser")}
      >
        <img className="p-2" src={`/img/composer/eraser.svg`} />
      </div>
    </div>
  );
};
