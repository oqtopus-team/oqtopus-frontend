import { useRef, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Spacer } from '@/pages/_components/Spacer';
import downloadIcon from './icon/download_icon.svg';

interface HistogramInfoProps {
  categories: string[];
  data: number[];
  height: number;
  filename: string;
}

export const Histogram: React.FC<HistogramInfoProps> = (histogramInfo: HistogramInfoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
          offsetX: width * -0.015,
          offsetY: histogramInfo.height * -0.05,
          tools: {
            download: `<img src="${downloadIcon}" style="max-width: 5vw; height: 5vh;">`,
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
      <div ref={containerRef}>
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
