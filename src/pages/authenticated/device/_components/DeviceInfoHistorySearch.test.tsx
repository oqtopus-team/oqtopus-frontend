import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceAPI } from '@/backend/hook';
import { Device, DeviceInfoHistoryEntry } from '@/domain/types/Device';
import { DeviceInfoHistorySearch } from './DeviceInfoHistorySearch';

vi.mock('@/backend/hook');
const toast = vi.hoisted(() => vi.fn());
vi.mock('react-toastify', () => ({ toast }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'device.detail.history.load_more' ? 'Click to load more...' : key),
    i18n: { language: 'en' },
  }),
}));
vi.mock('react-datepicker', () => ({ default: () => <input /> }));
vi.mock('@/pages/authenticated/_components/DateTimeFormatter', () => ({
  DateTimeFormatter: (_t: unknown, _i18n: unknown, value: string) => value,
  locales: {},
}));
vi.mock('react-infinite-scroll-component', () => ({
  default: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

const createHistory = (index: number): DeviceInfoHistoryEntry => ({
  historyId: `history-${index}`,
  deviceId: 'qulacs',
  calibratedAt: `2026-08-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
  nQubits: 16,
  nCouplings: 24,
});

const createHistoryResponse = (start: number, count: number, total: number) => ({
  items: Array.from({ length: count }, (_, index) => createHistory(start + index)),
  total,
  limit: 10,
  offset: start,
});

const devices: Device[] = [
  {
    id: 'qulacs',
    deviceType: 'simulator',
    status: 'available',
    nPendingJobs: 0,
    nQubits: 16,
    basisGates: [],
    supportedInstructions: [],
    deviceInfo: '{}',
    description: 'Qulacs',
  },
  {
    id: 'device-b',
    deviceType: 'QPU',
    status: 'available',
    nPendingJobs: 0,
    nQubits: 2,
    basisGates: [],
    supportedInstructions: [],
    deviceInfo: '{}',
    description: 'Device B',
  },
];

describe('DeviceInfoHistorySearch', () => {
  const getDeviceInfoHistory = vi.fn();
  const getDeviceHistory = vi.fn();

  beforeEach(() => {
    getDeviceInfoHistory.mockReset();
    getDeviceHistory.mockReset();
    toast.mockReset();
    vi.mocked(useDeviceAPI).mockReturnValue({
      getDeviceInfoHistory,
      getDeviceHistory,
    } as unknown as ReturnType<typeof useDeviceAPI>);
  });

  it('loads device histories in pages while more results are available', async () => {
    getDeviceInfoHistory
      .mockResolvedValueOnce(createHistoryResponse(0, 10, 12))
      .mockResolvedValueOnce(createHistoryResponse(10, 2, 12));

    render(
      <MemoryRouter>
        <DeviceInfoHistorySearch devices={[]} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('history-9')).toBeInTheDocument());
    expect(getDeviceInfoHistory).toHaveBeenNthCalledWith(1, {
      deviceId: undefined,
      from: undefined,
      to: undefined,
      limit: 10,
      offset: 0,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Click to load more...' }));

    await waitFor(() => expect(screen.getByText('history-11')).toBeInTheDocument());
    expect(getDeviceInfoHistory).toHaveBeenNthCalledWith(2, {
      deviceId: undefined,
      from: undefined,
      to: undefined,
      limit: 10,
      offset: 10,
    });
    expect(screen.queryByRole('button', { name: 'Click to load more...' })).not.toBeInTheDocument();
  });

  it('discards a pending page when the search filter changes', async () => {
    let resolvePendingPage: (value: ReturnType<typeof createHistoryResponse>) => void = () => {};
    const pendingPage = new Promise<ReturnType<typeof createHistoryResponse>>((resolve) => {
      resolvePendingPage = resolve;
    });
    getDeviceInfoHistory
      .mockResolvedValueOnce(createHistoryResponse(0, 10, 12))
      .mockReturnValueOnce(pendingPage)
      .mockResolvedValueOnce({
        ...createHistoryResponse(20, 1, 1),
        items: [{ ...createHistory(20), historyId: 'filtered-history', deviceId: 'device-b' }],
      });

    render(
      <MemoryRouter>
        <DeviceInfoHistorySearch devices={devices} />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Click to load more...' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'device-b' } });
    fireEvent.click(screen.getByRole('button', { name: 'job.list.search.button' }));

    expect(await screen.findByText('filtered-history')).toBeInTheDocument();
    resolvePendingPage(createHistoryResponse(10, 2, 12));

    await waitFor(() => expect(screen.queryByText('history-11')).not.toBeInTheDocument());
    expect(screen.getByText('filtered-history')).toBeInTheDocument();
  });

  it('shows an error and retries when loading histories fails', async () => {
    getDeviceInfoHistory
      .mockRejectedValueOnce(new Error('list failed'))
      .mockResolvedValueOnce(createHistoryResponse(0, 1, 1));

    render(
      <MemoryRouter>
        <DeviceInfoHistorySearch devices={[]} />
      </MemoryRouter>
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('device.detail.history.load_failed');
    fireEvent.click(screen.getByRole('button', { name: 'device.detail.history.retry' }));

    expect(await screen.findByText('history-0')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('notifies the user when downloading one history fails', async () => {
    getDeviceInfoHistory.mockResolvedValue(createHistoryResponse(0, 1, 1));
    getDeviceHistory.mockRejectedValue(new Error('download failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <DeviceInfoHistorySearch devices={[]} />
      </MemoryRouter>
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'device.detail.history.download_json' })
    );

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        'device.detail.history.download_failed',
        expect.any(Object)
      )
    );
    consoleError.mockRestore();
  });
});
