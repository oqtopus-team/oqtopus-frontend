import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import QuantumCircuitComposer from './_components/QuantumCircuitComposer';
import ControlPanel from './_components/ControlPanel';
import { JobsOperatorItem, JobsSubmitJobRequest } from '@/api/generated';
import { useEffect, useLayoutEffect, useState } from 'react';
import { circuitContext, QuantumCircuitService } from './circuit';
import { JobTypeType } from '@/domain/types/Job';
import ToolPalette from './_components/ToolPalette';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { Device } from '@/domain/types/Device';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateQASMCode } from './qasm';
import { QuantumGate, supportedGates } from './gates';
import ObservableComposer from './_components/ObservableComposer';
import { Observable } from './observable';

const renderOperator = (obs: Observable): JobsOperatorItem[] => {
  return [...new Array(obs.operators.length)].map((_, i) => {
    return {
      coeff: obs.coeffs[i],
      pauli: obs.operators[i].reduce((prev, gate, j) => {
        switch (gate._tag) {
          case 'x':
          case 'y':
          case 'z':
            return `${prev}${gate._tag.toUpperCase()}${j}`;

          case 'emptyCell':
          case 'i':
            return `${prev}I${j}`;
          default:
            throw new Error('Unexpected gate in the operator!');
        }
      }, ''),
    };
  });
};

const composerSupportedGates: QuantumGate['_tag'][] = supportedGates.filter((tag) => tag !== 'i');
const observableSupportedGates: QuantumGate['_tag'][] = ['i', 'x', 'y', 'z'];

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('composer.title'));
  const [jobType, setJobType] = useState<JobTypeType>('sampling');

  const [circuitService] = useState(new QuantumCircuitService(2, 20, composerSupportedGates, true));
  const [circuit, setCircuit] = useState(circuitService.circuit);
  const [observableCircuitService] = useState(
    new QuantumCircuitService(2, 10, observableSupportedGates, false, true)
  );

  const [busy, setBusy] = useState(false);

  const { getDevices } = useDeviceAPI();
  const jobApi = useJobAPI();

  const [devices, setDevices] = useState<Device[]>([]);

  const [observable, setObservable] = useState<Observable>({
    operators: [],
    coeffs: [],
  });

  const [jobId, setJobId] = useState<null | string>(null);

  const fetchDevices = async () => {
    setBusy(true);
    const res = await getDevices();
    setDevices(res);
    setBusy(false);
  };

  useEffect(() => {
    return circuitService.onCircuitChange((c) => {
      if (c.length !== observableCircuitService.circuit.length) {
        const hasMoreQubitsThanObservable = c.length > observableCircuitService.circuit.length;

        while (c.length !== observableCircuitService.circuit.length) {
          hasMoreQubitsThanObservable
            ? observableCircuitService.addQubit()
            : observableCircuitService.removeQubit();
        }
      }

      setCircuit(c);
    });
  }, []);

  useLayoutEffect(() => {
    fetchDevices();
  }, []);

  const handleSubmitJob = async (req: JobsSubmitJobRequest): Promise<void> => {
    setBusy(true);
    try {
      const jobId = await jobApi.submitJob(req);
      toast.success(t('job.form.toast.success'));
      setJobId(jobId);
    } catch (e) {
      toast.error(t('job.form.toast.error'));
    } finally {
      setBusy(false);
    }
  };

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

      <hr className={clsx([['w-full', 'my-4'], ['text-neutral-content']])} />

      <circuitContext.Provider value={circuitService}>
        <QuantumCircuitComposer />
      </circuitContext.Provider>

      {jobType === 'estimation' ? (
        <>
          <hr className="text-neutral-content"></hr>
          <h2 className="text-primary text-xl font-bold my-4">{t('composer.observable.title')}</h2>
          <div className="my-6">
            <circuitContext.Provider value={observableCircuitService}>
              <ObservableComposer observable={observable} onObservableUpdate={setObservable} />
            </circuitContext.Provider>
          </div>
        </>
      ) : null}

      <ControlPanel
        onSubmit={handleSubmitJob}
        devices={devices}
        jobId={jobId}
        jobType={jobType}
        busy={busy}
        mkProgram={() => ({
          program: generateQASMCode(circuit, Object.values(circuitService.customGates)),
          qubitNumber: circuit.length,
        })}
        mkOperator={() => renderOperator(observable)}
      />
    </>
  );
}
