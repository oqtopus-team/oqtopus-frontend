import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { Select } from '@/pages/_components/Select';
import { Spacer } from '@/pages/_components/Spacer';
import { isJobStatus, JobSearchParams, JOB_STATUSES } from '@/domain/types/Job';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const JobSearchForm = ({
  params,
  setParams,
  onSubmit,
}: {
  params: JobSearchParams;
  setParams: React.Dispatch<React.SetStateAction<JobSearchParams>>;
  onSubmit: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h3 className={clsx('text-primary', 'font-bold')}>{t('job.list.search.head')}</h3>
      <Spacer className="h-5" />
      <div className={clsx('flex', 'justify-between', 'items-end', 'flex-nowrap', 'gap-6')}>
        <div className="flex-1">
          <Input
            placeholder={t('job.list.search.id_placeholder')}
            label={t('job.list.table.id')}
            value={params.jobid ?? ""}
            onChange={(e) => setParams({ ...params, jobid: e.target.value === '' ? undefined : e.target.value })}
          />
        </div>
        <div className="flex-1">
          <div className={clsx('grid', 'gap-1')}>
            <p className="text-xs">{t('job.list.table.status')}</p>
            <Select
              value={params.status ?? ''}
              onChange={(e) => {
                if (e.currentTarget.value === '') {
                  setParams({ ...params, status: undefined });
                  return;
                }
                if (!isJobStatus(e.currentTarget.value)) {
                  return;
                }
                setParams({ ...params, status: e.currentTarget.value });
              }}
            >
              <option></option>
              {JOB_STATUSES.map((status, idx) => (
                <option value={status} key={idx}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex-1">
          <Input
            placeholder={t('job.list.search.description_placeholder')}
            label={t('job.list.table.description')}
            value={params.description ?? ""}
            onChange={(e) =>
              setParams({
                ...params,
                description: e.target.value === '' ? undefined : e.target.value,
              })
            }
          />
        </div>
        <div className="w-[60px]">
          <Button color="secondary" type="submit">
            {t('job.list.search.button')}
          </Button>
        </div>
      </div>
    </form>
  );
};
