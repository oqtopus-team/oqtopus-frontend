import { JobsSubmitJobRequest } from '@/api/generated';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BsPencilSquare } from 'react-icons/bs';
import { NavLink } from 'react-router';

export const LogItemUseInputButton = ({ input }: { input: JobsSubmitJobRequest }) => {
  const { t } = useTranslation();

  const params = new URLSearchParams();
  if (input.name) {
    params.append('name', `Copy of ${input.name}`);
  }
  if (input.description) {
    params.append('description', input.description);
  }
  params.append('shots', input.shots.toString());
  params.append('device_id', input.device_id);
  params.append('type', input.job_type);
  if ([...input.job_info.program].length > 0) {
    params.append('program', input.job_info.program[0]);
  }
  if (input.job_info.operator) {
    input.job_info.operator.forEach((operator) => {
      if (!Array.isArray(operator.coeff)) {
        return;
      }
      params.append('operator', [operator.pauli, ...operator.coeff].join(','));
    });
  }
  if (input.transpiler_info) {
    params.append('transpiler_info', JSON.stringify(input.transpiler_info));
  }
  if (input.simulator_info) {
    params.append('simulator_info', JSON.stringify(input.simulator_info));
  }
  if (input.mitigation_info) {
    params.append('mitigation_info', JSON.stringify(input.mitigation_info));
  }

  return (
    <NavLink to={'/jobs/form?' + params.toString()} target="_brank" className="text-link">
      <div className={clsx('flex', 'gap-1', 'items-center')}>
        <BsPencilSquare size={16} />
        <p>{t('job.form.log.copytouse')}</p>
      </div>
    </NavLink>
  );
};
