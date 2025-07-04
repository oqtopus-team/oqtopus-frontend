import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import QuantumCircuitComposer from './_components/QuantumCircuitComposer';
import ControlPanel from './_components/ControlPanel';
import { JobsOperatorItem, JobsSubmitJobRequest } from '@/api/generated';
import { useEffect, useLayoutEffect, useState } from 'react';
import { allGates, GateCNOT, GateH, GateI, QuantumGate } from './gates';
import { QuantumCircuit } from './circuit';
import { JobTypeType } from '@/domain/types/Job';
import ToolPalette from './_components/ToolPalette';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { Device } from '@/domain/types/Device';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ExtendedGate } from './composer';
import ObservableComposer from './_components/ObservableComposer';
import { Observable } from './observable';

export const bellSampling: QuantumCircuit = {
  qubitNumber: 2,
  steps: [
    GateH(0),
    GateCNOT(0, 1),
  ]
};

const renderQasm = (qubitNumber: number, steps: ExtendedGate[]): string => {
  const declareQubits = `qubit[${qubitNumber}] q;`;
  const declareBits = `bit[${qubitNumber}] c;`;
  const qasmPart = steps.reduce((acc, gate) => {
    const appender = (() => {
      switch (gate._tag) {
        case "$controlBit":
        case "$controlWire":
        case "$dummy":
          return "";
        case "h":
        case "s":
        case "t":
        case "x":
        case "y":
        case "z":
        case "i":
          return `${gate._tag} q[${gate.target}];`;
        case "cnot":
          return `cx q[${gate.control}], q[${gate.target}];`
        case "rx":
        case "ry":
        case "rz":
          return `${gate._tag}(${gate.arg}) q[${gate.target}];`
        default:
          throw new Error("Unsupported gate: " + gate._tag);
      }
    })();
    return appender == "" ? acc : acc + "\n" + appender
  }, "");

  const measurementPart = "c = measure q;"
  return `OPENQASM 3;
include "stdgates.inc";
${declareQubits}
${declareBits}
${qasmPart}

${measurementPart}
`;
};

const renderOperator = (obs: Observable): JobsOperatorItem[] => {
  return [...new Array(obs.operators.length)]
    .map((_, i) => {
      return {
        coeff: obs.coeffs[i],
        pauli: obs.operators[i].reduce((prev, gate, j) => {
          switch (gate._tag as unknown) {
            case "x":
            case "y":
            case "z":
              return `${prev}${gate._tag.toUpperCase()}${j}`;

            case "$dummy":
            case "i":
              return `${prev}I${j}`;
            default:
              throw new Error("Unexpected gate in the operator!");
          }
        }, "")
      }
    })

}
export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('composer.title'));
  const [jobType, setJobType] = useState<JobTypeType>("sampling");

  const [circuit, setCircuit] = useState(bellSampling);
  const [busy, setBusy] = useState(false);

  const { getDevices } = useDeviceAPI();
  const jobApi = useJobAPI();

  const [devices, setDevices] = useState<Device[]>([]);

  const [observable, setObservable] = useState<Observable>({
    qubitNumber: bellSampling.qubitNumber,
    coeffs: [],
    operators: []
  });



  const fetchDevices = async () => {
    setBusy(true);
    const res = await getDevices();
    setDevices(res);
    setBusy(false);
  };

  useEffect(() => {
    const nqubits = observable.qubitNumber;
    if (circuit.qubitNumber > nqubits) {
      setObservable({
        qubitNumber: circuit.qubitNumber,
        coeffs: observable.coeffs,
        operators: observable.operators.map(pauli => [
          ...pauli,
          ...[...new Array(circuit.qubitNumber - nqubits)].map((_, i) => GateI(i))
        ])
      });
    }
    else if (circuit.qubitNumber < nqubits) {
      setObservable({
        qubitNumber: circuit.qubitNumber,
        coeffs: observable.coeffs,
        operators: observable.operators.map(pauli => pauli.slice(0, circuit.qubitNumber))
      });
    }
  }, [circuit]);

  useLayoutEffect(() => {
    fetchDevices();
  }, []);

  const handleSubmitJob = async (req: JobsSubmitJobRequest): Promise<void> => {
    setBusy(true);
    try {
      const jobId = await jobApi.submitJob(req);
      toast.success(t('job.form.toast.success'));
    }
    catch (e) {
      toast.error(t('job.form.toast.error'));
    }
    finally {
      setBusy(false);
    }
  }

  const handleCircuitUpdate = (newCircuit: QuantumCircuit) => {
    setCircuit(newCircuit);
  }

  const handleObservableUpdate = (newObservable: Observable) => {
    setObservable(newObservable);
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000} // display for 2 seconds
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        hideProgressBar={true}
        pauseOnHover
      />
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('composer.title')}</h2>
      <Spacer className="h-9" />

      <ToolPalette
        jobType={jobType}
        handleChange={(jt) => {
          setJobType(jt);
        }}
      />

      <hr className={clsx([
        ["w-full", "my-4"],
        ["text-neutral-content"]
      ])} />

      <QuantumCircuitComposer
        supportedGates={allGates}
        circuit={circuit}
        onCircuitUpdate={handleCircuitUpdate}
      />

      {jobType === "estimation"
        ? (
          <>
            <hr className="text-neutral-content"></hr>
            <h2 className='text-primary text-xl font-bold my-4'>{t("composer.observable.title")}</h2>
            <div className='my-6'>
              <ObservableComposer
                observable={observable}
                onObservableUpdate={handleObservableUpdate}
              />
            </div>
          </>
        )
        : null}

      <ControlPanel
        onSubmit={handleSubmitJob}
        devices={devices}
        jobType={jobType}
        busy={busy}
        mkProgram={() => ({
          program: renderQasm(
            circuit.qubitNumber.valueOf(),
            circuit.steps
          ),
          qubitNumber: circuit.qubitNumber.valueOf()
        })}
        mkOperator={() => renderOperator(observable)}
      />
    </>
  );
}
