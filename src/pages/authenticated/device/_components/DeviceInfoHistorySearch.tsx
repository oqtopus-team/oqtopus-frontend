import { Button } from '@/pages/_components/Button';
import { Select } from '@/pages/_components/Select';
import { DateTimeFormatter, locales } from '@/pages/authenticated/_components/DateTimeFormatter';
import { useDeviceAPI } from '@/backend/hook';
import { Device, DeviceInfoHistoryEntry } from '@/domain/types/Device';
import DatePicker from 'react-datepicker';
import { enUS } from 'date-fns/locale';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { BsDownload } from 'react-icons/bs';
import {
  createDeviceInfoJsonFileName,
  downloadDeviceInfoJson,
} from '../_utils/downloadDeviceInfoJson';

type SearchParams = {
  deviceId?: string;
  from?: string;
  to?: string;
};

const presetOptions = ['today', 'last7Days', 'last30Days'] as const;
type PresetOption = (typeof presetOptions)[number];

export const DeviceInfoHistorySearch = ({ devices }: { devices: Device[] }): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const { getDeviceInfoHistory, getDeviceHistory } = useDeviceAPI();
  const [params, setParams] = useState<SearchParams>({});
  const [appliedParams, setAppliedParams] = useState<SearchParams>({});
  const [historyEntries, setHistoryEntries] = useState<DeviceInfoHistoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasDateRangeError, setHasDateRangeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingHistoryUid, setDownloadingHistoryUid] = useState<string>();

  useEffect(() => {
    setParams((currentParams) => {
      if (
        currentParams.deviceId === undefined ||
        devices.some((device) => device.id === currentParams.deviceId)
      ) {
        return currentParams;
      }
      return { ...currentParams, deviceId: undefined };
    });
    setAppliedParams((currentParams) => {
      if (
        currentParams.deviceId === undefined ||
        devices.some((device) => device.id === currentParams.deviceId)
      ) {
        return currentParams;
      }
      return { ...currentParams, deviceId: undefined };
    });
  }, [devices]);

  useEffect(() => {
    setIsLoading(true);
    getDeviceInfoHistory({
      deviceId: appliedParams.deviceId,
      from: appliedParams.from,
      to: appliedParams.to,
      limit: 100,
      offset: 0,
    })
      .then((history) => {
        setHistoryEntries(history.items);
        setTotalCount(history.total);
      })
      .catch(() => {
        setHistoryEntries([]);
        setTotalCount(0);
      })
      .finally(() => setIsLoading(false));
  }, [appliedParams]);

  const dateFormat = i18n.language === 'ja' ? 'yyyy/MM/dd HH:mm' : 'dd/MM/yyyy HH:mm';

  const validateDateRange = (from: string | undefined, to: string | undefined): boolean => {
    if (!from || !to) {
      setHasDateRangeError(false);
      return true;
    }

    const isValidRange = new Date(from) <= new Date(to);
    setHasDateRangeError(!isValidRange);
    return isValidRange;
  };

  const updateDatesWithPreset = (preset: PresetOption) => {
    const anchorDate = new Date();
    const from = new Date(anchorDate);
    const to = new Date(anchorDate);

    if (preset === 'today') {
      from.setHours(0, 0, 0, 0);
    } else if (preset === 'last7Days') {
      from.setDate(anchorDate.getDate() - 6);
      from.setHours(0, 0, 0, 0);
    } else {
      from.setDate(anchorDate.getDate() - 29);
      from.setHours(0, 0, 0, 0);
    }

    to.setHours(23, 59, 59, 999);
    setHasDateRangeError(false);
    setParams({ ...params, from: from.toISOString(), to: to.toISOString() });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateDateRange(params.from, params.to)) {
      return;
    }
    setAppliedParams(params);
  };

  const handleDownloadHistory = async (entry: DeviceInfoHistoryEntry) => {
    if (downloadingHistoryUid) return;
    setDownloadingHistoryUid(entry.historyUid);
    try {
      const detail = await getDeviceHistory(entry.historyUid);
      if (!detail) return;
      downloadDeviceInfoJson(
        detail.deviceInfo,
        createDeviceInfoJsonFileName(entry.deviceId, entry.calibratedAt)
      );
    } finally {
      setDownloadingHistoryUid(undefined);
    }
  };

  return (
    <div className={clsx('grid', 'gap-5')}>
      <form noValidate onSubmit={onSubmit}>
        <div className={clsx('flex', 'items-center', 'justify-end', 'gap-3', 'flex-wrap')}>
          <span
            className={clsx(
              'rounded-full',
              'border',
              'px-2.5',
              'py-1',
              'text-[11px]',
              'font-semibold',
              'text-base-content'
            )}
          >
            {t('device.detail.history.filtered_count', { count: totalCount })}
          </span>
        </div>
        <div
          className={clsx('mt-5', 'flex', 'justify-between', 'items-end', 'flex-nowrap', 'gap-6')}
        >
          <div className={clsx('flex', 'flex-1', 'flex-col', 'gap-6')}>
            <div className={clsx('flex', 'flex-1', 'justify-start', 'items-end')}>
              <div className={clsx('grid', 'gap-4', 'min-w-[16rem]', 'max-w-[24rem]', 'flex-1')}>
                <div className={clsx('grid', 'gap-1')}>
                  <p className="text-xs">{t('device.list.table.id')}</p>
                  <Select
                    value={params.deviceId ?? ''}
                    onChange={(event) =>
                      setParams({
                        ...params,
                        deviceId: event.currentTarget.value || undefined,
                      })
                    }
                    className={clsx('bg-base-card')}
                  >
                    <option value="">{t('device.detail.history.all_devices')}</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.id}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={clsx('grid', 'gap-3')}>
                  <div className={clsx('flex', 'gap-2')}>
                    <div>
                      <p className="text-xs">{t('device.detail.history.from')}</p>
                      <DatePicker
                        locale={locales[i18n.language as keyof typeof locales] ?? enUS}
                        className={clsx(
                          ['border', 'rounded'],
                          ['py-1.5', 'px-3'],
                          'text-xs',
                          'focus:outline-primary',
                          'max-w-[10rem]',
                          'bg-base-card',
                          hasDateRangeError ? ['border-error'] : []
                        )}
                        placeholderText={dateFormat}
                        showTimeSelect
                        selected={params.from ? new Date(params.from) : undefined}
                        isClearable
                        onChange={(fromDate) => {
                          validateDateRange(fromDate?.toISOString(), params.to);
                          setParams({ ...params, from: fromDate?.toISOString() });
                        }}
                        dateFormat={dateFormat}
                      />
                    </div>
                    <div>
                      <p className="text-xs">{t('device.detail.history.to')}</p>
                      <DatePicker
                        locale={locales[i18n.language as keyof typeof locales] ?? enUS}
                        className={clsx(
                          ['border', 'rounded'],
                          ['py-1.5', 'px-3'],
                          'text-xs',
                          'focus:outline-primary',
                          'max-w-[10rem]',
                          'bg-base-card',
                          hasDateRangeError ? ['border-error'] : []
                        )}
                        placeholderText={dateFormat}
                        showTimeSelect
                        selected={params.to ? new Date(params.to) : undefined}
                        isClearable
                        onChange={(toDate) => {
                          validateDateRange(params.from, toDate?.toISOString());
                          setParams({ ...params, to: toDate?.toISOString() });
                        }}
                        dateFormat={dateFormat}
                      />
                    </div>
                  </div>
                  <div className={clsx('flex', 'flex-wrap', 'gap-2')}>
                    <Button
                      size="small"
                      type="button"
                      onClick={() => updateDatesWithPreset('today')}
                    >
                      {t('device.detail.history.today')}
                    </Button>
                    <Button
                      size="small"
                      type="button"
                      onClick={() => updateDatesWithPreset('last7Days')}
                    >
                      {t('device.detail.history.last_7_days')}
                    </Button>
                    <Button
                      size="small"
                      type="button"
                      onClick={() => updateDatesWithPreset('last30Days')}
                    >
                      {t('device.detail.history.last_30_days')}
                    </Button>
                    <Button
                      size="small"
                      type="button"
                      onClick={() => {
                        setHasDateRangeError(false);
                        setParams({});
                        setAppliedParams({});
                      }}
                    >
                      {t('device.detail.history.clear_filter')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {hasDateRangeError && (
                <p className={clsx('text-xs', 'text-error', 'font-semibold')}>
                  {t('device.detail.history.invalid_range')}
                </p>
              )}
            </div>
          </div>
          <Button color="secondary" type="submit">
            {t('job.list.search.button')}
          </Button>
        </div>
      </form>

      <div className={clsx('overflow-x-auto')}>
        <table className={clsx('table-auto', 'w-full')}>
          <thead>
            <tr>
              <th className={clsx('text-center')}>{t('device.list.table.id')}</th>
              <th className={clsx('text-center')}>{t('device.detail.history.captured_at')}</th>
              <th className={clsx('text-center')}>{t('device.detail.qubits')}</th>
              <th className={clsx('text-center')}>{t('device.detail.couplings')}</th>
              <th className={clsx('text-center')}>{t('device.detail.history.download_json')}</th>
            </tr>
          </thead>
          <tbody>
            {historyEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className={clsx('text-center', 'text-secondary-content')}>
                  {isLoading
                    ? t('device.detail.history.loading')
                    : t('device.detail.history.empty')}
                </td>
              </tr>
            ) : (
              historyEntries.map((entry) => (
                <tr key={entry.historyUid}>
                  <td className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                    <NavLink to={`/device/${entry.deviceId}`} className="text-link">
                      {entry.deviceId}
                    </NavLink>
                  </td>
                  <td className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                    <NavLink
                      to={`/device/${entry.deviceId}?deviceHistoryUid=${encodeURIComponent(entry.historyUid)}`}
                      className="text-link"
                    >
                      {DateTimeFormatter(t, i18n, entry.calibratedAt)}
                    </NavLink>
                  </td>
                  <td className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                    {entry.nQubits}
                  </td>
                  <td className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                    {entry.nCouplings}
                  </td>
                  <td className={clsx('text-center')}>
                    <Button
                      size="small"
                      color="secondary"
                      type="button"
                      disabled={downloadingHistoryUid === entry.historyUid}
                      onClick={() => void handleDownloadHistory(entry)}
                    >
                      <BsDownload />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
