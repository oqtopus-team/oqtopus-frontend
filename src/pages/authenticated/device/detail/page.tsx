import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TopologyView } from './_components/TopologyView';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useParams } from 'react-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Device, DeviceInfo } from '@/domain/types/Device';
import { useDeviceAPI } from '@/backend/hook';
import { Loader } from '@/pages/_components/Loader';
import { DeviceDetailBasicInfo } from './_components/DeviceDetailBasicInfo';
import { Tab, Tabs } from '@mui/material';
import ChartView from '@/pages/authenticated/device/detail/_components/ChartView';
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
        .then((device) => {
          setDevice(device);
          if (device && device.deviceType !== 'QPU' && activeTab === 'map') {
            setActiveTab('graph');
          }
        })
        .catch(() => setIsSuccess(false))
        .finally(() => {
          setIsSuccess(true);
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (device && device.deviceType !== 'QPU' && activeTab === 'map') {
      setActiveTab('graph');
    }
  }, [device]);

  useEffect(() => {
    const parsed = (() => {
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

    if (parsed && (!parsed.qubits || !parsed.couplings)) {
      setParsedDeviceInfo(undefined);
      return;
    }
    setParsedDeviceInfo(parsed);
  }, [device]);

  if (loading) {
    return <LoadingView />;
  }
  if (device === null || !isSuccess) {
    return <NotFoundView />;
  }

  const hasDeviceInfo = !!parsedDeviceInfo;
  const isQpu = device.deviceType === 'QPU';
  const showDeviceInfoError = isQpu && !hasDeviceInfo && !!device.deviceInfo;

  return (
    <>
      <Title />
      <Spacer className="h-6" />
      <DeviceDetailBasicInfo {...device} />
      <Spacer className="h-6" />
      {hasDeviceInfo ? (
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
              label={t('device.detail.topology_info.topology_view')}
              value="map"
              disabled={!isQpu}
            />
            <Tab label={t('device.detail.topology_info.chart_view')} value="graph" />
            <Tab label={t('device.detail.topology_info.table_view')} value="table" />
          </Tabs>
          <Spacer className="h-6" />
          {activeTab === 'map' && isQpu && <TopologyView deviceInfo={parsedDeviceInfo} />}
          {activeTab === 'graph' && <ChartView deviceInfo={parsedDeviceInfo} />}
          {activeTab === 'table' && <TableView deviceInfo={parsedDeviceInfo} />}
        </>
      ) : (
        showDeviceInfoError && (
          <p className={clsx('text-error', 'text-xl')}>
            {t('device.detail.topology_info.invalid_device_info')}
          </p>
        )
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
