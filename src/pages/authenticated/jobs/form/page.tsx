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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { ChangeEvent, FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import { Device } from '@/domain/types/Device';
import {
  initializeJobFormProgramDefaults,
  JOB_FORM_MITIGATION_INFO_DEFAULTS,
  JOB_FORM_TRANSPILER_INFO_DEFAULTS,
  JOB_TYPE_DEFAULT,
  JOB_TYPES,
  JobFileData,
  OperatorItem,
  PROGRAM_TYPE_DEFAULT,
  PROGRAM_TYPES,
  ProgramType,
  SHOTS_DEFAULT,
  TRANSPILER_TYPE_DEFAULT,
  TRANSPILER_TYPES,
  TranspilerTypeType,
} from '@/domain/types/Job';
import { JobsJobType } from '@/api/generated';
import { Toggle } from '@/pages/_components/Toggle';
import JobFileUpload from './_components/JobFileUpload';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import * as yup from 'yup';
import { FieldError, FieldErrorsImpl, Merge, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface FormInput {
  name: string;
  description?: string;
  shots: number;
  deviceId: string;
  type: JobsJobType;
  program: string;
  programType: ProgramType;
  transpilerType: TranspilerTypeType;
  transpiler?: string;
  simulator?: string;
  mitigationEnabled: boolean;
  mitigation?: string;
  operator: OperatorItem[];
}

const isJsonParsable = (value: string | undefined): boolean => {
  if (value === undefined) return false;

  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};

const operatorItemSchema = (t: (key: string) => string) =>
  yup.object({
    pauli: yup
      .string()
      .required(t('job.form.error_message.operator.pauli_required'))
      .matches(/^([IXYZ][0-9]+)*$/, t('job.form.error_message.operator.pauli_match'))
      .min(1, t('job.form.error_message.operator.pauli_empty')),
    coeff: yup.number().required(t('job.form.error_message.operator.coeff_required')),
  });

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    name: yup.string().required(t('job.form.error_message.name')),
    description: yup.string(),
    shots: yup
      .number()
      .typeError(t('job.form.error_message.shots_is_number'))
      .integer(t('job.form.error_message.shots_integer'))
      .min(1, t('job.form.error_message.shots'))
      .required(),
    deviceId: yup.string().required(t('job.form.error_message.device')),
    type: yup.mixed<JobsJobType>().required(t('job.form.error_message.type')),
    programType: yup.mixed<ProgramType>().required(),
    program: yup.string().required(t('job.form.error_message.program')),
    transpilerType: yup.mixed<TranspilerTypeType>().required(),
    transpiler: yup.string().test('', t('job.form.error_message.invalid_json'), isJsonParsable),
    simulator: yup.string().test('', t('job.form.error_message.invalid_json'), isJsonParsable),
    mitigationEnabled: yup.boolean().required(),
    mitigation: yup.string().test('', t('job.form.error_message.invalid_json'), isJsonParsable),
    operator: yup.array().of(operatorItemSchema(t)).required(),
  });

export default function Page() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getDevices } = useDeviceAPI();
  const { submitJob } = useJobAPI();

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    register,
    trigger,
  } = useForm<FormInput>({
    mode: 'onChange',
    resolver: yupResolver(validationRules(t)),
    defaultValues: {
      name: '',
      description: '',
      type: JOB_TYPE_DEFAULT,
      mitigationEnabled: true,
      mitigation: '',
      programType: PROGRAM_TYPE_DEFAULT,
      program: '',
      transpilerType: TRANSPILER_TYPE_DEFAULT,
      transpiler: JOB_FORM_TRANSPILER_INFO_DEFAULTS.Default,
      shots: SHOTS_DEFAULT,
      operator: [],
      simulator: '{}',
    },
  });

  const [transpilerType, transpiler, mitigationEnabled, mitigation, program, jobType, operator] =
    watch([
      'transpilerType',
      'transpiler',
      'mitigationEnabled',
      'mitigation',
      'program',
      'type',
      'operator',
    ]);

  const [devices, setDevices] = useState<Device[]>([]);

  useLayoutEffect(() => {
    getDevices().then((devices) => setDevices(devices));
  }, []);

  const [pendingProgramType, setPendingProgramType] = useState<ProgramType | null>(null);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
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
    // set default transpiler info if transpiler_info not changed or empty
    if (
      transpilerType === 'None' &&
      (transpiler === JOB_FORM_TRANSPILER_INFO_DEFAULTS.Default || transpiler?.trim() === '')
    ) {
      setValue('transpiler', JOB_FORM_TRANSPILER_INFO_DEFAULTS.None);
    }
    if (
      transpilerType === 'Default' &&
      (transpiler === JOB_FORM_TRANSPILER_INFO_DEFAULTS.None || transpiler?.trim() === '')
    ) {
      setValue('transpiler', JOB_FORM_TRANSPILER_INFO_DEFAULTS.Default);
    }
  }, [transpilerType]);

  useEffect(() => {
    if (
      mitigationEnabled &&
      (mitigation === JOB_FORM_MITIGATION_INFO_DEFAULTS.None || mitigation?.trim() === '')
    ) {
      setValue('mitigation', JOB_FORM_MITIGATION_INFO_DEFAULTS.PseudoInv);
    }
    if (!mitigationEnabled) {
      setValue('mitigation', JOB_FORM_MITIGATION_INFO_DEFAULTS.None);
    }
  }, [mitigationEnabled]);

  const [jobFileData, setJobFileData] = useState<JobFileData | undefined>(undefined);
  useEffect(() => {
    if (!jobFileData) return;

    setValue('name', jobFileData.name);
    setValue('description', jobFileData.description ?? '');
    setValue('shots', jobFileData.shots);
    setValue('type', jobFileData.jobType);
    setValue('type', jobFileData.jobType);
    setValue('program', jobFileData.jobInfo.program[0]);
    setValue('transpiler', JSON.stringify(jobFileData.transpilerInfo ?? ''));
    setValue('simulator', JSON.stringify(jobFileData.simulatorInfo ?? ''));
    setValue('operator', jobFileData.jobInfo.operator ?? [{ pauli: '', coeff: 1.0 }]);

    if (devices.some((d) => d.id === jobFileData.deviceId)) {
      setValue('deviceId', jobFileData.deviceId);
    }

    if (jobFileData.mitigationInfo) {
      setValue('mitigationEnabled', true);
      setValue('mitigation', JSON.stringify(jobFileData.mitigationInfo));
    } else {
      setValue('mitigationEnabled', false);
    }

    setJobFileData(undefined);
  }, [jobFileData]);

  const onSubmit = async (data: FormInput) => {
    if (isSubmitting) {
      toast.info(t('job.form.submitting'));
      return;
    }

    try {
      const res = await submitJob({
        name: data.name,
        description: data.description,
        device_id: data.deviceId,
        shots: data.shots,
        job_type: data.type,
        job_info: {
          program: [data.program],
          operator: data.type === 'estimation' ? data.operator : undefined,
        },
        transpiler_info: JSON.parse(data.transpiler ?? ''),
        simulator_info: JSON.parse(data.simulator ?? ''),
        mitigation_info: JSON.parse(data.mitigation ?? ''),
      });
      toast.success(t('job.form.toast.success'));
      return res;
    } catch (e) {
      console.error(e);
      toast.error(t('job.form.toast.error'));
    }
  };

  const onSubmitWithRedirection = async (data: FormInput) => {
    try {
      const res = await onSubmit(data);
      navigate('/jobs/' + res);
    } catch (e) {
      console.log(e);
    }
  };

  const handleProgramTypeChange = async (newProgramType: ProgramType) => {
    if (program !== '') {
      setPendingProgramType(newProgramType);
      setDeleteModalShow(true);
    } else {
      setValue('programType', newProgramType);
      if (jobDefaults) {
        setValue('program', jobDefaults[newProgramType]);
      }
    }
    await trigger('program');
  };

  const confirmProgramTypeChange = async () => {
    if (pendingProgramType) {
      setValue('programType', pendingProgramType);
      setPendingProgramType(null);
      if (jobDefaults) {
        setValue('program', jobDefaults[pendingProgramType]);
      }
    }
    setDeleteModalShow(false);
    await trigger('program');
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
                {...register('name')}
                errorMessage={errors.name && errors.name.message}
              />
              <Input
                placeholder={t('job.form.description_placeholder')}
                label="description"
                {...register('description')}
                errorMessage={errors.description && errors.description.message}
              />
              <Input
                placeholder={t('job.form.shots_placeholder')}
                label="shots"
                type="number"
                min={1}
                defaultValue={SHOTS_DEFAULT}
                onKeyDown={(event) => {
                  if (/^[a-zA-Z+\-]$/.test(event.key)) {
                    event.preventDefault();
                    return;
                  }
                }}
                {...register('shots')}
                errorMessage={errors.shots && errors.shots.message}
              />
              <Select
                label="device"
                {...register('deviceId')}
                errorMessage={errors.deviceId && errors.deviceId.message}
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
                {...register('type')}
                errorMessage={errors.type && errors.type.message}
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
                  {...register('programType')}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    handleProgramTypeChange(e.target.value as ProgramType);
                  }}
                  errorMessage={errors.programType && errors.programType.message}
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
              {...register('program')}
              errorMessage={errors.program && errors.program.message}
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
                set={async (v) => {
                  setValue('operator', v);
                  await trigger('operator');
                }}
                errors={errors.operator}
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
                  {...register('transpilerType')}
                  errorMessage={errors.transpilerType && errors.transpilerType.message}
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
              {...register('transpiler')}
              errorMessage={errors.transpiler && errors.transpiler.message}
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
              {...register('simulator')}
              errorMessage={errors.simulator && errors.simulator.message}
            />
            {/* mitigation */}
            <>
              <Spacer className="h-4" />
              <Divider />
              <Spacer className="h-4" />
              <div className={clsx('flex', 'justify-between')}>
                <p className={clsx('font-bold', 'text-primary')}>mitigation</p>
                <Toggle
                  {...register('mitigationEnabled')}
                  checked={mitigationEnabled}
                  onChange={(e) =>
                    register('mitigationEnabled').onChange({
                      target: { name: 'mitigationEnabled', value: e },
                    })
                  }
                />
              </div>
              <Spacer className="h-2" />
            </>
            <TextArea
              className={clsx('h-[16rem]')}
              placeholder={t('job.form.mitigation_placeholder')}
              {...register('mitigation')}
              errorMessage={errors.mitigation && errors.mitigation.message}
            />
          </div>
        </div>
        <Spacer className="h-4" />
        <div className={clsx('flex', 'flex-wrap', 'gap-2', 'justify-between', 'items-end')}>
          <div className={clsx('flex', 'flex-wrap', 'gap-2', 'justify-between')}>
            <JobFileUpload setJobFileData={setJobFileData} devices={devices} />
            <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)} color="secondary">
              {t('job.form.button')}
            </Button>
            <Button
              color="secondary"
              onClick={handleSubmit(onSubmitWithRedirection)}
              loading={isSubmitting}
            >
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
  errors = [],
}: {
  current: OperatorItem[];
  set: (_: OperatorItem[]) => Promise<void>;
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<OperatorItem>> | undefined)[]>
    | undefined;
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    set([{ pauli: '', coeff: 1.0 }]); // Initial setting form value
  }, []);

  const handleCoeffInput = (index: number) => async (e: FormEvent<HTMLInputElement>) => {
    const coeff = (e.target as HTMLInputElement).value;

    await set(current.map((o, i) => (i === index ? { ...o, coeff: Number(coeff) } : o)));
  };

  const handlePauliInput = (index: number) => async (e: FormEvent<HTMLInputElement>) => {
    await set(
      current.map((o, i) =>
        i === index ? { ...o, pauli: (e.target as HTMLInputElement)?.value } : o
      )
    );
  };

  const handlePlusButtonClick = async () => {
    await set([...current, { pauli: '', coeff: 1.0 }]);
  };

  return (
    <div className={clsx('grid', 'gap-2')}>
      <Divider />
      <Spacer className="h-2" />
      <p className={clsx('font-bold', 'text-primary')}>operator</p>
      <div className={clsx('grid', 'gap-4')}>
        {current.map((item, index) => (
          <div key={index} className={clsx('flex', 'gap-1', 'items-center')}>
            <div className={clsx('grid', 'gap-1', 'w-full')}>
              <div className={clsx('flex', 'gap-3', 'items-start')}>
                <Input
                  type="number"
                  label={t('job.form.operator.coeff')}
                  placeholder={t('job.form.operator_coeff_placeholder')}
                  value={current[index].coeff}
                  onInput={handleCoeffInput(index)}
                  errorMessage={errors[index]?.coeff?.message}
                />
                <Input
                  label={t('job.form.operator.pauli')}
                  placeholder={t('job.form.operator_pauli_placeholder')}
                  value={item.pauli}
                  onChange={handlePauliInput(index)}
                  errorMessage={errors[index]?.pauli?.message}
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
