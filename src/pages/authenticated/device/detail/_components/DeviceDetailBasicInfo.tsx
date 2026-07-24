import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Device, DeviceInfoHistoryDetail } from '@/domain/types/Device';
import { Card } from '@/pages/_components/Card';
import { DeviceStatus } from '../../_components/DeviceStatus';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';

type DeviceDetailBasicInfoProps = Device & {
  historyDetail?: DeviceInfoHistoryDetail;
};

export const DeviceDetailBasicInfo: React.FC<DeviceDetailBasicInfoProps> = ({
  historyDetail,
  ...device
}) => {
  const { t, i18n } = useTranslation();
  const labelClass = clsx('text-xs', 'break-words');
  const valueClass = clsx('text-xl', 'break-words');
  const isHistoryDetail = Boolean(historyDetail);

  if (isHistoryDetail && historyDetail) {
    return (
      <Card>
        <div className={clsx('grid', 'grid-cols-4', 'gap-y-[3vh]', 'gap-x-[3vw]', 'p-[1vw]')}>
          <div>
            <p className={labelClass}>{t('device.detail.id')} :</p>
            <p className={valueClass}>{device.id}</p>
          </div>
          <div>
            <p className={labelClass}>{t('device.detail.topology_info.device_info_at')} :</p>
            <p className={valueClass}>{DateTimeFormatter(t, i18n, historyDetail.calibratedAt)}</p>
          </div>
          <div>
            <p className={labelClass}>{t('device.detail.qubits')} :</p>
            <p className={valueClass}>{historyDetail.nQubits}</p>
          </div>
          <div>
            <p className={labelClass}>{t('device.detail.couplings')} :</p>
            <p className={valueClass}>{historyDetail.nCouplings}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={clsx('grid', 'grid-cols-4', 'gap-y-[3vh]', 'gap-x-[3vw]', 'p-[1vw]')}>
        {device.id && (
          <div>
            <p className={labelClass}>{t('device.detail.id')} :</p>
            <p className={valueClass}>{device.id}</p>
          </div>
        )}
        {!isHistoryDetail && device.status && (
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
        {!isHistoryDetail && device.availableAt && (
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
