import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Device } from '@/domain/types/Device';
import { Card } from '@/pages/_components/Card';
import { DeviceStatus } from '../../_components/DeviceStatus';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';

export const DeviceDetailBasicInfo: React.FC<Device> = (device) => {
  const { t, i18n } = useTranslation();
  const labelClass = clsx('text-xs', 'break-words');
  const valueClass = clsx('text-xl', 'break-words');

  return (
    <Card>
      <div className={clsx('grid', 'grid-cols-4', 'gap-y-[3vh]', 'gap-x-[3vw]', 'p-[1vw]')}>
        {device.id && (
          <div>
            <p className={labelClass}>{t('device.detail.id')} :</p>
            <p className={valueClass}>{device.id}</p>
          </div>
        )}
        {device.status && (
          <div>
            <p className={labelClass}>{t('device.detail.status')} :</p>
            <div className={valueClass}>
              <DeviceStatus status={device.status} />
            </div>
          </div>
        )}
        {device.nQubits && (
          <div>
            <p className={labelClass}>{t('device.detail.qubits')} :</p>
            <p className={valueClass}>{device.nQubits}</p>
          </div>
        )}
        {device.deviceType && (
          <div>
            <p className={labelClass}>{t('device.detail.type')} :</p>
            <p className={valueClass}>{device.deviceType}</p>
          </div>
        )}
        {device.availableAt && (
          <div>
            <p className={labelClass}>{t('device.detail.available_at')} :</p>
            <p className={valueClass}>{DateTimeFormatter(t, i18n, device.availableAt)}</p>
          </div>
        )}
        {device.calibratedAt && (
          <div>
            <p className={labelClass}>{t('device.detail.calibrated_at')} :</p>
            <p className={valueClass}>{DateTimeFormatter(t, i18n, device.calibratedAt)}</p>
          </div>
        )}
        {device.basisGates.length !== 0 && (
          <div>
            <p className={labelClass}>{t('device.detail.basis_gates')} :</p>
            <p className={valueClass}>{device.basisGates.toString()}</p>
          </div>
        )}
        {device.supportedInstructions.length !== 0 && (
          <div>
            <p className={labelClass}>{t('device.detail.instructions')} :</p>
            <p className={valueClass}>{device.supportedInstructions.toString()}</p>
          </div>
        )}
        {device.description && (
          <div>
            <p className={labelClass}>{t('device.detail.description')} :</p>
            <p className={valueClass}>{device.description}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
