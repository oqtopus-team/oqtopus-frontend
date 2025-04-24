import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import 'simplebar-react/dist/simplebar.min.css';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import ClipboardCopy from './utils/ClipboardCopy';

export interface ExpectationProps {
  expectationValue?: number;
}

function GenerateText(expectationValue?: number) {
  if (expectationValue) {
    const latexText: string = `\\( \\langle \\mathscr{O} \\rangle = ${expectationValue} \\)`;
    return latexText;
  } else {
    return '';
  }
}

export const JobDetailExpectation: React.FC<ExpectationProps> = (estimation: ExpectationProps) => {
  const { t } = useTranslation();
  const config = {
    loader: { load: ['input/asciimath'] },
  };
  const text = GenerateText(estimation.expectationValue);

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className={clsx('text-primary', 'font-bold')}>Expectation value</h3>
      </div>
      <Spacer className="h-2" />
      {text === '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.expectation.nodata')}</div>
      ) : (
        <div className={clsx('relative')}>
          <div
            className={clsx(['p-3', 'rounded', 'bg-cmd-bg'], ['text-xs', 'whitespace-pre-line'])}
          >
            <MathJaxContext config={config}>
              <MathJax>{text}</MathJax>
            </MathJaxContext>
          </div>
          <ClipboardCopy text={`${estimation.expectationValue}`} />
        </div>
      )}
    </>
  );
};
