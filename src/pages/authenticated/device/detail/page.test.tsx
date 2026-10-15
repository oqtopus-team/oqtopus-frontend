import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceAPI } from '@/backend/hook';
import { Device } from '@/domain/types/Device';
import DeviceDetailPage from './page';

vi.mock('@/backend/hook');
vi.mock('@/pages/_hooks/title', () => ({ useDocumentTitle: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./_components/DeviceDetailBasicInfo', () => ({
  DeviceDetailBasicInfo: () => <div data-testid="device-basic-info" />,
}));
vi.mock('./_components/TopologyInfo', () => ({
  TopologyInfo: () => <div data-testid="topology-info" />,
}));

const device: Device = {
  id: 'device-a',
  deviceType: 'QPU',
  status: 'available',
  nPendingJobs: 0,
  nQubits: 2,
  basisGates: [],
  supportedInstructions: [],
  deviceInfo: '{"qubits":[]}',
  description: 'Device A',
};

const renderPage = (path: string): void => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/device/:id" element={<DeviceDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('DeviceDetailPage', () => {
  const getDevice = vi.fn();
  const getDeviceHistory = vi.fn();
  const getDeviceHistoryAtRuntime = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeviceAPI).mockReturnValue({
      getDevice,
      getDeviceHistory,
      getDeviceHistoryAtRuntime,
    } as unknown as ReturnType<typeof useDeviceAPI>);
  });

  it('shows not found instead of current device data when history loading fails', async () => {
    getDevice.mockResolvedValue(device);
    getDeviceHistory.mockRejectedValue(new Error('history unavailable'));

    renderPage('/device/device-a?deviceHistoryId=missing-history');

    expect(await screen.findByText('device.detail.not_found')).toBeInTheDocument();
    expect(screen.queryByTestId('device-basic-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('topology-info')).not.toBeInTheDocument();
  });

  it('rejects a history that belongs to another device', async () => {
    getDevice.mockResolvedValue(device);
    getDeviceHistory.mockResolvedValue({
      historyId: 'history-b',
      deviceId: 'device-b',
      calibratedAt: '2026-10-15T00:00:00Z',
      nQubits: 4,
      nCouplings: 3,
      deviceInfo: '{"qubits":[]}',
    });

    renderPage('/device/device-a?deviceHistoryId=history-b');

    expect(await screen.findByText('device.detail.not_found')).toBeInTheDocument();
    expect(screen.queryByTestId('device-basic-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('topology-info')).not.toBeInTheDocument();
  });
});
