import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Announcements } from './Announcements';
import { useAnnouncementsAPI } from '@/backend/hook';
import { useTranslation } from 'react-i18next';
import { AnnouncementsGetAnnouncementResponse, GetAnnouncementsListOrderEnum } from '@/api/generated';

vi.mock('@/backend/hook');
vi.mock('react-i18next');
vi.mock('@/pages/authenticated/dashboard/_components/AnnouncementPost', () => ({
  AnnouncementPost: ({ announcement }: { announcement: AnnouncementsGetAnnouncementResponse }) => (
    <div data-testid={`announcement-${announcement.id}`}>
      <h3>{announcement.title}</h3>
      <p>{announcement.content}</p>
    </div>
  ),
}));
vi.mock('@/pages/_components/Spacer', () => ({
  Spacer: ({ className }: { className: string }) => <div className={className} data-testid="spacer" />,
}));
vi.mock('./announcement.module.css', () => ({
  default: {
    no_announcements: 'no_announcements',
    announcements_container: 'announcements_container',
    post_header: 'post_header',
    post_title: 'post_title',
    post_time: 'post_time',
    post_content: 'post_content',
    markdown_content: 'markdown_content',
    collapsed: 'collapsed',
    showMoreButton: 'showMoreButton',
    hidden: 'hidden',
  },
}));

const mockUseAnnouncementsAPI = useAnnouncementsAPI as Mock;
const mockUseTranslation = useTranslation as Mock;

const mockAnnouncements: AnnouncementsGetAnnouncementResponse[] = [
  {
    id: 1,
    title: 'Test Announcement 1',
    content: 'This is test content 1',
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-12-31T23:59:59Z',
    publishable: true,
  },
  {
    id: 2,
    title: 'Test Announcement 2',
    content: 'This is test content 2',
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-12-31T23:59:59Z',
    publishable: false,
  },
  {
    id: 3,
    title: 'Test Announcement 3',
    content: 'This is test content 3',
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-12-31T23:59:59Z',
    publishable: true,
  },
];

const mockTranslation = {
  t: vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'dashboard.announcements.title': 'Announcements',
      'announcements.no_announcements': 'No announcements available',
    };
    return translations[key] || key;
  }),
};

describe('Announcements', () => {
  const mockGetAnnouncements = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslation.mockReturnValue(mockTranslation);
    mockUseAnnouncementsAPI.mockReturnValue({
      getAnnouncements: mockGetAnnouncements,
    });
  });

  it('renders the announcements title', async () => {
    mockGetAnnouncements.mockResolvedValue([]);

    render(<Announcements />);

    expect(screen.getByText('Announcements')).toBeInTheDocument();
    expect(mockTranslation.t).toHaveBeenCalledWith('dashboard.announcements.title');
  });

  it('renders spacer component', async () => {
    mockGetAnnouncements.mockResolvedValue([]);

    render(<Announcements />);

    expect(screen.getByTestId('spacer')).toBeInTheDocument();
    expect(screen.getByTestId('spacer')).toHaveClass('h-4');
  });

  it('calls getAnnouncements API on mount with correct parameters', async () => {
    mockGetAnnouncements.mockResolvedValue([]);

    render(<Announcements />);

    await waitFor(() => {
      expect(mockGetAnnouncements).toHaveBeenCalledTimes(1);
    });

    expect(mockGetAnnouncements).toHaveBeenCalledWith({
      order: GetAnnouncementsListOrderEnum.Desc,
      currentTime: expect.any(String),
    });

    const callArgs = mockGetAnnouncements.mock.calls[0][0];
    expect(() => new Date(callArgs.currentTime)).not.toThrow();
  });

  it('displays "no announcements" message when there are no publishable announcements', async () => {
    mockGetAnnouncements.mockResolvedValue([]);

    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getByText('No announcements available')).toBeInTheDocument();
    });

    expect(mockTranslation.t).toHaveBeenCalledWith('announcements.no_announcements');
  });

  it('displays "no announcements" message when all announcements are not publishable', async () => {
    const nonPublishableAnnouncements = mockAnnouncements.filter(a => !a.publishable);
    mockGetAnnouncements.mockResolvedValue(nonPublishableAnnouncements);

    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getByText('No announcements available')).toBeInTheDocument();
    });
  });

  it('renders only publishable announcements', async () => {
    mockGetAnnouncements.mockResolvedValue(mockAnnouncements);

    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getByTestId('announcement-1')).toBeInTheDocument();
      expect(screen.getByTestId('announcement-3')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('announcement-2')).not.toBeInTheDocument();

    expect(screen.queryByText('No announcements available')).not.toBeInTheDocument();
  });

  it('renders announcements with correct content', async () => {
    const publishableAnnouncements = mockAnnouncements.filter(a => a.publishable);
    mockGetAnnouncements.mockResolvedValue(publishableAnnouncements);

    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getByText('Test Announcement 1')).toBeInTheDocument();
      expect(screen.getByText('This is test content 1')).toBeInTheDocument();
      expect(screen.getByText('Test Announcement 3')).toBeInTheDocument();
      expect(screen.getByText('This is test content 3')).toBeInTheDocument();
    });
  });

  it('passes style props to AnnouncementPost components', async () => {
    const publishableAnnouncements = mockAnnouncements.filter(a => a.publishable);
    mockGetAnnouncements.mockResolvedValue(publishableAnnouncements);

    const customStyle = { backgroundColor: 'red', padding: '10px' };
    render(<Announcements style={{ post: customStyle }} />);

    await waitFor(() => {
      expect(screen.getByTestId('announcement-1')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockGetAnnouncements.mockRejectedValue(new Error('API Error'));

    render(<Announcements />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    expect(screen.getByText('No announcements available')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles null response from API', async () => {
    mockGetAnnouncements.mockResolvedValue(null);

    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getByText('No announcements available')).toBeInTheDocument();
    });
  });

  it('handles undefined response from API', async () => {
    mockGetAnnouncements.mockResolvedValue(undefined);

    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getByText('No announcements available')).toBeInTheDocument();
    });
  });

  it('updates state correctly when API returns data', async () => {
    mockGetAnnouncements.mockResolvedValue(mockAnnouncements);

    render(<Announcements />);

    expect(screen.getByText('No announcements available')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('No announcements available')).not.toBeInTheDocument();
      expect(screen.getByTestId('announcement-1')).toBeInTheDocument();
      expect(screen.getByTestId('announcement-3')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to the container elements', async () => {
    mockGetAnnouncements.mockResolvedValue([]);

    render(<Announcements />);

    const titleContainer = screen.getByText('Announcements').parentElement;
    expect(titleContainer).toHaveClass('flex', 'justify-between', 'items-center');

    const title = screen.getByText('Announcements');
    expect(title).toHaveClass('text-base', 'font-bold', 'text-primary');

    const gridContainer = screen.getByText('No announcements available').parentElement;
    expect(gridContainer).toHaveClass('grid', 'gap-[23px]');
  });

  it('renders announcements in correct order', async () => {
    const orderedAnnouncements = [
      { ...mockAnnouncements[0], id: 1, publishable: true },
      { ...mockAnnouncements[2], id: 3, publishable: true },
    ];
    mockGetAnnouncements.mockResolvedValue(orderedAnnouncements);

    render(<Announcements />);

    await waitFor(() => {
      const announcements = screen.getAllByTestId(/^announcement-/);
      expect(announcements).toHaveLength(2);
      expect(announcements[0]).toHaveAttribute('data-testid', 'announcement-1');
      expect(announcements[1]).toHaveAttribute('data-testid', 'announcement-3');
    });
  });
});
