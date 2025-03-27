import { useTranslation } from 'react-i18next';
import { Card } from '@/pages/_components/Card';
import clsx from 'clsx';
import { Divider } from '@/pages/_components/Divider';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { Select } from '@/pages/_components/Select';
import { TextArea } from '@/pages/_components/TextArea';
import { Spacer } from '@/pages/_components/Spacer';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { useEffect, useLayoutEffect, useState } from 'react';
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
} from '@/domain/types/Job';
import { JobsSubmitJobInfo } from '@/api/generated';
import { Toggle } from '@/pages/_components/Toggle';
import JobFileUpload from './_components/JobFileUpload';
import { OperatorForm } from './_components/OperatorForm';
import { CheckReferenceCTA } from './_components/CheckReferenceCTA';

export default function Page() {
  const { t } = useTranslation();
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
  const [operator, setOperator] = useState<OperatorItem[]>([{ pauli: '', coeff: ['0', '0'] }]);
  useEffect(() => {
    setJobInfo((jobInfo) => ({ ...jobInfo, program }));
    setError((error) => ({ ...error, jobInfo: { ...error.jobInfo, program: {} } }));
  }, [program]);
  useEffect(() => {
    setJobInfo((jobInfo) => ({
      ...jobInfo,
      operator: operator.map((op) => ({
        ...op,
        coeff: op.coeff.map((c) => (c === '' ? NaN : Number(c))),
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
    setOperator(jobFileData.jobInfo.operator ?? [{ pauli: '', coeff: ['0', '0'] }]);
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
        coeff: { [index: number]: [string | undefined, string | undefined] };
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
  const [postError, setPostError] = useState<string | null>(null);
  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError((error) => ({ ...error, name: t('job.form.error_message.name') }));
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
          if (operatorItem.coeff) {
            const errors = [undefined, undefined] as [string | undefined, string | undefined];
            operatorItem.coeff.forEach((c: number, j: number) => {
              if (isNaN(c)) {
                errors[j] = t('job.form.error_message.operator.coeff');
              }
            });
            if (errors.some((e) => e !== undefined)) {
              setError((error) => ({
                ...error,
                jobInfo: {
                  ...error.jobInfo,
                  operator: {
                    ...error.jobInfo.operator,
                    coeff: {
                      ...error.jobInfo.operator.coeff,
                      [i]: errors,
                    },
                  },
                },
              }));
              return false;
            }
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
    setPostError(null);
    submitJob({
      name: name.trim(),
      description,
      device_id: deviceId,
      job_type: jobType,
      job_info: sanitizedJobInfo,
      transpiler_info: JSON.parse(transpilerInfo),
      simulator_info: JSON.parse(simulatorInfo),
      mitigation_info: JSON.parse(mitigationInfo),
      shots,
    })
      .then((jobId) => {})
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setPostError(e.message);
        } else {
          console.error(e);
        }
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <div>
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
              <p className={clsx('font-bold', 'text-primary')}>program</p>
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
            <Spacer className="h-5" />
            {/* operator */}
            {jobType === 'estimation' && (
              <OperatorForm current={operator} set={setOperator} error={error.jobInfo.operator} />
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
            <Button color="secondary" onClick={handleSubmit} loading={processing}>
              {t('job.form.button')}
            </Button>
          </div>
          <CheckReferenceCTA />
        </div>
        {postError && <p className={clsx('text-error', 'mt-2')}>{postError}</p>}
      </Card>
    </div>
  );
}
