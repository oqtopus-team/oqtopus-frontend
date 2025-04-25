import { useTranslation } from 'react-i18next';
import { Card } from '@/pages/_components/Card';
import clsx from 'clsx';
import { Divider } from '@/pages/_components/Divider';
import i18next from 'i18next';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { Select } from '@/pages/_components/Select';
import { TextArea } from '@/pages/_components/TextArea';
import { Spacer } from '@/pages/_components/Spacer';
import { NavLink, useNavigate } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import { Device } from '@/domain/types/Device';
import {
  JOB_FORM_MITIGATION_INFO_DEFAULTS,
  JOB_FORM_TRANSPILER_INFO_DEFAULTS,
  JOB_TYPE_DEFAULT,
  JOB_TYPES,
  JobFileData,
  JobTypeType,
  OperatorItem,
  SHOTS_DEFAULT,
  TRANSPILER_TYPE_DEFAULT,
  TRANSPILER_TYPES,
  TranspilerTypeType,
  PROGRAM_TYPES,
  ProgramType,
  PROGRAM_TYPE_DEFAULT,
  initializeJobFormProgramDefaults,
} from '@/domain/types/Job';
import { JobsSubmitJobInfo } from '@/api/generated';
import { Toggle } from '@/pages/_components/Toggle';
import JobFileUpload from './_components/JobFileUpload';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';

export default function Page() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getDevices } = useDeviceAPI();
  const { submitJob } = useJobAPI();

  const [devices, setDevices] = useState<Device[]>([]);

  useLayoutEffect(() => {
    getDevices().then((devices) => setDevices(devices));
  }, []);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [jobType, setJobType] = useState<JobTypeType>(JOB_TYPE_DEFAULT);

  const [jobInfo, setJobInfo] = useState<JobsSubmitJobInfo>({ program: [''], operator: [] });
  const [program, setProgram] = useState<string[]>(['']);
  const [programType, setProgramType] = useState<ProgramType>(PROGRAM_TYPE_DEFAULT);
  const [pendingProgramType, setPendingProgramType] = useState<ProgramType | null>(null);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [operator, setOperator] = useState([{ pauli: '', coeff: 1.0 }]);
  const [jobDefaults, setJobDefaults] = useState<{ [key in ProgramType]: string } | undefined>(
    undefined
  );

  useEffect(() => {
    // Load the default program from /public/sample_program
    async function fetchDefaults() {
      try {
        const defaults = await initializeJobFormProgramDefaults();
        setJobDefaults(defaults);
      } catch (error) {
        console.error('failed to initialize:', error);
      }
    }
    fetchDefaults();
  }, []);

  useEffect(() => {
    setJobInfo((jobInfo) => ({ ...jobInfo, program }));
    setError((error) => ({ ...error, jobInfo: { ...error.jobInfo, program: {} } }));
  }, [program]);
  useEffect(() => {
    setJobInfo((jobInfo) => ({
      ...jobInfo,
      operator: operator.map((op) => ({
        ...op,
        coeff: Number(op.coeff),
      })),
    }));
    setError((error) => ({
      ...error,
      jobInfo: { ...error.jobInfo, operator: { pauli: {}, coeff: {} } },
    }));
  }, [operator]);

  const [shots, setShots] = useState(SHOTS_DEFAULT);

  const [transpilerType, setTranspilerType] = useState<TranspilerTypeType>(TRANSPILER_TYPE_DEFAULT);
  const [transpilerInfo, setTranspilerInfo] = useState(JOB_FORM_TRANSPILER_INFO_DEFAULTS.Default);
  useEffect(() => {
    // set default transpiler info if transpiler_info not changed or empty
    if (
      transpilerType === 'None' &&
      (transpilerInfo === JOB_FORM_TRANSPILER_INFO_DEFAULTS.Default || transpilerInfo.trim() === '')
    ) {
      setTranspilerInfo(JOB_FORM_TRANSPILER_INFO_DEFAULTS.None);
    }
    if (
      transpilerType === 'Default' &&
      (transpilerInfo === JOB_FORM_TRANSPILER_INFO_DEFAULTS.None || transpilerInfo.trim() === '')
    ) {
      setTranspilerInfo(JOB_FORM_TRANSPILER_INFO_DEFAULTS.Default);
    }
  }, [transpilerType]);

  const [simulatorInfo, setSimulatorInfo] = useState('{}');

  const [mitigationEnabled, setMitigationEnabled] = useState(true);
  const [mitigationInfo, setMitigationInfo] = useState(JOB_FORM_MITIGATION_INFO_DEFAULTS.PseudoInv);
  useEffect(() => {
    // set default transpiler info if transpiler_info not changed or empty
    if (
      mitigationEnabled &&
      (mitigationInfo === JOB_FORM_MITIGATION_INFO_DEFAULTS.PseudoInv ||
        mitigationInfo.trim() === '')
    ) {
      setMitigationInfo(JOB_FORM_MITIGATION_INFO_DEFAULTS.PseudoInv);
    }
    if (!mitigationEnabled) {
      setMitigationInfo(JOB_FORM_MITIGATION_INFO_DEFAULTS.None);
    }
  }, [mitigationEnabled]);

  const [jobFileData, setJobFileData] = useState<JobFileData | undefined>(undefined);
  useEffect(() => {
    if (!jobFileData) return;

    setName(jobFileData.name);
    setDescription(jobFileData.description ?? '');
    setShots(jobFileData.shots);
    setJobType(jobFileData.jobType);
    setJobInfo(jobFileData.jobInfo);
    setProgram(jobFileData.jobInfo.program);
    setOperator(jobFileData.jobInfo.operator ?? [{ pauli: '', coeff: 1.0 }]);
    setTranspilerInfo(JSON.stringify(jobFileData.transpilerInfo ?? ''));
    setSimulatorInfo(JSON.stringify(jobFileData.simulatorInfo ?? ''));

    if (devices.some((d) => d.id === jobFileData.deviceId)) {
      setDeviceId(jobFileData.deviceId);
    }

    if (jobFileData.mitigationInfo) {
      setMitigationInfo(JSON.stringify(jobFileData.mitigationInfo));
      setMitigationEnabled(true);
    } else {
      setMitigationEnabled(false);
    }

    setJobFileData(undefined);
  }, [jobFileData]);

  const [error, setError] = useState<{
    name?: string;
    description?: string;
    deviceId?: string;
    jobType?: string;
    jobInfo: {
      program: { [index: number]: string };
      operator: {
        pauli: { [index: number]: string };
        coeff: { [index: number]: string };
      };
    };
    transpilerInfo?: string;
    simulatorInfo?: string;
    mitigationInfo?: string;
    shots?: string;
  }>({
    jobInfo: { program: {}, operator: { pauli: {}, coeff: {} } },
  });

  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (shouldNavigate: boolean = false) => {
    if (processing) {
      console.warn('Already processing');
      return;
    }
    if (shots <= 0) {
      setError((error) => ({ ...error, shots: t('job.form.error_message.shots') }));
      return;
    }

    if (deviceId === null) {
      setError((error) => ({ ...error, deviceId: t('job.form.error_message.device') }));
      return;
    }

    if (!JOB_TYPES.includes(jobType)) {
      setError((error) => ({ ...error, jobType: t('job.form.error_message.type') }));
      return;
    }

    const invalidProgram = jobInfo.program
      .map((programItem, i) => {
        if (programItem === '') {
          setError((error) => ({
            ...error,
            jobInfo: {
              ...error.jobInfo,
              program: { ...error.jobInfo.program, [i]: t('job.form.error_message.program') },
            },
          }));
          return false;
        }
        return true;
      })
      .some((valid) => !valid);
    if (invalidProgram) {
      return;
    }

    let sanitizedJobInfo: JobsSubmitJobInfo;
    if (jobType === 'estimation') {
      const invalidOperator = (jobInfo.operator ?? [])
        .map((operatorItem, i) => {
          if (operatorItem.pauli.trim() === '') {
            setError((error) => ({
              ...error,
              jobInfo: {
                ...error.jobInfo,
                operator: {
                  ...error.jobInfo.operator,
                  pauli: {
                    ...error.jobInfo.operator.pauli,
                    [i]: t('job.form.error_message.operator.pauli'),
                  },
                },
              },
            }));
            return false;
          }
          const coeffError =
            `{${operatorItem.coeff}`.trim() == '' || isNaN(Number(operatorItem.coeff))
              ? t('job.form.error_message.operator.coeff')
              : undefined;

          if (coeffError) {
            setError((errors) => ({
              jobInfo: {
                ...errors.jobInfo,
                operator: {
                  ...errors.jobInfo.operator,
                  coeff: {
                    ...errors.jobInfo.operator.coeff,
                    [i]: coeffError,
                  },
                },
              },
            }));
            return false;
          }
          return true;
        })
        .some((valid) => !valid);
      if (invalidOperator) {
        return;
      }
      sanitizedJobInfo = { ...jobInfo };
    } else {
      sanitizedJobInfo = { ...jobInfo, operator: undefined };
    }

    try {
      JSON.parse(transpilerInfo);
    } catch (e) {
      setError((error) => ({ ...error, transpilerInfo: t('job.form.error_message.invalid_json') }));
      return;
    }
    try {
      JSON.parse(simulatorInfo);
    } catch (e) {
      setError((error) => ({ ...error, simulatorInfo: t('job.form.error_message.invalid_json') }));
      return;
    }
    try {
      JSON.parse(mitigationInfo);
    } catch (e) {
      setError((error) => ({ ...error, mitigationInfo: t('job.form.error_message.invalid_json') }));
      return;
    }

    setProcessing(true);

    try {
      const res = await submitJob({
        name: name.trim(),
        description,
        device_id: deviceId,
        job_type: jobType,
        job_info: sanitizedJobInfo,
        transpiler_info: JSON.parse(transpilerInfo),
        simulator_info: JSON.parse(simulatorInfo),
        mitigation_info: JSON.parse(mitigationInfo),
        shots,
      });
      toast.success(
        t('job.form.toast.success'),
        shouldNavigate
          ? {
              onClose: () => navigate('/jobs/' + res),
            }
          : {}
      );
    } catch (e) {
      console.error(e);
      toast.error(t('job.form.toast.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleProgramTypeChange = (newProgramType: ProgramType) => {
    if (program[0] !== '') {
      setPendingProgramType(newProgramType);
      setDeleteModalShow(true);
    } else {
      setProgramType(newProgramType);
      if (jobDefaults) {
        setProgram([jobDefaults[newProgramType]]);
      }
    }
  };

  const confirmProgramTypeChange = () => {
    if (pendingProgramType) {
      setProgramType(pendingProgramType);
      setPendingProgramType(null);
      if (jobDefaults) {
        setProgram([jobDefaults[pendingProgramType]]);
      }
    }
    setDeleteModalShow(false);
  };

  const cancelProgramTypeChange = () => {
    setPendingProgramType(null);
    setDeleteModalShow(false);
  };

  return (
    <div>
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
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('job.form.title')}</h2>
      <Spacer className="h-3" />
      <p className={clsx('text-sm')}>{t('job.form.description')}</p>
      <Spacer className="h-8" />
      <Card className={clsx('max-w-[2160px]')}>
        <div className={clsx('flex', 'flex-wrap', 'justify-start', 'gap-9')}>
          <div className={clsx('flex-1', 'min-w-[240px]', 'max-w-[1080px]')}>
            {/* Common */}
            <div className={clsx('grid', 'gap-5')}>
              <Input
                autoFocus
                placeholder={t('job.form.name_placeholder')}
                label="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError((error) => ({ ...error, name: undefined }));
                }}
                errorMessage={error.name}
              />
              <Input
                placeholder={t('job.form.description_placeholder')}
                label="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError((error) => ({ ...error, description: undefined }));
                }}
                errorMessage={error.description}
              />
              <Input
                placeholder={t('job.form.shots_placeholder')}
                label="shots"
                type="number"
                defaultValue={SHOTS_DEFAULT}
                value={shots}
                onChange={(e) => {
                  if (isNaN(Number(e.target.value))) {
                    return;
                  }
                  setShots(Number(e.target.value));
                  setError((error) => ({ ...error, shots: undefined }));
                }}
                errorMessage={error.shots}
              />
              <Select
                label="device"
                value={deviceId === null ? '' : deviceId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setDeviceId(e.target.value);
                  setError((error) => ({ ...error, deviceId: undefined }));
                }}
                errorMessage={error.deviceId}
              >
                <option value=""></option>
                {devices.map((device) => (
                  <option disabled={device.status === 'unavailable'} key={device.id}>
                    {device.id}
                  </option>
                ))}
              </Select>
              <Select
                label="type"
                value={jobType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  if (!JOB_TYPES.includes(e.target.value as JobTypeType)) {
                    return;
                  }
                  setJobType(e.target.value as JobTypeType);
                  setError((error) => ({ ...error, jobType: undefined }));
                }}
                errorMessage={error.jobType}
              >
                {JOB_TYPES.map((jobType) => (
                  <option key={jobType}>{jobType}</option>
                ))}
              </Select>
            </div>
            <>
              <Spacer className="h-4" />
              <Divider />
              <Spacer className="h-4" />
              <div className={clsx('flex', 'justify-between')}>
                <p className={clsx('font-bold', 'text-primary')}>program</p>
                <Select
                  labelLeft="sample program"
                  value={programType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    handleProgramTypeChange(e.target.value as ProgramType);
                  }}
                  errorMessage={error.jobType}
                  size="xs"
                >
                  {PROGRAM_TYPES.map((oneProgramType) => (
                    <option key={oneProgramType} value={oneProgramType}>
                      {oneProgramType}
                    </option>
                  ))}
                </Select>
              </div>
              <Spacer className="h-2" />
            </>
            {/* programs */}
            <TextArea
              className={clsx('h-[16rem]')}
              placeholder={t('job.form.program_placeholder')}
              value={program[0]}
              onChange={(e) => {
                setProgram([e.target.value]);
                setError((error) => ({ ...error, program: undefined }));
              }}
              errorMessage={error.jobInfo.program[0]}
            />
            <ConfirmModal
              show={deleteModalShow}
              onHide={cancelProgramTypeChange}
              title={t('job.list.modal.title')}
              message={t('job.form.modal.overwrite_program')}
              onConfirm={confirmProgramTypeChange}
            />
            <Spacer className="h-5" />
            {/* operator */}
            {jobType === 'estimation' && (
              <OperatorForm
                current={operator}
                set={(v) => setOperator(v)}
                error={error.jobInfo.operator}
              />
            )}
            <Spacer className="h-7" />
          </div>
          <div
            className={clsx(['flex-1', 'min-w-[240px]', 'max-w-[1080px]'], ['flex', 'flex-col'])}
          >
            {/* transpiler */}
            <>
              <div className={clsx('flex', 'justify-between')}>
                <p className={clsx('font-bold', 'text-primary')}>transpiler</p>
                <Select
                  labelLeft="type"
                  value={transpilerType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    if (!TRANSPILER_TYPES.includes(e.target.value as TranspilerTypeType)) {
                      return;
                    }
                    setTranspilerType(e.target.value as TranspilerTypeType);
                    setError((error) => ({ ...error, jobType: undefined }));
                  }}
                  errorMessage={error.jobType}
                  size="xs"
                >
                  {TRANSPILER_TYPES.map((jobType) => (
                    <option key={jobType}>{jobType}</option>
                  ))}
                </Select>
              </div>
              <Spacer className="h-2" />
            </>
            <Spacer className="h-2" />
            <TextArea
              className={clsx('h-[16rem]')}
              placeholder={t('job.form.transpiler_placeholder')}
              value={transpilerInfo}
              onChange={(e) => {
                setTranspilerInfo(e.target.value);
                setError((error) => ({ ...error, transpilerInfo: undefined }));
              }}
              errorMessage={error.transpilerInfo}
            />
            {/* sumulator */}
            <>
              <Spacer className="h-4" />
              <Divider />
              <Spacer className="h-4" />
              <p className={clsx('font-bold', 'text-primary')}>simulator</p>
              <Spacer className="h-2" />
            </>
            <TextArea
              className={clsx('h-[16rem]')}
              placeholder={t('job.form.simulator_placeholder')}
              value={simulatorInfo}
              onChange={(e) => {
                setSimulatorInfo(e.target.value);
                setError((error) => ({ ...error, simulatorInfo: undefined }));
              }}
              errorMessage={error.simulatorInfo}
            />
            {/* mitigation */}
            <>
              <Spacer className="h-4" />
              <Divider />
              <Spacer className="h-4" />
              <div className={clsx('flex', 'justify-between')}>
                <p className={clsx('font-bold', 'text-primary')}>mitigation</p>
                <Toggle
                  checked={mitigationEnabled}
                  onChange={(enabled) => setMitigationEnabled(enabled)}
                />
              </div>
              <Spacer className="h-2" />
            </>
            <TextArea
              className={clsx('h-[16rem]')}
              placeholder={t('job.form.mitigation_placeholder')}
              value={mitigationInfo}
              onChange={(e) => {
                setMitigationInfo(e.target.value);
                setError((error) => ({ ...error, mitigationInfo: undefined }));
              }}
              errorMessage={error.mitigationInfo}
            />
          </div>
        </div>
        <Spacer className="h-4" />
        <div className={clsx('flex', 'flex-wrap', 'gap-2', 'justify-between', 'items-end')}>
          <div className={clsx('flex', 'flex-wrap', 'gap-2', 'justify-between')}>
            <JobFileUpload setJobFileData={setJobFileData} devices={devices} />
            <Button color="secondary" onClick={() => handleSubmit(false)} loading={processing}>
              {t('job.form.button')}
            </Button>
            <Button color="secondary" onClick={() => handleSubmit(true)} loading={processing}>
              {t('job.form.submit_and_view_job_button')}
            </Button>
          </div>
          <CheckReferenceCTA />
        </div>
      </Card>
    </div>
  );
}

const CheckReferenceCTA = () => {
  return (
    <p className={clsx('text-xs')}>
      {i18next.language === 'ja' ? (
        <>
          各入力値については
          <NavLink to="/howto#/job/submit_job" className="text-link">
            こちら
          </NavLink>
          の説明を参照してください
        </>
      ) : (
        <>
          For each input value, please refer to the explanation{' '}
          <NavLink to="/howto#/job/submit_job" className="text-link">
            here.
          </NavLink>
        </>
      )}
    </p>
  );
};

const OperatorForm = ({
  current,
  set,
  error,
}: {
  current: OperatorItem[];
  set: (_: OperatorItem[]) => void;
  error: {
    pauli: { [index: number]: string };
    coeff: { [index: number]: string };
  };
}) => {
  const { t } = useTranslation();
  const [formValue, setFormValue] = useState([{ pauli: '', coeff: '1.0' }]);
  const handleCoeffInput = (index: number) => (e: FormEvent<HTMLInputElement>) => {
    const coeffRaw = (e.target as HTMLInputElement).value;
    const coeffNumber = coeffRaw.trim() === '' ? Number.NaN : Number(coeffRaw);

    set(current.map((o, i) => (i === index ? { ...o, coeff: coeffNumber } : o)));
    setFormValue({ ...formValue, [index]: { ...formValue[index], coeff: coeffRaw } });
  };

  const handlePlusButtonClick = () => {
    set([...current, { pauli: '', coeff: 1.0 }]);
    setFormValue([...formValue, { pauli: '', coeff: '1.0' }]);
  };

  return (
    <div className={clsx('grid', 'gap-2')}>
      <Divider />
      <Spacer className="h-2" />
      <p className={clsx('font-bold', 'text-primary')}>operator</p>
      <div className={clsx('grid', 'gap-4')}>
        {current.map((item, index) => (
          <div key={index} className={clsx('flex', 'gap-1', 'items-end')}>
            <div className={clsx('grid', 'gap-1', 'w-full')}>
              <div className={clsx('flex', 'gap-3')}>
                <Input
                  label={t('job.form.operator.coeff')}
                  placeholder={t('job.form.operator_coeff_placeholder')}
                  value={formValue[index].coeff}
                  type="string"
                  onInput={handleCoeffInput(index)}
                  errorMessage={error.coeff[index]}
                />
                <Input
                  label={t('job.form.operator.pauli')}
                  placeholder={t('job.form.operator_pauli_placeholder')}
                  value={item.pauli}
                  onChange={(e) => {
                    set(
                      current.map((o, i) =>
                        i === index ? { ...o, pauli: (e.target as HTMLInputElement)?.value } : o
                      )
                    );
                  }}
                  errorMessage={error.pauli[index]}
                />
              </div>
            </div>
            <Button
              color="error"
              size="small"
              className={clsx('w-8', 'h-8', 'flex', 'justify-center', 'items-center')}
              onClick={() => {
                set(current.filter((_, i) => i !== index));
              }}
            >
              x
            </Button>
          </div>
        ))}
      </div>
      <div className={clsx('w-min')}>
        <Button color="secondary" size="small" onClick={handlePlusButtonClick}>
          +
        </Button>
      </div>
    </div>
  );
};
