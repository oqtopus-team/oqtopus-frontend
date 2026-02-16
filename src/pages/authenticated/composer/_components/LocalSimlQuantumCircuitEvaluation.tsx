import { JobsJobType } from "@/api/generated";
import React, { useMemo } from "react";
import { QuantumCircuitEvaluationResult } from "@/backend/qulacs/types";
import clsx from "clsx";
import { EvaluationStateVectorChart } from "./LocalSimlEvalStateVectorChart";
import { roundNumber } from "../misc";

export interface Props {
  jobType: JobsJobType;
  qubitNumber: number;
  evaluationResult: QuantumCircuitEvaluationResult;
};

export const QuantumCircuitEvaluation: React.FC<Props> = (props) => {
  const amplitudeData = useMemo(() => {
    const {
      stateVector: points,
      stateVectorAbsoluted: absPoints,
      stateVectorArgument: argPoints
    } = props.evaluationResult;

    return points.map((point, i) => {
      return {
        name: `${i.toString(2).padStart(props.qubitNumber, '0')}`,
        stateVector: {
          re: roundNumber(point.re, 5),
          im: roundNumber(point.im, 5),
        },
        stateVectorAbsoluted: roundNumber(absPoints[i], 5),
        stateVectorArgument: roundNumber(argPoints[i], 5),
      };
    });
  }, [props.evaluationResult, props.qubitNumber])

  return (
    <div
      className={clsx([
        ['flex', 'items-center'],
      ])}
    >
      <EvaluationStateVectorChart
        data={amplitudeData}
      />
    </div>
  );
}