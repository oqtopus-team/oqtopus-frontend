import { ShotResult } from "@/backend/qulacs/types";
import React, { useMemo } from "react";
import { SamplingChartPoint, SimulatorResultSamplingChart } from "./LocalSimlSamplingResultChart";
import { roundNumber } from "../misc";
import clsx from "clsx";

export interface Props {
  qubitNumber: number;
  shotResult: null | ShotResult;
}

export const SamplingExecutionResult: React.FC<Props> = (props) => {
  const points = useMemo<SamplingChartPoint[]>(() => {
    return [...new Array(2 ** props.qubitNumber)].map((_, i) => {
      return {
        name: `${i.toString(2).padStart(props.qubitNumber, '0')}`,
        count: props.shotResult?.samplingMap[i] ?? 0,
      }      
    });
  }, [props.shotResult, props.qubitNumber]);

  return (
    <div
      className={clsx([
        ['flex', 'items-center'],
      ])}
    >
      <SimulatorResultSamplingChart
        shot={props.shotResult?.shotNumber ?? 1000}
        data={points}
      />
    </div>
  );
}