import { Card } from '@/pages/_components/Card';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { DeviceListTable } from './_components/DeviceListTable';
import { DeviceInfoHistorySearch } from './_components/DeviceInfoHistorySearch';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useDeviceAPI } from '@/backend/hook';
import { useLayoutEffect, useState } from 'react';
import { Device } from '@/domain/types/Device';
import { ReloadButton } from '@/pages/_components/ReloadButton';

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('device.list.title'));

  const { getDevices } = useDeviceAPI();
  const [devices, setDevices] = useState<Device[]>([]);
  const [historyReloadCount, setHistoryReloadCount] = useState(0);

  const fetchDevices = async () => {
    const res = await getDevices();
    setDevices(res);
  };

  useLayoutEffect(() => {
    fetchDevices();
    const intervalId = setInterval(fetchDevices, 60000);
    return (): void => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('device.list.title')}</h2>
      <Spacer className="h-8" />
      <Card className={clsx('overflow-x-auto')}>
        <DeviceListTable devices={devices} />
      </Card>
      <Spacer className="h-8" />
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold', 'flex', 'flex-wrap', 'gap-2')}>
        {t('device.detail.history.list_header')}
        <ReloadButton
          title={t('job.detail.reload')}
          onClick={() => setHistoryReloadCount((current) => current + 1)}
        />
      </h2>
      <Spacer className="h-8" />
      <DeviceInfoHistorySearch devices={devices} reloadCount={historyReloadCount} />
    </>
  );
}
