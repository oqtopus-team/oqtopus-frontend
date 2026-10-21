import { useRef } from 'react';
import type ApexCharts from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import { BsDownload } from 'react-icons/bs';
import { Spacer } from '@/pages/_components/Spacer';
import {
  formatHistogramCategory,
  formatHistogramTooltipCategory,
  type HistogramStatistics,
} from './ReshapeToHistogramInfo';

interface HistogramInfoProps {
  categories: string[];
  data: number[];
  height: number;
  filename: string;
  statistics: HistogramStatistics;
}

export const Histogram: React.FC<HistogramInfoProps> = (histogramInfo: HistogramInfoProps) => {
  const { t, i18n } = useTranslation();
  const chartRef = useRef<ApexCharts | null>(null);
  const exportMenuRef = useRef<HTMLDetailsElement>(null);
  const numberFormatter = new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language);
  const percentageFormatter = new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language, {
    style: 'percent',
    maximumFractionDigits: 1,
  });

  const triggerDownload = (href: string, extension: string, revokeUrl: boolean = false) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = `${histogramInfo.filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (revokeUrl) {
      URL.revokeObjectURL(href);
    }
  };

  const exportChart = async (format: 'csv' | 'svg' | 'png') => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    try {
      if (format === 'csv') {
        chart.exportToCSV({ fileName: histogramInfo.filename });
      } else if (format === 'svg') {
        const svg = await chart.getSvgString();
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
        triggerDownload(url, 'svg', true);
      } else {
        const image = await chart.dataURI();
        if ('blob' in image) {
          const url = URL.createObjectURL(image.blob);
          triggerDownload(url, 'png', true);
        } else {
          triggerDownload(image.imgURI, 'png');
        }
      }
    } finally {
      if (exportMenuRef.current) {
        exportMenuRef.current.open = false;
      }
    }
  };

  const state = {
    series: [
      {
        name: t('job.detail.histogram.frequency'),
        data: histogramInfo.data,
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        marker: {
          show: false,
        },
        x: {
          formatter: (value: string) => formatHistogramTooltipCategory(value),
        },
      },
      plotOptions: {},
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: histogramInfo.categories,
        position: 'bottom',
        labels: {
          formatter: (value: string) => formatHistogramCategory(value),
        },
        axisBorder: {
          show: true,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
    },
  };

  if (histogramInfo.data.length === 0 || histogramInfo.categories.length === 0) {
    return (
      <div>
        <div id="chart">
          <p>{t('job.detail.histogram.nodata')}</p>
        </div>
        <div id="html-dist"></div>
      </div>
    );
  }

  return (
    <>
      <details ref={exportMenuRef} className="absolute right-0 top-0 z-10">
        <summary
          className="flex size-8 cursor-pointer list-none items-center justify-center rounded border border-base-content/20 bg-base-card text-primary [&::-webkit-details-marker]:hidden"
          aria-label={t('job.detail.histogram.download_chart')}
          title={t('job.detail.histogram.download_chart')}
        >
          <BsDownload aria-hidden="true" />
        </summary>
        <ul className="absolute right-0 mt-1 w-32 border border-base-content/20 bg-base-card py-1 text-sm shadow-md">
          {(['csv', 'svg', 'png'] as const).map((format) => (
            <li key={format}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-base-content/5"
                onClick={() => void exportChart(format)}
              >
                {t(`job.detail.histogram.download_${format}`)}
              </button>
            </li>
          ))}
        </ul>
      </details>
      <div>
        <Spacer className="h-2" />
        {histogramInfo.statistics.observedStates > histogramInfo.statistics.displayedStates && (
          <p className="mb-2 text-xs text-base-content/60">
            {t('job.detail.histogram.top_states_note', {
              count: histogramInfo.statistics.displayedStates,
            })}
          </p>
        )}
        <dl className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-base-content/10 py-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-base-content/60">
              {t('job.detail.histogram.total_count')}
            </dt>
            <dd className="font-semibold tabular-nums">
              {numberFormatter.format(histogramInfo.statistics.totalCount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/60">
              {t('job.detail.histogram.observed_states')}
            </dt>
            <dd className="font-semibold tabular-nums">
              {numberFormatter.format(histogramInfo.statistics.observedStates)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/60">
              {t('job.detail.histogram.displayed_states')}
            </dt>
            <dd className="font-semibold tabular-nums">
              {numberFormatter.format(histogramInfo.statistics.displayedStates)} /{' '}
              {numberFormatter.format(histogramInfo.statistics.observedStates)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/60">
              {t('job.detail.histogram.displayed_coverage')}
            </dt>
            <dd className="font-semibold tabular-nums">
              {percentageFormatter.format(histogramInfo.statistics.coverage)}
            </dd>
          </div>
        </dl>
        <ReactApexChart
          chartRef={chartRef}
          series={state.series}
          options={state.options}
          type="bar"
          height={histogramInfo.height}
        />
        <div id="html-dist"></div>
      </div>
    </>
  );
};
