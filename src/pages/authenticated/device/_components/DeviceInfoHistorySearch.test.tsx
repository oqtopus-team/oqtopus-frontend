import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceAPI } from '@/backend/hook';
import { DeviceInfoHistoryEntry } from '@/domain/types/Device';
import { DeviceInfoHistorySearch } from './DeviceInfoHistorySearch';

vi.mock('@/backend/hook');
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

describe('DeviceInfoHistorySearch', () => {
  const getDeviceInfoHistory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeviceAPI).mockReturnValue({
      getDeviceInfoHistory,
      getDeviceHistory: vi.fn(),
    } as unknown as ReturnType<typeof useDeviceAPI>);
  });

  it('loads device histories in pages while more results are available', async () => {
    getDeviceInfoHistory
      .mockResolvedValueOnce({
        items: Array.from({ length: 10 }, (_, index) => createHistory(index)),
        total: 12,
        limit: 10,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [createHistory(10), createHistory(11)],
        total: 12,
        limit: 10,
        offset: 10,
      });

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
});
