import { useQulacsSimulator } from "@/backend/qulacs/hook"
import { Button } from "@/pages/_components/Button";
import { Input } from "@/pages/_components/Input";
import clsx from "clsx";
import React
, {
  useEffect,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import { QuantumCircuitService } from "../circuit";
import { JobsJobType, JobsOperatorItem } from "@/api/generated";
import { CircuitInfo } from "qulacs-wasm-simulator-client";
import { parseCircuitJSON } from "../qasm";
import { convertCircuit, convertObservable } from "../convert";
import { QuantumCircuitEvaluationResult, ShotResult } from "@/backend/qulacs/types";
import { Divider } from "@/pages/_components/Divider";
import { QuantumCircuitEvaluation } from "./LocalSimlQuantumCircuitEvaluation";
import { SamplingExecutionResult } from "./LocalSimlSamplingExecution";

const mkZeroOperator = (qubitNumber: number): JobsOperatorItem[] => {
  return [{
    coeff: 0,
    pauli: [...new Array(qubitNumber)].map((_, i) => `I${i}`).join(""),
  }]
}

export interface Props {
  jobType: JobsJobType;
  qubitNumber: number;
  program: string;
  observable?: JobsOperatorItem[];
}

const emptyQuantumCircuitEvaluationResult: QuantumCircuitEvaluationResult = {
  stateVector: [],
  stateVectorAbsoluted: [],
  stateVectorArgument: [],
  probabilityVector: [],
  expectationValue: 0,
}

export const LocalSimulationTabContent: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const qulacsApi = useQulacsSimulator();
  const [shots, setShots] = useState(1000);
  const [circuitService] = useState<QuantumCircuitService>(new QuantumCircuitService(0, 0, []));
  const [evaluationResult, setEvaluationResult] = useState(emptyQuantumCircuitEvaluationResult)
  const [shotResult, setShotResult] = useState<ShotResult | null>(null);

  useEffect(() => {
    const program = props.program.split('\n')[1];
    if (program.startsWith('//')) {
      const programJson = program.replace(/^\/\/\s*/, '');
      try {
        const parsed = parseCircuitJSON(programJson);
        if (parsed) circuitService.circuit = parsed;

        const observable = (props.jobType == "estimation" && props.observable !== undefined)
          ? props.observable
          : mkZeroOperator(props.qubitNumber);
        const newEvaluationResult = qulacsApi.evalQuantumCircuitAndObservable(
          convertCircuit(circuitService.circuit, props.qubitNumber),
          convertObservable(observable, props.qubitNumber)
        );
        setEvaluationResult(newEvaluationResult);
      } catch (_) { }
    }
  }, [props.program, props.observable, props.jobType]);

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
      <div>
        {props.jobType == "estimation"
          ? (
            <div>Simulated expectation value: {evaluationResult.expectationValue}</div>
          ) : <></>
        }
      </div >

      <div>
        <div className={clsx(['flex', 'items-center', 'gap-2', 'my-3'])}>
          <span className={clsx(['text-chart-title', 'font-bold', 'text-lg'])}>
            {t('composer.control_panel.siml.circuit_evaluation')}
          </span>
        </div>

        <QuantumCircuitEvaluation
          jobType={props.jobType}
          evaluationResult={evaluationResult}
          qubitNumber={props.qubitNumber}
        />
      </div>

      <Divider className={clsx('my-6')} />

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
  );
}