import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { Select } from '@/pages/_components/Select';
import { Spacer } from '@/pages/_components/Spacer';
import { isJobStatus, JobSearchParams, JOB_STATUSES } from '@/domain/types/Job';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const presetOptions = ['today', 'last7Days', 'last30Days'] as const;
type PresetOption = (typeof presetOptions)[number];
type PresetFn = () => [Date, Date];

const datetimePresets: Record<PresetOption, PresetFn> = {
  today: () => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return [from, to];
  },
  last7Days: () => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);

    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return [from, to];
  },
  last30Days: () => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);

    from.setDate(now.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return [from, to];
  },
};

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

  const [hasDateRangeError, setHasDateRangeError] = useState(false);

  function updateDatesWithPreset(presetFn: PresetFn) {
    return () => {
      const [from, to] = presetFn();

      setHasDateRangeError(false);
      setParams({
        ...params,
        from: from.toISOString(),
        to: to.toISOString(),
      });
    };
  }

  function validateDateRange(from: string | undefined, to: string | undefined): boolean {
    if (!from || !to) {
      setHasDateRangeError(false);
      return true;
    }
    const isFromBeforeTo = new Date(from) <= new Date(to);

    setHasDateRangeError(!isFromBeforeTo);
    return isFromBeforeTo;
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!validateDateRange(params.from, params.to)) return;

        onSubmit();
      }}
    >
      <h3 className={clsx('text-primary', 'font-bold')}>{t('job.list.search.head')}</h3>
      <Spacer className="h-5" />
      <div className={clsx('flex', 'justify-between', 'items-end', 'flex-nowrap', 'gap-6')}>
        <div className={clsx('flex', 'flex-1', 'flex-col', 'justify-between', 'gap-6')}>
          <div
            className={clsx(
              'flex',
              'flex-1',
              'justify-between',
              'items-end',
              'flex-nowrap',
              'gap-6'
            )}
          >
            <div className="flex-1">
              <Input
                placeholder={t('job.list.search.job_search_query_input_placeholder')}
                label={t('job.list.search.job_search_query_input')}
                value={params.query ?? ''}
                onChange={(e) =>
                  setParams({
                    ...params,
                    query: e.target.value === '' ? undefined : e.target.value,
                  })
                }
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
          </div>
          <div className="flex flex-1 gap-2 flex-col">
            <div className="flex gap-2">
              <div>
                <div className={clsx('flex', 'gap-1', 'items-center')}>
                  <p className="text-xs">{t('job.list.search.from')}</p>
                </div>
                <DatePicker
                  className={clsx(
                    ['border', 'rounded'],
                    ['py-1.5', 'px-3'],
                    'text-xs',
                    'focus:outline-primary',
                    'max-w-[10rem]',
                    hasDateRangeError ? ['border-error'] : []
                  )}
                  placeholderText="yyyy-MM-dd HH:mm"
                  showTimeSelect
                  selected={params.from ? new Date(params.from) : undefined}
                  isClearable={true}
                  onChange={(startDate) => {
                    validateDateRange(startDate?.toISOString(), params.to);
                    setParams({
                      ...params,
                      from: startDate?.toISOString(),
                    });
                  }}
                  dateFormat="yyyy-MM-dd HH:mm"
                />
              </div>
              <div>
                <div className={clsx('flex', 'gap-1', 'items-center')}>
                  <p className="text-xs">{t('job.list.search.to')}</p>
                </div>
                <DatePicker
                  className={clsx(
                    ['border', 'rounded'],
                    ['py-1.5', 'px-3'],
                    'text-xs',
                    'focus:outline-primary',
                    'max-w-[10rem]',
                    hasDateRangeError ? ['border-error'] : []
                  )}
                  placeholderText="yyyy-MM-dd HH:mm"
                  showTimeSelect
                  selected={params.to ? new Date(params.to) : undefined}
                  isClearable={true}
                  onChange={(endDate) => {
                    validateDateRange(params.from, endDate?.toISOString());
                    setParams({
                      ...params,
                      to: endDate?.toISOString(),
                    });
                  }}
                  dateFormat="yyyy-MM-dd HH:mm"
                />
              </div>
            </div>
            <div>
              {hasDateRangeError && (
                <p className={clsx('text-xs', 'text-error', 'font-semibold')}>
                  {t('job.list.search.error_message.from_is_after_to')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="small"
                type="button"
                onClick={updateDatesWithPreset(datetimePresets.today)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{t('job.list.search.today')}</span>
                </div>
              </Button>
              <Button
                size="small"
                type="button"
                onClick={updateDatesWithPreset(datetimePresets.last7Days)}
              >
                {t('job.list.search.last_7_days')}
              </Button>
              <Button
                size="small"
                type="button"
                onClick={updateDatesWithPreset(datetimePresets.last30Days)}
              >
                {t('job.list.search.last_30_days')}
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Button color="secondary" type="submit">
            {t('job.list.search.button')}
          </Button>
        </div>
      </div>
    </form>
  );
};
