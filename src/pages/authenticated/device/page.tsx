import { Card } from '@/pages/_components/Card';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { DeviceListTable } from './_components/DeviceListTable';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useDeviceAPI } from '@/backend/hook';
import { useLayoutEffect, useState } from 'react';
import { Device } from '@/domain/types/Device';

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('device.list.title'));

  const { getDevices } = useDeviceAPI();
  const [devices, setDevices] = useState<Device[]>([]);

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
      <Card>
        <DeviceListTable devices={devices} />
      </Card>
    </>
  );
}
