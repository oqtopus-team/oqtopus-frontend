import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { JobsTranspileResult } from '@/api/generated';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { useTranslation } from 'react-i18next';

interface Props {
  transpileResult?: JobsTranspileResult;
}

export const JobDetailTranspileResult: React.FC<Props> = ({ transpileResult }: Props) => {
  const { t } = useTranslation();

  // convert transpileResult to JSON to delete the specified key
  const targetJson = Object.fromEntries(
    Object.entries(transpileResult ?? {}).filter(([key, _]) => key !== 'transpiled_program')
  );

  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>Transpile Result</h3>
      <Spacer className="h-2" />
      {transpileResult ? (
        <JSONCodeBlock json={JSON.stringify(targetJson)} />
      ) : (
        <div className={clsx('text-xs')}>{t('job.detail.transpile_result.nodata')}</div>
      )}
    </>
  );
};
