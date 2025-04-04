import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { JobsTranspileResult } from '@/api/generated';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { useTranslation } from 'react-i18next';
import CopyButton from './utils/copyButton'

interface Props {
  transpileResult?: JobsTranspileResult;
}

export const JobDetailTranspileResult: React.FC<Props> = ({ transpileResult }: Props) => {
  const { t } = useTranslation();

  // convert transpileResult to JSON to delete the specified key
  const targetJson = Object.fromEntries(
    Object.entries(transpileResult ?? {}).filter(([key, _]) => key !== 'transpiled_program')
  );
  const text = JSON.stringify(targetJson);

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className={clsx('text-primary', 'font-bold')}>Transpile Result</h3>
        <CopyButton text={text} />
      </div>
      <Spacer className="h-2" />
      {transpileResult ? (
        <JSONCodeBlock json={text} />
      ) : (
        <div className={clsx('text-xs')}>{t('job.detail.transpile_result.nodata')}</div>
      )}
    </>
  );
};
