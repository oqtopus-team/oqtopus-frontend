import clsx from 'clsx';
import { Device } from '@/domain/types/Device';
import { Button } from '@/pages/_components/Button';
import { useTranslation } from 'react-i18next';
import { DeviceStatus } from '@/pages/authenticated/device/_components/DeviceStatus';
import { Spacer } from '@/pages/_components/Spacer';
import { useDeviceAPI } from '@/backend/hook';
import { useEffect, useLayoutEffect, useState } from 'react';
import { NavLink } from 'react-router';

export const DeviceList = (): React.ReactElement => {
  const { t } = useTranslation();
  const { getDevices } = useDeviceAPI();

  const [devices, setDevices] = useState<Device[]>([]);
  useLayoutEffect(() => {
    getDevices().then((devices) => setDevices(devices));
  }, []);

  return (
    <>
      <div className={clsx('flex', 'justify-between', 'items-center')}>
        <div className={clsx('text-lg', 'font-bold', 'text-primary')}>
          {t('dashboard.device.title')}
        </div>
        <Button kind="link" color="secondary" href="/device">
          {t('dashboard.device.button')}
        </Button>
      </div>
      <Spacer className="h-3" />
      <table className={clsx('w-full', '[&_td]:whitespace-normal')}>
        <thead>
          <tr>
            <th>{t('dashboard.device.table.name')}</th>
            <th>{t('dashboard.device.table.status')}</th>
            <th>{t('dashboard.device.table.qubits')}</th>
            <th>{t('dashboard.device.table.type')}</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <tr key={index}>
              <td>
                <NavLink to={`/device/${device.id}`} className="text-link">
                  {device.id}
                </NavLink>
              </td>
              <td>
                <DeviceStatus status={device.status} />
              </td>
              <td>{device.nQubits}</td>
              <td>{device.deviceType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
