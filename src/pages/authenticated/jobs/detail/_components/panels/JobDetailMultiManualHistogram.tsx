import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { Histogram } from './utils/Histogram';
import { reshapeToHistogramInfo, type HistogramStatistics } from './utils/ReshapeToHistogramInfo';

interface countsProps {
  combinedCircuitKey: string;
  pullDownKey: string;
  combinedCircuitCountsJson: string;
  dividedCircuitCountsJson: string;
  heading?: string;
  height: number;
  jobId: string;
}

interface HistogramInfo {
  categories: string[];
  data: number[];
  height: number;
  statistics: HistogramStatistics;
  countsJson?: string;
  circuitTitle?: string;
}

export const JobDetailMultiManualHistogram: React.FC<countsProps> = ({
  combinedCircuitKey,
  pullDownKey,
  combinedCircuitCountsJson,
  dividedCircuitCountsJson,
  heading,
  height,
  jobId,
}) => {
  const { t } = useTranslation();

  const getHistogramData = (): HistogramInfo => {
    try {
      const countsJsonValue: string | undefined = (() => {
        if (pullDownKey === combinedCircuitKey) {
          if (combinedCircuitCountsJson) {
            return combinedCircuitCountsJson;
          }
        } else {
          if (!dividedCircuitCountsJson) {
            return;
          }
          const parsedDivided = JSON.parse(dividedCircuitCountsJson || '{}');
          if (parsedDivided[pullDownKey] !== undefined) {
            return JSON.stringify(parsedDivided[pullDownKey]);
          }
          console.warn(`Key '${pullDownKey}' not found in dividedCircuitCountsJson`);
        }
        return;
      })();

      const countsForHistogram = {
        countsJson: countsJsonValue,
        height: height,
      };

      return {
        countsJson: countsJsonValue,
        ...reshapeToHistogramInfo(countsForHistogram),
        circuitTitle: pullDownKey === combinedCircuitKey ? 'combined' : `index_${pullDownKey}`,
      };
    } catch (error) {
      console.error('Failed to get histogram data:', error);
      return {
        categories: [],
        data: [],
        height: height,
        statistics: {
          totalCount: 0,
          observedStates: 0,
          displayedStates: 0,
          displayedCount: 0,
          coverage: 0,
        },
        countsJson: '',
      };
    }
  };

  const histogramInfo = useMemo(
    () => getHistogramData(),
    [combinedCircuitCountsJson, combinedCircuitKey, dividedCircuitCountsJson, height, pullDownKey]
  );

  return (
    <div className="relative">
      <h3 className={clsx('pr-10', 'text-primary', 'font-bold')}>
        {heading != null ? heading : 'Histogram'}
      </h3>
      <Spacer className="h-2" />
      {/* histogram */}
      {histogramInfo.data.length === 0 ||
      histogramInfo.categories.length === 0 ||
      histogramInfo.countsJson === '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.histogram.nodata')}</div>
      ) : (
        <Histogram
          categories={histogramInfo.categories}
          data={histogramInfo.data}
          height={histogramInfo.height}
          filename={`${jobId}_${histogramInfo.circuitTitle}`}
          statistics={histogramInfo.statistics}
        />
      )}
    </div>
  );
};
