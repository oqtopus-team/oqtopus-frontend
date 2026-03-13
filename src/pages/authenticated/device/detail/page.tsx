import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MapView } from './_components/MapView';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useParams } from 'react-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Device, DeviceInfo } from '@/domain/types/Device';
import { useDeviceAPI } from '@/backend/hook';
import { Loader } from '@/pages/_components/Loader';
import { DeviceDetailBasicInfo } from './_components/DeviceDetailBasicInfo';
import { Tab, Tabs } from '@mui/material';
import QubitGraphView from '@/pages/authenticated/device/detail/_components/GraphView';
import { toast } from 'react-toastify';
import { errorToastConfig } from '@/config/toast';
import TableView from '@/pages/authenticated/device/detail/_components/TableView';

export default function DeviceDetailPage_() {
  const { id } = useParams();
  return <DeviceDetailPage params={{ id: id ?? 'notfound' }} />;
}

type Params = { id: string };

function DeviceDetailPage({ params: { id } }: { params: Params }) {
  const [activeTab, setActiveTab] = useState('map');
  const [parsedDeviceInfo, setParsedDeviceInfo] = useState<DeviceInfo>();

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

  useEffect(() => {
    const parsedDeviceInfo = (() => {
      try {
        if (!device?.deviceInfo) {
          return;
        }
        return JSON.parse(device.deviceInfo);
      } catch (err) {
        toast('Failed to parse device info', errorToastConfig);
        console.error('Failed to parse device info:', err);
        return {};
      }
    })();

    if (!parsedDeviceInfo?.qubits || !parsedDeviceInfo?.couplings) return;
    setParsedDeviceInfo(parsedDeviceInfo);
  }, [device]);

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
      <Spacer className="h-6" />
      {parsedDeviceInfo ? (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, value) => {
              setActiveTab(value);
            }}
            variant="fullWidth"
            sx={{
              backgroundColor: 'var(--color-base-card)',
              '& .MuiTab-root': {
                color: 'var(--color-base-content)',
              },
            }}
          >
            <Tab
              label={t('device.detail.topology_info.map_view')}
              value="map"
              disabled={device.deviceType !== 'QPU'}
            />
            <Tab label={t('device.detail.topology_info.graph_view')} value="graph" />
            <Tab label={t('device.detail.topology_info.table_view')} value="table" />
          </Tabs>
          <Spacer className="h-6" />
          {activeTab === 'map' && <MapView deviceInfo={parsedDeviceInfo} />}
          {activeTab === 'graph' && <QubitGraphView deviceInfo={parsedDeviceInfo} />}
          {activeTab === 'table' && <TableView deviceInfo={parsedDeviceInfo} />}
        </>
      ) : (
        <p className={clsx('text-error', 'text-xl')}>
          {t('device.detail.topology_info.invalid_device_info')}
        </p>
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
