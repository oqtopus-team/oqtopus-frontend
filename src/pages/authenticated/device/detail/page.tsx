import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TopologyInfo } from './_components/TopologyInfo';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useParams } from 'react-router';
import { useLayoutEffect, useState } from 'react';
import { Device } from '@/domain/types/Device';
import { useDeviceAPI } from '@/backend/hook';
import { Loader } from '@/pages/_components/Loader';
import { DeviceDetailBasicInfo } from './_components/DeviceDetailBasicInfo';

export default function DeviceDetailPage_() {
  const { id } = useParams();
  return <DeviceDetailPage params={{ id: id ?? 'notfound' }} />;
}

type Params = { id: string };

function DeviceDetailPage({ params: { id } }: { params: Params }) {
  const { t } = useTranslation();
  useDocumentTitle(t('device.detail.title'));
  const { getDevice } = useDeviceAPI();

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  useLayoutEffect(() => {
    setLoading(true);
    if (id != '') {
      getDevice(id)
        .then((device) => setDevice(device))
        .catch(() => setIsSuccess(false))
        .finally(() => {
          setIsSuccess(true);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <LoadingView />;
  }
  if (device === null || !isSuccess) {
    return <NotFoundView />;
  }

  return (
    <>
      <Title />
      <Spacer className="h-6" />
      <DeviceDetailBasicInfo {...device} />
      {device.deviceType === 'QPU' && (
        <div>
          <Spacer className="h-6" />
          <TopologyInfo deviceInfo={device.deviceInfo} />
        </div>
      )}
    </>
  );
}

const Title = () => {
  const { t } = useTranslation();
  return (
    <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('device.detail.title')}</h2>
  );
};

const LoadingView = () => {
  return (
    <>
      <Title />
      <Spacer className="h-3" />
      <Loader />
    </>
  );
};

const NotFoundView = () => {
  const { t } = useTranslation();
  return (
    <>
      <Title />
      <Spacer className="h-3" />
      <p className={clsx('text-error', 'text-xs')}>{t('device.detail.not_found')}</p>
    </>
  );
};
