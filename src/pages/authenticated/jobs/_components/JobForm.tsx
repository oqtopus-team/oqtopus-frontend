import clsx from 'clsx';
import { Input } from '@/pages/_components/Input';
import {
  TranspilerTypeType,
  initializeJobFormProgramDefaults,
  JOB_FORM_MITIGATION_INFO_DEFAULTS,
  JOB_TYPE_DEFAULT,
  JOB_TYPES,
  JobFileData,
  PROGRAM_TYPE_DEFAULT,
  PROGRAM_TYPES,
  ProgramType,
  SHOTS_DEFAULT,
  TRANSPILER_TYPE_DEFAULT,
  TRANSPILER_TYPES,
  MitigationTypeType,
} from '@/domain/types/Job';
import { Select } from '@/pages/_components/Select';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { BsCaretDown } from 'react-icons/bs';
import { ChangeEvent, FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import { Spacer } from '@/pages/_components/Spacer';
import { TextArea } from '@/pages/_components/TextArea';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import { Divider } from '@/pages/_components/Divider';
import { Toggle } from '@/pages/_components/Toggle';
import JobFileUpload from '@/pages/authenticated/jobs/form/_components/JobFileUpload';
import { Button } from '@/pages/_components/Button';
import { Card } from '@/pages/_components/Card';
import { useTranslation } from 'react-i18next';
import { FieldError, FieldErrorsImpl, Merge, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavLink, useNavigate } from 'react-router';
import { useDeviceAPI, useJobAPI } from '@/backend/hook';
import { JobsJobType, JobsOperatorItem } from '@/api/generated';
import * as yup from 'yup';
import { Device } from '@/domain/types/Device';
import { toast } from 'react-toastify';
import i18next, { TFunction } from 'i18next';

interface FormInput {
  name: string;
  description?: string;
  shots: number;
  deviceId: string;
  type: JobsJobType;
  program: string;
  programType: ProgramType;
  transpilerType: TranspilerTypeType | 'Custom';
  mitigationType: MitigationTypeType | 'Custom';
  transpiler?: string;
  simulator?: string;
  mitigation?: string;
  operator: JobsOperatorItem[];
}

type Program = { program: string; qubitNumber: number };

interface YupContext {
  mkProgram: Program;
  devices: Device[];
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

const validationRules = (t: TFunction<'translation', undefined>): yup.ObjectSchema<FormInput> =>
  yup.object({
    name: yup.string().required(t('job.form.error_message.name')),
    description: yup.string(),
    shots: yup
      .number()
      .typeError(t('job.form.error_message.shots'))
      .integer(t('job.form.error_message.shots_integer'))
      .min(1, t('job.form.error_message.shots'))
      .required(),
    deviceId: yup
      .string()
      .required(t('job.form.error_message.device'))
      .test('check-qubits', function (value) {
        const { mkProgram, devices } = (this.options.context || {}) as YupContext;

        if (!value || !mkProgram?.qubitNumber || !devices) return true;

        const selectedDevice = devices.find((d) => d.id === value);

        if (!selectedDevice) return true;

        if (mkProgram.qubitNumber > selectedDevice.nQubits) {
          return this.createError({
            message: t('job.form.error_message.deviceInsufficientQubits', {
              deviceQubits: selectedDevice.nQubits,
              programQubits: mkProgram.qubitNumber,
            }),
          });
        }

        return true;
      }),
    type: yup.mixed<JobsJobType>().required(t('job.form.error_message.type')),
    programType: yup.mixed<ProgramType>().required(),
    program: yup.string().required(t('job.form.error_message.program')),
    transpilerType: yup.mixed<TranspilerTypeType>().required(),
    transpiler: yup.string().test('', t('job.form.error_message.invalid_json'), isJsonParsable),
    simulator: yup.string().test('', t('job.form.error_message.invalid_json'), isJsonParsable),
    mitigationType: yup.mixed<MitigationTypeType>().required(),
    mitigation: yup.string().test('', t('job.form.error_message.invalid_json'), isJsonParsable),
    operator: yup.array().of(operatorItemSchema(t)).required(),
  });

interface JobFormProps {
  mkProgram?: Program;
  mkOperator?: JobsOperatorItem[];
  isAdvancedSettingsOpen?: boolean;
  displayFields?: {
    program?: boolean;
  };
}

export const JobForm = (componentProps: JobFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getDevices } = useDeviceAPI();
  const { submitJob } = useJobAPI();
  const { displayFields = { program: true }, ...props } = componentProps;
  const [devices, setDevices] = useState<Device[]>([]);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    register,
    trigger,
  } = useForm<FormInput>({
    mode: 'onChange',
    resolver: yupResolver(validationRules(t)),
    context: {
      devices: devices,
      mkProgram: props.mkProgram,
    },
    defaultValues: {
      name: '',
      description: '',
      type: JOB_TYPE_DEFAULT,
      mitigation: '{}',
      programType: PROGRAM_TYPE_DEFAULT,
      program: '',
      transpilerType: 'Default',
      transpiler: '{}',
      shots: SHOTS_DEFAULT,
      operator: [],
      simulator: '{}',
    },
  });

  const [mitigationType, mitigation, transpilerType, program, jobType, operator] =
    watch([
      'mitigationType',
      'mitigation',
      'transpilerType',
      'program',
      'type',
      'operator',
    ]);

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
    if (props.mkProgram) {
      setValue('program', props.mkProgram?.program);
      setValue('operator', props.mkOperator ?? [{ pauli: '', coeff: 1.0 }]);
    }
  }, [props.mkProgram?.program]);

  // Change templates after changing types
  useEffect(() => {
    if (transpilerType !== 'Custom') {
      setValue('transpiler', TRANSPILER_TYPES[transpilerType], { shouldValidate: true });
    }
  }, [transpilerType]);
  useEffect(() => {
    if (mitigationType !== 'Custom') {
      setValue('mitigation', JOB_FORM_MITIGATION_INFO_DEFAULTS[mitigationType], { shouldValidate: true });
    }
  }, [mitigationType]);

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
      setValue('mitigation', JSON.stringify(jobFileData.mitigationInfo));
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
    <Card className={clsx('max-w-[2160px]')}>
      <div className={clsx('flex-1', 'min-w-[240px]', 'max-w-[1080px]')}>
        {/* Common */}
        <div className={clsx('grid', 'grid-cols-2', 'gap-5')}>
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
          <div
            className={clsx(
              '[&>*:first-child]:grid',
              '[&>*:first-child]:gap-1',
              '[&>*:first-child]:w-full'
            )}
          >
            <Select
              label="device"
              {...register('deviceId')}
              errorMessage={errors.deviceId && errors.deviceId.message}
            >
              <option value=""></option>
              {devices.map((device) => (
                <option key={device.id} disabled={device.status === 'unavailable'}>
                  {device.id}
                </option>
              ))}
            </Select>
          </div>
          <div
            className={clsx(
              '[&>*:first-child]:grid',
              '[&>*:first-child]:gap-1',
              '[&>*:first-child]:w-full'
            )}
          >
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
        </div>
        <Accordion
          defaultExpanded={props.isAdvancedSettingsOpen ?? true}
          disableGutters
          elevation={0}
          square
          className={clsx('mt-5')}
          sx={{
            '&::before': {
              content: 'unset',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<BsCaretDown />}
            sx={{
              flexDirection: 'row-reverse',
              justifyContent: 'flex-end',
              paddingLeft: 0,
              '& .MuiAccordionSummary-expandIconWrapper': {
                marginRight: 1,
              },
            }}
          >
            <span className="text-link">Advanced Options</span>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            {displayFields?.program && (
              <>
                <div className={clsx('flex', 'justify-between')}>
                  <p className={clsx('font-bold', 'text-primary')}>program</p>
                  <Select
                    disabled={Boolean(props.mkProgram?.program)}
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

                {/* programs */}
                <TextArea
                  disabled={Boolean(props.mkProgram?.program)}
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
              </>
            )}
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
                    size="xs"
                    defaultValue={TRANSPILER_TYPE_DEFAULT}
                  >
                    {Object.keys(TRANSPILER_TYPES).map((k) => {
                      const key = k as TranspilerTypeType;
                      return (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      );
                    })}
                    <option value="Custom">Custom</option>
                  </Select>
                </div>
                <Spacer className="h-2" />
              </>
              <Spacer className="h-2" />
              <TextArea
                {...register('transpiler')}
                className={clsx('h-[16rem]', transpilerType !== 'Custom' && 'hidden')}
                placeholder={t('job.form.transpiler_placeholder')}
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
                  <Select
                    {...register('mitigationType')}
                    defaultValue={JOB_FORM_MITIGATION_INFO_DEFAULTS.None}
                  >
                    {Object.keys(JOB_FORM_MITIGATION_INFO_DEFAULTS).map((k) => {
                      const key = k as MitigationTypeType;
                      return (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      );
                    })}
                    <option value={'Custom'}>Custom</option>
                  </Select>
                </div>
                <Spacer className="h-2" />
              </>
              <TextArea
                className={clsx('h-[16rem]', mitigationType !== 'Custom' && 'hidden')}
                {...register('mitigation')}
                placeholder={t('job.form.mitigation_placeholder')}
                value={mitigation}
                errorMessage={errors.mitigation && errors.mitigation.message}
              />
            </div>
          </AccordionDetails>
        </Accordion>
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
  );
};

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
  current: JobsOperatorItem[];
  set: (_: JobsOperatorItem[]) => Promise<void>;
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<JobsOperatorItem>> | undefined)[]>
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
