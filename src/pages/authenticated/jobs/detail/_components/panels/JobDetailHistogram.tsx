import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { Histogram } from './utils/Histogram';
import { reshapeToHistogramInfo } from './utils/ReshapeToHistogramInfo';

interface countsProps {
  countsJson?: string;
  mitigationInfo?: { [key: string]: any };
  height: number;
  jobId: string;
}

export const JobDetailHistogram: React.FC<countsProps> = (counts: countsProps) => {
  const { t } = useTranslation();
  const histogramInfo = (() => {
    try {
      return reshapeToHistogramInfo(counts);
    } catch (error) {
      return null;
    }
  })();

  const hasMitigationInfo: boolean = counts.mitigationInfo
    ? Object.keys(counts.mitigationInfo).length > 0
    : false;
  const HistogramTitle: React.FC<{ hasMitigationInfo: boolean }> = ({ hasMitigationInfo }) => {
    if (hasMitigationInfo) {
      return (
        <>
          Histogram <span style={{ color: '#156082' }}> After </span> the mitigation
        </>
      );
    }
    return <>Histogram</>;
  };

  if (histogramInfo === null) {
    return (
      <>
        <h3 className={clsx('text-primary', 'font-bold')}>Histogram</h3>
        <div className={clsx('text-xs')}>{t('job.detail.histogram.nodata')}</div>
      </>
    );
  }

  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>
        <HistogramTitle hasMitigationInfo={hasMitigationInfo}></HistogramTitle>
      </h3>
      <Spacer className="h-2" />
      {histogramInfo.data.length === 0 ||
      histogramInfo.categories.length === 0 ||
      counts.countsJson == '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.histogram.nodata')}</div>
      ) : (
        <Histogram
          categories={histogramInfo.categories}
          data={histogramInfo.data}
          height={histogramInfo.height}
          filename={counts.jobId}
        ></Histogram>
      )}
    </>
  );
};
