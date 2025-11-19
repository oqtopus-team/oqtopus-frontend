import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DeviceList } from './DeviceList';
import { Device } from '@/domain/types/Device';
import { BrowserRouter } from 'react-router';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.device.title': 'Devices',
        'dashboard.device.button': 'View All Devices',
        'dashboard.device.table.name': 'Name',
        'dashboard.device.table.status': 'Status',
        'dashboard.device.table.qubits': 'Qubits',
        'dashboard.device.table.type': 'Type',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock useDeviceAPI hook
const mockGetDevices = vi.fn();
vi.mock('@/backend/hook', () => ({
  useDeviceAPI: () => ({
    getDevices: mockGetDevices,
  }),
}));

// Mock Button component
vi.mock('@/pages/_components/Button', () => ({
  Button: ({ children, href, ...props }: any) => (
    <a href={href} data-testid="button" {...props}>
      {children}
    </a>
  ),
}));

// Mock DeviceStatus component
vi.mock('@/pages/authenticated/device/_components/DeviceStatus', () => ({
  DeviceStatus: ({ status }: { status: string }) => (
    <span data-testid="device-status">{status}</span>
  ),
}));

// Mock Spacer component
vi.mock('@/pages/_components/Spacer', () => ({
  Spacer: ({ className }: { className?: string }) => (
    <div data-testid="spacer" className={className} />
  ),
}));

// Mock clsx
vi.mock('clsx', () => ({
  default: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockDevices: Device[] = [
  {
    id: 'device-1',
    deviceType: 'QPU' as any,
    status: 'AVAILABLE' as any,
    availableAt: '2024-01-01T00:00:00Z',
    nPendingJobs: 0,
    nQubits: 5,
    basisGates: ['x', 'y', 'z'],
    supportedInstructions: ['measure', 'reset'],
    deviceInfo: 'Test device 1',
    calibratedAt: '2024-01-01T00:00:00Z',
    description: 'Test quantum device 1',
  },
  {
    id: 'device-2',
    deviceType: 'SIMULATOR' as any,
    status: 'MAINTENANCE' as any,
    availableAt: '2024-01-02T00:00:00Z',
    nPendingJobs: 3,
    nQubits: 10,
    basisGates: ['h', 'cnot'],
    supportedInstructions: ['measure'],
    deviceInfo: 'Test device 2',
    calibratedAt: '2024-01-02T00:00:00Z',
    description: 'Test quantum simulator',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DeviceList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDevices.mockResolvedValue([]);
  });

  it('renders the component with title and button', async () => {
    renderWithRouter(<DeviceList />);

    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('View All Devices')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toHaveAttribute('href', '/device');
  });

  it('renders table headers correctly', async () => {
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Qubits')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });
  });

  it('renders spacer component', async () => {
    renderWithRouter(<DeviceList />);

    expect(screen.getByTestId('spacer')).toBeInTheDocument();
    expect(screen.getByTestId('spacer')).toHaveClass('h-3');
  });

  it('calls getDevices on component mount', async () => {
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      expect(mockGetDevices).toHaveBeenCalledTimes(1);
    });
  });

  it('renders empty table when no devices are returned', async () => {
    mockGetDevices.mockResolvedValue([]);
    
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      expect(mockGetDevices).toHaveBeenCalled();
    });

    // Check that table body exists but has no rows
    const tbody = screen.getByRole('table').querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    expect(tbody?.children).toHaveLength(0);
  });

  it('renders devices in table when devices are returned', async () => {
    mockGetDevices.mockResolvedValue(mockDevices);
    
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      expect(screen.getByText('device-1')).toBeInTheDocument();
      expect(screen.getByText('device-2')).toBeInTheDocument();
    });

    // Check device 1 data
    expect(screen.getByText('device-1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('QPU')).toBeInTheDocument();

    // Check device 2 data
    expect(screen.getByText('device-2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('SIMULATOR')).toBeInTheDocument();
  });

  it('renders device status components correctly', async () => {
    mockGetDevices.mockResolvedValue(mockDevices);
    
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      const statusComponents = screen.getAllByTestId('device-status');
      expect(statusComponents).toHaveLength(2);
      expect(statusComponents[0]).toHaveTextContent('AVAILABLE');
      expect(statusComponents[1]).toHaveTextContent('MAINTENANCE');
    });
  });

  it('renders navigation links for device names', async () => {
    mockGetDevices.mockResolvedValue(mockDevices);
    
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      const deviceLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.startsWith('/device/')
      );
      expect(deviceLinks).toHaveLength(2);
      expect(deviceLinks[0]).toHaveAttribute('href', '/device/device-1');
      expect(deviceLinks[1]).toHaveAttribute('href', '/device/device-2');
    });
  });

  it('applies correct CSS classes to device name links', async () => {
    mockGetDevices.mockResolvedValue(mockDevices);
    
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      const deviceLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.startsWith('/device/')
      );
      deviceLinks.forEach(link => {
        expect(link).toHaveClass('text-link');
      });
    });
  });

  it('renders correct table structure with proper CSS classes', async () => {
    renderWithRouter(<DeviceList />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full', '[&_td]:whitespace-normal');

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    expect(thead).toBeInTheDocument();
    expect(tbody).toBeInTheDocument();
  });

  it('renders devices with all required table data', async () => {
    mockGetDevices.mockResolvedValue([mockDevices[0]]);
    
    renderWithRouter(<DeviceList />);

    await waitFor(() => {
      // Check that all table cells are rendered for the device
      const tableRows = screen.getByRole('table').querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(1);
      
      const tableCells = tableRows[0].querySelectorAll('td');
      expect(tableCells).toHaveLength(4); // name, status, qubits, type
    });
  });
});