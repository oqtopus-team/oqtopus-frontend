import { useRef, useEffect, useState } from 'react';
import { Spacer } from '@/pages/_components/Spacer';
import downloadIcon from './icon/download_icon.svg';
import echarts from './setupEcharts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { ThemeOptions, useTheme } from '@/theme/useTheme';
import clsx from 'clsx';
import { Button } from '@/pages/_components/Button';

interface HistogramInfoProps {
  categories: string[];
  data: number[];
  height: number;
  filename: string;
}

const colors = {
  [ThemeOptions.LIGHT]: {
    chart: 'rgb(72, 135, 250)',
    text: 'rbg(45, 45, 45)',
    background: 'rgb(255, 255, 255)',
  },
  [ThemeOptions.DARK]: {
    chart: 'rgb(91, 155, 255)',
    text: 'rgb(230, 230, 230',
    background: 'rgb(30, 30, 30)',
  },
};

export const Histogram: React.FC<HistogramInfoProps> = (histogramInfo: HistogramInfoProps) => {
  const exportSectionRef = useRef<HTMLDivElement>(null);
  const echartsRef = useRef<ReactEchartsCore>(null);

  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    window.addEventListener('mousedown', hideExportOptionsIfClickedOutside);

    return () => {
      window.removeEventListener('mousedown', hideExportOptionsIfClickedOutside);
    };
  }, []);

  function hideExportOptionsIfClickedOutside(e: MouseEvent) {
    if (!exportSectionRef.current || !exportSectionRef.current.contains(e.target as HTMLElement)) {
      setExportOptionsOpen(false);
    }
  }

  function exportPNG() {
    const chart = echartsRef.current?.getEchartsInstance();
    if (!chart) return;

    const svgURL = chart.getDataURL({
      type: 'svg',
      pixelRatio: 1,
      excludeComponents: ['toolbox'],
    });

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')?.drawImage(img, 0, 0);

      const url = canvas.toDataURL('image/png');
      downloadFile(url, 'png');

      setExportOptionsOpen(false);
    };
    img.src = svgURL;
  }

  function exportSVG() {
    const chart = echartsRef.current?.getEchartsInstance();
    if (!chart) return;

    const url = chart.getDataURL({ type: 'svg', pixelRatio: 1, excludeComponents: ['toolbox'] });
    downloadFile(url, 'svg');

    setExportOptionsOpen(false);
  }

  function exportCSV() {
    const { data, categories } = histogramInfo;

    let csvString = 'category,Frequency';
    for (let i = 0; i < data.length; ++i) {
      csvString += `\n${categories[i]},${data[i]}`;
    }

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'csv');
    URL.revokeObjectURL(url);

    setExportOptionsOpen(false);
  }

  function downloadFile(url: string, extension: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${histogramInfo.filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const options = {
    color: [colors[theme].chart],
    backgroundColor: colors[theme].background,
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },

    xAxis: {
      type: 'category',
      data: histogramInfo.categories,
      axisLine: { show: true },
      axisTick: { show: false },
      position: 'bottom',
      axisLabel: { color: colors[theme].text },
    },

    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colors[theme].text },
    },
    series: [
      {
        name: 'Frequency',
        type: 'bar',
        data: histogramInfo.data,
        label: { show: false },
      },
    ],
    grid: {
      left: 20,
      right: 20,
      top: 20,
      bottom: 40,
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
        <div ref={exportSectionRef} className={clsx('relative', 'flex', 'justify-end')}>
          <img
            src={downloadIcon}
            className={clsx('max-w-12', 'cursor-pointer')}
            onClick={() => setExportOptionsOpen(!exportOptionsOpen)}
          />
          {exportOptionsOpen && (
            <div
              className={clsx(
                ['absolute', 'top-8', 'right-8'],
                ['flex', 'flex-col', 'justify-end', 'gap-1'],
                ['border', 'rounded', 'border-text'],
                'z-10',
                'bg-base-card'
              )}
            >
              <Button
                className={clsx('border-none', 'p2', 'hover:bg-neutral-content')}
                size="small"
                onClick={exportPNG}
              >
                Export PNG
              </Button>
              <Button
                className={clsx('border-none', 'p2', 'hover:bg-neutral-content')}
                size="small"
                onClick={exportSVG}
              >
                Export SVG
              </Button>
              <Button
                className={clsx('border-none', 'p2', 'hover:bg-neutral-content')}
                size="small"
                onClick={exportCSV}
              >
                Export CSV
              </Button>
            </div>
          )}
        </div>
        <Spacer className="h-2" />
        <ReactEchartsCore
          ref={echartsRef}
          echarts={echarts}
          option={options}
          style={{ width: '100%', height: `${histogramInfo.height}px` }}
        />
        <div id="html-dist"></div>
      </div>
    </>
  );
};
