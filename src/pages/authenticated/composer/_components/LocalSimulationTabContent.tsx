import { useQulacsSimulator } from "@/backend/qulacs/hook"
import { Button } from "@/pages/_components/Button";
import { Input } from "@/pages/_components/Input";
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuantumCircuitService } from "../circuit";
import { JobsJobType, JobsOperatorItem } from "@/api/generated";
import { CircuitInfo } from "qulacs-wasm-simulator-client";
import { parseCircuitJSON } from "../qasm";
import { convertCircuit, convertObservable } from "../convert";
import { GatePosition, ParametricExpectedValueResult, QuantumCircuitEvaluationResult, ShotResult } from "@/backend/qulacs/types";
import { Divider } from "@/pages/_components/Divider";
import { QuantumCircuitEvaluation } from "./LocalSimlQuantumCircuitEvaluation";
import { SamplingExecutionResult } from "./LocalSimlSamplingExecution";
import { ExpectationValueEstimation } from "./LocalSimlExpectationValueEstimation";
import { isZeroOperator, mkZeroOperator } from "../observable";

export interface Props {
  jobType: JobsJobType;
  qubitNumber: number;
  program: string;
  observable?: JobsOperatorItem[];
  selectedParametricGatePosition?: GatePosition;
}

const emptyQuantumCircuitEvaluationResult: QuantumCircuitEvaluationResult = {
  stateVector: [],
  stateVectorAbsoluted: [],
  stateVectorArgument: [],
  probabilityVector: [],
  expectationValue: 0,
}

const emptyParametricExpectedValueResult: ParametricExpectedValueResult = {
  steps: 0,
  expectationValueMap: [],
};

export const LocalSimulationTabContent: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const qulacsApi = useQulacsSimulator();
  const [shots, setShots] = useState(1000);
  const [circuitService] = useState<QuantumCircuitService>(new QuantumCircuitService(0, 0, []));
  const [evaluationResult, setEvaluationResult] = useState(emptyQuantumCircuitEvaluationResult)
  const [parametricExpectationValue, setParametricExpectationValue] = useState(emptyParametricExpectedValueResult)
  const [shotResult, setShotResult] = useState<ShotResult | null>(null);

  // When quantum circuit is changed, recompute the state vector and 
  // expectation value (in the case of estimation mode)
  useEffect(() => {
    const program = props.program.split('\n')[1];
    if (program.startsWith('//')) {
      const programJson = program.replace(/^\/\/\s*/, '');
      try {
        const parsed = parseCircuitJSON(programJson);
        if (parsed) circuitService.circuit = parsed;

        const observable = (
          (qubitNumber: number,
            jobType: JobsJobType,
            operator?: JobsOperatorItem[],
          ) => {
            if (jobType == "estimation"
              && operator !== undefined
              && !isZeroOperator(operator)
            ) {
              return operator;
            }
            return mkZeroOperator(qubitNumber);
          }
        )(props.qubitNumber, props.jobType, props.observable);

        const circuitInfo = convertCircuit(circuitService.circuit, props.qubitNumber);
        const observableInfo = convertObservable(observable, props.qubitNumber);
        const newEvaluationResult = qulacsApi.evalQuantumCircuitAndObservable(
          circuitInfo,
          observableInfo,
        );
        setEvaluationResult(newEvaluationResult);

        if (props.jobType === "estimation" 
          && props.selectedParametricGatePosition !== undefined
        ) {
          const newParametricExpectationValue =
            qulacsApi.requestParametricExpectedValue(
              circuitInfo,
              observableInfo,
              51,
              props.selectedParametricGatePosition
            );
            console.log(newParametricExpectationValue)
          setParametricExpectationValue(newParametricExpectationValue);
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [props.program, props.observable, props.jobType, props.selectedParametricGatePosition]);

  // Run sampling job with qulacs simulator
  const handleRunClick = () => {
    const circuitInfo: CircuitInfo = convertCircuit(circuitService.circuit, props.qubitNumber);
    const res = qulacsApi.startShots(circuitInfo, shots);
    setShotResult(res);
  }

  const handleShotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setShots(value);
  }

  return (
    <>
      <div className={clsx()}>
        <div className={clsx(["mr-3"])}>
          <div className={clsx(['flex', 'items-center', 'gap-2', 'my-3'])}>
            <span className={clsx(['text-chart-title', 'font-bold', 'text-lg'])}>
              {t('composer.control_panel.siml.circuit_evaluation')}
            </span>
          </div>

          <div className={clsx(["flex", "items-start", "gap-5"])}>
            <QuantumCircuitEvaluation
              jobType={props.jobType}
              evaluationResult={evaluationResult}
              qubitNumber={props.qubitNumber}
            />

          </div>
        </div>
      </div>

      <Divider className={clsx('my-6')} />


      {props.jobType == "sampling"
        ? (
          <>
            <div className={clsx(['flex', 'items-center', 'gap-2', 'my-3'])}>
              <span className={clsx(['text-chart-title', 'font-bold', 'text-lg'])}>
                {t('composer.control_panel.siml.sampling')}
              </span>
            </div>
            <div>
              <div className={clsx(['flex', 'items-center', 'gap-3', 'my-3'])}>
                <span
                  className={clsx('text-nowrap', 'p-3')}>
                  {t('composer.control_panel.siml.sampling_shots')}
                </span>
                <div className={clsx(['w-32'])}>
                  <Input
                    placeholder={t('job.form.shots_placeholder')}
                    type="number"
                    min={1}
                    defaultValue={1000}
                    onKeyDown={(event) => {
                      if (/^[a-zA-Z+\-]$/.test(event.key)) {
                        event.preventDefault();
                        return;
                      }
                    }}
                    value={shots}
                    onChange={handleShotsChange}
                  />
                </div>
                <Button
                  className={clsx(['!my-0'])}
                  color="secondary"
                  style={{ marginBottom: '1.25rem' }}
                  onClick={() => handleRunClick()}
                >
                  Run
                </Button>
              </div>

              <SamplingExecutionResult
                qubitNumber={props.qubitNumber}
                shotResult={shotResult}
              />
            </div>
          </>
        )
        : null
      }

      {props.jobType == "estimation"
        ? (
          <>
            <div className={clsx(['flex', 'items-center', 'gap-2', 'my-3'])}>
              <span className={clsx(['text-chart-title', 'font-bold', 'text-lg'])}>
                {t('composer.control_panel.siml.expectation_value_estimation')}
              </span>
            </div>

            <ExpectationValueEstimation
              expectationValue={evaluationResult.expectationValue}
              observable={props.observable ?? []}
              qubitNumber={props.qubitNumber}
              selectedParametricGatePosition={props.selectedParametricGatePosition}
              parametricExpectationValue={parametricExpectationValue}
            />
          </>
        )
        : null
      }
    </>
  );
}