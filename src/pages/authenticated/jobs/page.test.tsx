import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import JobListPage from './page';
import { useJobAPI } from '@/backend/hook';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { Job, JobStatusType } from '@/domain/types/Job';

vi.mock('@/backend/hook');
vi.mock('react-i18next');
vi.mock('@/pages/_hooks/title');
vi.mock('react-infinite-scroll-component', () => ({
  default: ({ children, next, hasMore, loader }: any) => (
    <div data-testid="infinite-scroll">
      {children}
      {hasMore && (
        <div data-testid="load-more" onClick={next}>
          {loader}
        </div>
      )}
    </div>
  ),
}));
vi.mock('./_components/JobListItem', () => ({
  JobListItem: ({ job, onJobSelectionChange, selectedJobs }: any) => (
    <tr data-testid={`job-item-${job.id}`}>
      <td>
        <input
          type="checkbox"
          data-testid={`job-checkbox-${job.id}`}
          checked={selectedJobs.some((j: Job) => j.id === job.id)}
          onChange={(e) => onJobSelectionChange(job, e.target.checked)}
        />
      </td>
      <td>{job.id}</td>
      <td>{job.name}</td>
      <td>{job.deviceId}</td>
      <td>{job.status}</td>
      <td>{job.submittedAt}</td>
      <td>Operations</td>
    </tr>
  ),
}));
vi.mock('./_components/JobSearchForm', () => ({
  JobSearchForm: ({ params, setParams, onSubmit }: any) => (
    <div data-testid="job-search-form">
      <input
        data-testid="search-query"
        value={params.query || ''}
        onChange={(e) => setParams({ ...params, query: e.target.value })}
        placeholder="Search jobs..."
      />
      <select
        data-testid="search-status"
        value={params.status || ''}
        onChange={(e) => setParams({ ...params, status: e.target.value })}
      >
        <option value="">All statuses</option>
        <option value="submitted">Submitted</option>
        <option value="running">Running</option>
        <option value="succeeded">Succeeded</option>
        <option value="failed">Failed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button data-testid="search-submit" onClick={onSubmit}>
        Search
      </button>
    </div>
  ),
}));
vi.mock('@/pages/_components/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));
vi.mock('@/pages/_components/Button', () => ({
  Button: ({ children, onClick, disabled, color, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-color={color}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('@/pages/_components/Spacer', () => ({
  Spacer: ({ className }: any) => <div data-testid="spacer" className={className} />,
}));
vi.mock('@/pages/_components/Loader', () => ({
  Loader: ({ size, color }: any) => (
    <div data-testid="loader" data-size={size} data-color={color}>
      Loading...
    </div>
  ),
}));
vi.mock('@/pages/_components/ConfirmModal', () => ({
  ConfirmModal: ({ show, onHide, title, message, onConfirm }: any) =>
    show ? (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button data-testid="modal-confirm" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="modal-cancel" onClick={onHide}>
          Cancel
        </button>
      </div>
    ) : null,
}));

const mockUseJobAPI = useJobAPI as Mock;
const mockUseTranslation = useTranslation as Mock;
const mockUseDocumentTitle = useDocumentTitle as Mock;

const mockJobs: Job[] = [
  {
    id: 'job-1',
    name: 'Test Job 1',
    description: 'Test description 1',
    jobInfo: {} as any,
    jobType: 'sampling',
    shots: 1000,
    status: 'submitted' as JobStatusType,
    deviceId: 'device-1',
    submittedAt: '2024-01-01T00:00:00Z',
    readyAt: '',
    runningAt: '',
    endedAt: '',
    executionTime: 0,
  },
  {
    id: 'job-2',
    name: 'Test Job 2',
    description: 'Test description 2',
    jobInfo: {} as any,
    jobType: 'estimation',
    shots: 2000,
    status: 'running' as JobStatusType,
    deviceId: 'device-2',
    submittedAt: '2024-01-02T00:00:00Z',
    readyAt: '2024-01-02T01:00:00Z',
    runningAt: '2024-01-02T02:00:00Z',
    endedAt: '',
    executionTime: 0,
  },
  {
    id: 'job-3',
    name: 'Test Job 3',
    description: 'Test description 3',
    jobInfo: {} as any,
    jobType: 'sampling',
    shots: 1500,
    status: 'succeeded' as JobStatusType,
    deviceId: 'device-1',
    submittedAt: '2024-01-03T00:00:00Z',
    readyAt: '2024-01-03T01:00:00Z',
    runningAt: '2024-01-03T02:00:00Z',
    endedAt: '2024-01-03T03:00:00Z',
    executionTime: 3600,
  },
];

const mockTranslation = {
  t: vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'job.list.title': 'Job List',
      'job.detail.reload': 'Reload',
      'job.list.register_button': 'Register Job',
      'job.list.delete_selected': 'Delete Selected',
      'job.list.cancel_selected': 'Cancel Selected',
      'job.list.table.id': 'ID',
      'job.list.table.name': 'Name',
      'job.list.table.device': 'Device',
      'job.list.table.status': 'Status',
      'job.list.table.date': 'Date',
      'job.list.table.operation': 'Operation',
      'job.list.nodata': 'No jobs found',
      'job.list.modal.title': 'Confirm Action',
      'job.list.modal.bulk_delete': 'Are you sure you want to delete selected jobs?',
      'job.list.modal.cancel': 'Are you sure you want to cancel selected jobs?',
      'job.list.cancel_in_progress': 'Cancelling jobs...',
      'job.list.delete_in_progress': 'Deleting jobs...',
    };
    return translations[key] || key;
  }),
};

describe('JobListPage', () => {
  const mockGetLatestJobs = vi.fn();
  const mockDeleteJob = vi.fn();
  const mockCancelJob = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslation.mockReturnValue(mockTranslation);
    mockUseDocumentTitle.mockReturnValue(undefined);
    mockUseJobAPI.mockReturnValue({
      getLatestJobs: mockGetLatestJobs,
      deleteJob: mockDeleteJob,
      cancelJob: mockCancelJob,
    });

    mockGetLatestJobs.mockResolvedValue(mockJobs);
  });

  const renderComponent = (initialEntries = ['/jobs']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <JobListPage />
      </MemoryRouter>
    );
  };

  describe('Component Rendering', () => {
    it('renders the job list page with title', async () => {
      renderComponent();

      expect(screen.getByText('Job List')).toBeInTheDocument();
      expect(mockUseDocumentTitle).toHaveBeenCalledWith('Job List');
    });

    it('renders the register job button', () => {
      renderComponent();

      const registerButton = screen.getByText('Register Job');
      expect(registerButton).toBeInTheDocument();
    });

    it('renders the search form', () => {
      renderComponent();

      expect(screen.getByTestId('job-search-form')).toBeInTheDocument();
      expect(screen.getByTestId('search-query')).toBeInTheDocument();
      expect(screen.getByTestId('search-status')).toBeInTheDocument();
    });

    it('renders the job table headers', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Device')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Operation')).toBeInTheDocument();
      });
    });

    it('renders bulk action buttons', () => {
      renderComponent();

      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      expect(screen.getByText('Cancel Selected')).toBeInTheDocument();
    });
  });

  describe('Job Loading and Display', () => {
    it('loads and displays jobs on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledWith(1, 10, {});
      });

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
        expect(screen.getByTestId('job-item-job-2')).toBeInTheDocument();
        expect(screen.getByTestId('job-item-job-3')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      renderComponent();

      const loaders = screen.getAllByTestId('loader');
      expect(loaders.length).toBeGreaterThan(0);
      expect(loaders[0]).toBeInTheDocument();
    });

    it('shows no data message when no jobs are returned', async () => {
      mockGetLatestJobs.mockResolvedValue([]);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No jobs found')).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetLatestJobs.mockRejectedValue(new Error('API Error'));

      renderComponent();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Search Functionality', () => {
    it('updates search parameters and triggers search', async () => {
      renderComponent();

      const searchInput = screen.getByTestId('search-query');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledWith(1, 10, { query: 'test query' });
      });
    });

    it('filters jobs by status', async () => {
      renderComponent();

      const statusSelect = screen.getByTestId('search-status');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(statusSelect, { target: { value: 'running' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledWith(1, 10, { status: 'running' });
      });
    });

    it('combines query and status filters', async () => {
      renderComponent();

      const searchInput = screen.getByTestId('search-query');
      const statusSelect = screen.getByTestId('search-status');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.change(statusSelect, { target: { value: 'submitted' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledWith(1, 10, {
          query: 'test',
          status: 'submitted',
        });
      });
    });

    it('filters jobs by job ID in client-side filtering', async () => {
      const jobsWithDifferentIds = [
        { ...mockJobs[0], id: 'job-123', name: 'Different Name', description: 'Different Description' },
        { ...mockJobs[1], id: 'job-456', name: 'Another Name', description: 'Another Description' },
        { ...mockJobs[2], id: 'job-789', name: 'Third Name', description: 'Third Description' },
      ];

      mockGetLatestJobs.mockResolvedValue(jobsWithDifferentIds);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-123')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-query');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-123')).toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-456')).not.toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-789')).not.toBeInTheDocument();
      });
    });

    it('filters jobs by job name in client-side filtering', async () => {
      const jobsWithDifferentNames = [
        { ...mockJobs[0], id: 'job-1', name: 'Machine Learning Job', description: 'ML Description' },
        { ...mockJobs[1], id: 'job-2', name: 'Data Processing Job', description: 'DP Description' },
        { ...mockJobs[2], id: 'job-3', name: 'Analysis Job', description: 'Analysis Description' },
      ];

      mockGetLatestJobs.mockResolvedValue(jobsWithDifferentNames);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-query');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: 'Machine Learning' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-3')).not.toBeInTheDocument();
      });
    });

    it('filters jobs by job description in client-side filtering', async () => {
      const jobsWithDifferentDescriptions = [
        { ...mockJobs[0], id: 'job-1', name: 'Job One', description: 'This job processes quantum algorithms' },
        { ...mockJobs[1], id: 'job-2', name: 'Job Two', description: 'This job analyzes classical data' },
        { ...mockJobs[2], id: 'job-3', name: 'Job Three', description: 'This job runs simulations' },
      ];

      mockGetLatestJobs.mockResolvedValue(jobsWithDifferentDescriptions);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-query');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: 'quantum algorithms' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-3')).not.toBeInTheDocument();
      });
    });

    // TODO: Remove .skip after removing search sensitivity on the backend
    it.skip('shows all jobs when search query matches multiple fields', async () => {
      const jobsWithMatchingFields = [
        { ...mockJobs[0], id: 'test-job-1', name: 'Regular Job', description: 'Regular description' },
        { ...mockJobs[1], id: 'job-2', name: 'Test Job Name', description: 'Regular description' },
        { ...mockJobs[2], id: 'job-3', name: 'Regular Job', description: 'This is a test description' },
      ];

      mockGetLatestJobs.mockResolvedValue(jobsWithMatchingFields);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-test-job-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-query');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('job-item-test-job-1')).toBeInTheDocument();
        expect(screen.getByTestId('job-item-job-2')).toBeInTheDocument();
        expect(screen.getByTestId('job-item-job-3')).toBeInTheDocument();
      });
    });

    it('shows no jobs when search query matches no fields', async () => {
      mockGetLatestJobs.mockResolvedValue(mockJobs);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-query');
      const submitButton = screen.getByTestId('search-submit');

      fireEvent.change(searchInput, { target: { value: 'nonexistent-search-term' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('job-item-job-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('job-item-job-3')).not.toBeInTheDocument();
      });
    });
  });

  describe('URL Parameters', () => {
    it('initializes with URL search parameters', async () => {
      renderComponent(['/jobs?status=running&query=test']);

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledWith(1, 10, {
          status: 'running',
          query: 'test',
        });
      });
    });
  });

  describe('Job Selection', () => {
    it('allows selecting individual jobs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('allows selecting all jobs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0];
      fireEvent.click(selectAllCheckbox);

      expect(selectAllCheckbox).toBeChecked();
    });

    it('updates bulk action button states based on selection', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete Selected');
      const cancelButton = screen.getByText('Cancel Selected');

      expect(deleteButton).toHaveAttribute('data-color', 'disabled');
      expect(cancelButton).toHaveAttribute('data-color', 'disabled');

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(deleteButton).toHaveAttribute('data-color', 'error');
        expect(cancelButton).toHaveAttribute('data-color', 'secondary');
      });
    });
  });

  describe('Bulk Operations', () => {
    it('shows delete confirmation modal', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete selected jobs?')).toBeInTheDocument();
    });

    it('shows cancel confirmation modal', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const cancelButton = screen.getByText('Cancel Selected');
      fireEvent.click(cancelButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to cancel selected jobs?')).toBeInTheDocument();
    });

    it('performs bulk delete operation', async () => {
      mockDeleteJob.mockResolvedValue({ success: true });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteJob).toHaveBeenCalledWith(mockJobs[0]);
      });
    });

    it('performs bulk cancel operation', async () => {
      mockCancelJob.mockResolvedValue({ success: true });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const cancelButton = screen.getByText('Cancel Selected');
      fireEvent.click(cancelButton);

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockCancelJob).toHaveBeenCalledWith(mockJobs[0]);
      });
    });

    it('disables cancel button for non-cancelable jobs', async () => {
      const nonCancelableJobs = [
        { ...mockJobs[0], status: 'succeeded' as JobStatusType },
        { ...mockJobs[1], status: 'failed' as JobStatusType },
      ];
      mockGetLatestJobs.mockResolvedValue(nonCancelableJobs);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const cancelButton = screen.getByText('Cancel Selected');
      expect(cancelButton).toHaveAttribute('data-color', 'disabled');
    });
  });

  describe('Infinite Scroll', () => {
    it('loads more jobs when scrolling', async () => {
      const firstPageJobs = Array.from({ length: 10 }, (_, i) => ({
        ...mockJobs[0],
        id: `job-${i + 1}`,
        name: `Test Job ${i + 1}`,
      }));
      const secondPageJobs = [mockJobs[2]];

      mockGetLatestJobs
        .mockResolvedValueOnce(firstPageJobs)
        .mockResolvedValueOnce(secondPageJobs);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('load-more')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByTestId('load-more');
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledTimes(2);
        expect(mockGetLatestJobs).toHaveBeenNthCalledWith(2, 2, 10, {});
      });
    });

    it('stops loading when no more jobs available', async () => {
      const smallJobList = [mockJobs[0]];
      mockGetLatestJobs.mockResolvedValue(smallJobList);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Reload Functionality', () => {
    it('reloads jobs when reload button is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledTimes(1);
      });

      const reloadButton = screen.getByTitle('Reload');
      fireEvent.click(reloadButton);

      await waitFor(() => {
        expect(mockGetLatestJobs).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles delete job errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockDeleteJob.mockRejectedValue(new Error('Delete failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('handles cancel job errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCancelJob.mockRejectedValue(new Error('Cancel failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const cancelButton = screen.getByText('Cancel Selected');
      fireEvent.click(cancelButton);

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('shows bulk delete loading state', async () => {
      mockDeleteJob.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      expect(screen.getByText('Deleting jobs...')).toBeInTheDocument();
    });

    it('shows bulk cancel loading state', async () => {
      mockCancelJob.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('job-item-job-1')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('job-checkbox-job-1');
      fireEvent.click(checkbox);

      const cancelButton = screen.getByText('Cancel Selected');
      fireEvent.click(cancelButton);

      const confirmButton = screen.getByTestId('modal-confirm');
      fireEvent.click(confirmButton);

      expect(screen.getByText('Cancelling jobs...')).toBeInTheDocument();
    });
  });
});
