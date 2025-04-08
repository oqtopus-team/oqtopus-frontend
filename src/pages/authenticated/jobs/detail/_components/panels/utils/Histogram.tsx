import ReactApexChart from 'react-apexcharts';
import { Spacer } from '@/pages/_components/Spacer';
import downloadIcon from './icon/download_icon.png';
import './histogram.css';

interface HistogramInfoProps {
  categories: string[];
  data: number[];
  height: number;
  filename: string;
}

export const Histogram: React.FC<HistogramInfoProps> = (histogramInfo: HistogramInfoProps) => {
  const state = {
    series: [
      {
        name: 'Frequency',
        data: histogramInfo.data,
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: true,
          offsetY: histogramInfo.height * -0.05,
          tools: {
            download: `<img src="${downloadIcon}">`,
          },
          export: {
            csv: {
              filename: histogramInfo.filename,
            },
            svg: {
              filename: histogramInfo.filename,
            },
            png: {
              filename: histogramInfo.filename,
            },
          },
        },
      },
      tooltip: {
        enabled: true,
        marker: {
          show: false,
        },
      },
      plotOptions: {},
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: histogramInfo.categories,
        position: 'bottom',
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
          <p>Input is invalid.</p>
        </div>
        <div id="html-dist"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Spacer className="h-2" />
        <ReactApexChart
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
