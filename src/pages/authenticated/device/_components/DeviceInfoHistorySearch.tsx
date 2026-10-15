import { Button } from '@/pages/_components/Button';
import { Select } from '@/pages/_components/Select';
import { DateTimeFormatter, locales } from '@/pages/authenticated/_components/DateTimeFormatter';
import { useDeviceAPI } from '@/backend/hook';
import { Device, DeviceInfoHistoryEntry } from '@/domain/types/Device';
import DatePicker from 'react-datepicker';
import { enUS } from 'date-fns/locale';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { BsDownload } from 'react-icons/bs';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';
import { errorToastConfig } from '@/config/toast';
import {
  createDeviceInfoJsonFileName,
  downloadDeviceInfoJson,
  downloadDeviceInfoHistoryZip,
} from '../_utils/downloadDeviceInfoJson';

type SearchParams = {
  deviceId?: string;
  from?: string;
  to?: string;
};

const presetOptions = ['today', 'last7Days', 'last30Days'] as const;
type PresetOption = (typeof presetOptions)[number];

const PAGE_SIZE = 10;

export const DeviceInfoHistorySearch = ({ devices }: { devices: Device[] }): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const { getDeviceInfoHistory, getDeviceHistory } = useDeviceAPI();
  const [params, setParams] = useState<SearchParams>({});
  const [appliedParams, setAppliedParams] = useState<SearchParams>({});
  const [historyEntries, setHistoryEntries] = useState<DeviceInfoHistoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasDateRangeError, setHasDateRangeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [downloadingHistoryId, setDownloadingHistoryId] = useState<string>();
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const requestGenerationRef = useRef(0);
  const isLoadingRef = useRef(false);

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
    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;
    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadError(false);
    setHistoryEntries([]);
    setTotalCount(0);
    setSelectedHistoryIds([]);
    setHasMore(false);
    getDeviceInfoHistory({
      deviceId: appliedParams.deviceId,
      from: appliedParams.from,
      to: appliedParams.to,
      limit: PAGE_SIZE,
      offset: 0,
    })
      .then((history) => {
        if (requestGeneration !== requestGenerationRef.current) return;
        setHistoryEntries(history.items);
        setTotalCount(history.total);
        setHasMore(history.items.length < history.total);
        setSelectedHistoryIds([]);
      })
      .catch(() => {
        if (requestGeneration !== requestGenerationRef.current) return;
        setHistoryEntries([]);
        setTotalCount(0);
        setHasMore(false);
        setSelectedHistoryIds([]);
        setLoadError(true);
      })
      .finally(() => {
        if (requestGeneration === requestGenerationRef.current) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      });

    return () => {
      if (requestGeneration === requestGenerationRef.current) {
        requestGenerationRef.current += 1;
      }
    };
  }, [appliedParams, reloadCount]);

  const loadMoreHistories = async (): Promise<void> => {
    if (isLoadingRef.current || loadError || !hasMore) return;

    const requestGeneration = requestGenerationRef.current;
    const offset = historyEntries.length;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const history = await getDeviceInfoHistory({
        deviceId: appliedParams.deviceId,
        from: appliedParams.from,
        to: appliedParams.to,
        limit: PAGE_SIZE,
        offset,
      });
      if (requestGeneration !== requestGenerationRef.current) return;
      setHistoryEntries((current) => [...current, ...history.items]);
      setTotalCount(history.total);
      setHasMore(offset + history.items.length < history.total);
    } catch {
      if (requestGeneration === requestGenerationRef.current) {
        setLoadError(true);
        setHasMore(false);
      }
    } finally {
      if (requestGeneration === requestGenerationRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    }
  };

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
    if (downloadingHistoryId || isBulkDownloading) return;
    setDownloadingHistoryId(entry.historyId);
    try {
      const detail = await getDeviceHistory(entry.historyId);
      if (!detail) throw new Error(`Device history not found: ${entry.historyId}`);
      downloadDeviceInfoJson(
        detail.deviceInfo,
        createDeviceInfoJsonFileName(entry.deviceId, entry.calibratedAt)
      );
    } catch (error) {
      console.error(error);
      toast(t('device.detail.history.download_failed'), errorToastConfig);
    } finally {
      setDownloadingHistoryId(undefined);
    }
  };

  const handleHistorySelectionChange = (historyId: string, selected: boolean): void => {
    setSelectedHistoryIds((current) =>
      selected ? [...current, historyId] : current.filter((id) => id !== historyId)
    );
  };

  const areAllHistoriesSelected =
    historyEntries.length > 0 &&
    historyEntries.every((entry) => selectedHistoryIds.includes(entry.historyId));

  const handleAllHistoriesSelectionChange = (selected: boolean): void => {
    setSelectedHistoryIds(selected ? historyEntries.map((entry) => entry.historyId) : []);
  };

  const handleDownloadSelectedHistories = async (): Promise<void> => {
    if (selectedHistoryIds.length === 0 || isBulkDownloading) return;
    setIsBulkDownloading(true);

    try {
      const selectedEntries = historyEntries.filter((entry) =>
        selectedHistoryIds.includes(entry.historyId)
      );
      const archiveEntries = await Promise.all(
        selectedEntries.map(async (entry) => {
          const detail = await getDeviceHistory(entry.historyId);
          if (!detail) {
            throw new Error(`Device history not found: ${entry.historyId}`);
          }
          return {
            deviceInfo: detail.deviceInfo,
            historyId: entry.historyId,
          };
        })
      );
      await downloadDeviceInfoHistoryZip(archiveEntries);
    } catch (error) {
      console.error(error);
      toast(t('device.detail.history.bulk_download_failed'), errorToastConfig);
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return (
    <div className={clsx('grid', 'gap-5')}>
      <form noValidate onSubmit={onSubmit}>
        <div className={clsx('flex', 'justify-between', 'items-end', 'flex-nowrap', 'gap-6')}>
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
                      <label className="text-xs" htmlFor="device-history-from">
                        {t('device.detail.history.from')}
                      </label>
                      <DatePicker
                        id="device-history-from"
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
                      <label className="text-xs" htmlFor="device-history-to">
                        {t('device.detail.history.to')}
                      </label>
                      <DatePicker
                        id="device-history-to"
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

      <section className={clsx('flex', 'justify-end')}>
        <Button
          color={selectedHistoryIds.length === 0 || isBulkDownloading ? 'disabled' : 'secondary'}
          type="button"
          disabled={selectedHistoryIds.length === 0 || isBulkDownloading}
          onClick={() => void handleDownloadSelectedHistories()}
        >
          <div className={clsx('flex', 'items-center', 'gap-2')}>
            <BsDownload />
            <span>{t('device.detail.history.bulk_download')}</span>
          </div>
        </Button>
      </section>

      <div className={clsx('overflow-x-auto')}>
        <InfiniteScroll
          next={() => void loadMoreHistories()}
          hasMore={hasMore}
          loader={null}
          dataLength={historyEntries.length}
        >
          <table className={clsx('table-auto', 'w-full')}>
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    checked={areAllHistoriesSelected}
                    aria-label={t('device.detail.history.select_all')}
                    onChange={(event) =>
                      handleAllHistoriesSelectionChange(event.currentTarget.checked)
                    }
                  />
                </th>
                <th scope="col">{t('device.detail.history.history_id')}</th>
                <th scope="col" className={clsx('text-center')}>
                  {t('device.list.table.id')}
                </th>
                <th scope="col" className={clsx('text-center')}>
                  {t('device.detail.history.captured_at')}
                </th>
                <th scope="col" className={clsx('text-center')}>
                  {t('device.detail.qubits')}
                </th>
                <th scope="col" className={clsx('text-center')}>
                  {t('device.detail.couplings')}
                </th>
                <th scope="col" className={clsx('text-center')}>
                  {t('device.detail.history.download_json')}
                </th>
              </tr>
            </thead>
            <tbody>
              {historyEntries.length === 0 && !loadError ? (
                <tr>
                  <td colSpan={7} className={clsx('text-center', 'text-secondary-content')}>
                    {isLoading
                      ? t('device.detail.history.loading')
                      : t('device.detail.history.empty')}
                  </td>
                </tr>
              ) : (
                historyEntries.map((entry) => (
                  <tr key={entry.historyId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedHistoryIds.includes(entry.historyId)}
                        aria-label={t('device.detail.history.select_history', {
                          historyId: entry.historyId,
                        })}
                        onChange={(event) =>
                          handleHistorySelectionChange(entry.historyId, event.currentTarget.checked)
                        }
                      />
                    </td>
                    <td>
                      <NavLink
                        to={`/device/${entry.deviceId}?deviceHistoryId=${encodeURIComponent(entry.historyId)}`}
                        className="text-link"
                      >
                        {entry.historyId}
                      </NavLink>
                    </td>
                    <td className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                      <NavLink to={`/device/${entry.deviceId}`} className="text-link">
                        {entry.deviceId}
                      </NavLink>
                    </td>
                    <td className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                      <NavLink
                        to={`/device/${entry.deviceId}?deviceHistoryId=${encodeURIComponent(entry.historyId)}`}
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
                        disabled={isBulkDownloading || downloadingHistoryId === entry.historyId}
                        aria-label={t('device.detail.history.download_json')}
                        title={t('device.detail.history.download_json')}
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
        </InfiniteScroll>
        {loadError && (
          <div
            role="alert"
            className={clsx(
              'mt-4',
              'flex',
              'items-center',
              'justify-center',
              'gap-3',
              'text-error'
            )}
          >
            <span>{t('device.detail.history.load_failed')}</span>
            <Button
              size="small"
              color="secondary"
              type="button"
              onClick={() => setReloadCount((current) => current + 1)}
            >
              {t('device.detail.history.retry')}
            </Button>
          </div>
        )}
        {hasMore && (
          <button
            type="button"
            disabled={isLoading}
            className={clsx(
              'flex',
              'h-12',
              'w-full',
              'items-center',
              'justify-center',
              'text-sm',
              'text-info',
              !isLoading && 'cursor-pointer'
            )}
            onClick={() => void loadMoreHistories()}
          >
            {isLoading ? t('device.detail.history.loading') : t('device.detail.history.load_more')}
          </button>
        )}
      </div>
    </div>
  );
};
