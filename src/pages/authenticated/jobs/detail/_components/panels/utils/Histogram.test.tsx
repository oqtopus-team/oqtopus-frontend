import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { Histogram } from './Histogram';

const apexChart = vi.hoisted(() => ({
  exportToCSV: vi.fn(),
  getSvgString: vi.fn().mockResolvedValue('<svg></svg>'),
  dataURI: vi.fn().mockResolvedValue({ imgURI: 'data:image/png;base64,image' }),
}));

vi.mock('react-apexcharts', () => ({
  default: ({ chartRef, options }: { chartRef: { current: unknown }; options: any }) => {
    chartRef.current = apexChart;
    const category = options.xaxis.categories[0];
    return (
      <div data-testid="histogram-chart">
        <span data-testid="axis-category">{options.xaxis.labels.formatter(category)}</span>
        <span
          data-testid="tooltip-category"
          dangerouslySetInnerHTML={{ __html: options.tooltip.x.formatter(category) }}
        />
        <span data-testid="toolbar-visible">{String(options.chart.toolbar.show)}</span>
      </div>
    );
  },
}));
vi.mock('react-i18next');

const mockUseTranslation = useTranslation as Mock;

describe('Histogram', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string, options?: { count?: number }) =>
        ({
          'job.detail.histogram.frequency': 'Frequency',
          'job.detail.histogram.total_count': 'Total count',
          'job.detail.histogram.observed_states': 'Observed states',
          'job.detail.histogram.displayed_states': 'Displayed states',
          'job.detail.histogram.displayed_coverage': 'Displayed coverage',
          'job.detail.histogram.top_states_note': `Showing the top ${options?.count} states by count.`,
          'job.detail.histogram.download_chart': 'Download chart',
          'job.detail.histogram.download_csv': 'Download CSV',
          'job.detail.histogram.download_svg': 'Download SVG',
          'job.detail.histogram.download_png': 'Download PNG',
        })[key] ?? key,
      i18n: { resolvedLanguage: 'en', language: 'en' },
    });
  });

  it('renders aggregate statistics and preserves the full state in the tooltip', () => {
    const state = `${'0'.repeat(512)}${'1'.repeat(512)}`;

    render(
      <Histogram
        categories={[state]}
        data={[845]}
        height={320}
        filename="sampling-job"
        statistics={{
          totalCount: 1000,
          observedStates: 25,
          displayedStates: 10,
          displayedCount: 845,
          coverage: 0.845,
        }}
      />
    );

    expect(screen.getByText('Total count')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('Observed states')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Displayed states')).toBeInTheDocument();
    expect(screen.getByText('10 / 25')).toBeInTheDocument();
    expect(screen.getByText('Displayed coverage')).toBeInTheDocument();
    expect(screen.getByText('84.5%')).toBeInTheDocument();
    expect(screen.getByText('Showing the top 10 states by count.')).toBeInTheDocument();
    expect(screen.getByTestId('axis-category')).toHaveTextContent('0000000000...1111111111');
    const tooltipCategory = screen.getByTestId('tooltip-category');
    expect(tooltipCategory).toHaveTextContent(state);
    expect(tooltipCategory.querySelectorAll('br')).toHaveLength(15);
    expect(screen.getByTestId('toolbar-visible')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    expect(apexChart.exportToCSV).toHaveBeenCalledWith({ fileName: 'sampling-job' });
  });
});
