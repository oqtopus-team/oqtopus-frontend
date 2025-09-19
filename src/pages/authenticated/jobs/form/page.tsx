import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OperatorItem, ProgramType, TranspilerTypeType } from '@/domain/types/Job';
import { JobsJobType } from '@/api/generated';
import * as yup from 'yup';
import { JobForm } from '@/pages/authenticated/jobs/_components/JobForm';
import { useTranslation } from 'react-i18next';

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
      .typeError(t('job.form.error_message.shots'))
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
      <JobForm />
    </div>
  );
}
