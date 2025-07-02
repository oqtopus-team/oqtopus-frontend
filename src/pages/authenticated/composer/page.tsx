import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import QuantumCircuitComposer from './_components/QuantumCircuitComposer';
import ControlPanel from './_components/ControlPanel';
import { JobsSubmitJobRequest } from '@/api/generated';
import { useEffect, useLayoutEffect, useState } from 'react';
import { GateCNOT, GateH, QuantumGate } from './gates';
import { QuantumCircuit } from './circuit';
import { JobTypeType } from '@/domain/types/Job';
import ToolPalette from './_components/ToolPalette';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { Device } from '@/domain/types/Device';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ExtendedGate } from './composer';

const bellSampling: QuantumCircuit = {
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

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('composer.title'));
  const [jobType, setJobType] = useState<JobTypeType>("sampling");

  const [circuit, setCircuit] = useState(bellSampling);
  const [busy, setBusy] = useState(false);

  const { getDevices } = useDeviceAPI();
  const jobApi = useJobAPI();

  const [devices, setDevices] = useState<Device[]>([]);

  const fetchDevices = async () => {
    setBusy(true);
    const res = await getDevices();
    setDevices(res);
    setBusy(false);
  };

  useLayoutEffect(() => {
    fetchDevices();
  }, []);

  const handleSubmitJob = async (req: JobsSubmitJobRequest): Promise<void> => {
    setBusy(true);
    try {
      const jobId = await jobApi.submitJob(req);
      toast.success(t('job.form.toast.success'));
    }
    catch(e) {
      toast.error(t('job.form.toast.error'));
    }
    finally {
      setBusy(false);
    }
  }

  const handleCircuitUpdate = (newCircuit: QuantumCircuit) => {
    setCircuit(newCircuit);
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
      />

      <hr className={clsx([
        ["w-full", "my-4"],
        ["text-neutral-content"]
      ])} />

      <QuantumCircuitComposer 
        circuit={circuit}
        onCircuitUpdate={handleCircuitUpdate}
      />

      <ControlPanel
        onSubmit={handleSubmitJob}
        devices={devices}
        jobType={"sampling"}
        busy={busy}
        mkProgram={() => renderQasm(
          circuit.qubitNumber.valueOf(),
          circuit.steps
        )}
      />
    </>
  );
}
