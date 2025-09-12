import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import ClipboardCopy from './utils/ClipboardCopy';
import QuantumCircuitCanvas, { staticCircuitProps } from '@/pages/authenticated/composer/_components/QuantumCircuitCanvas';
import { useEffect, useState } from 'react';
import { QuantumCircuit } from '@/pages/authenticated/composer/circuit';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Switch } from '@mui/material';

export interface JobDetailProgramProps {
  program: string[];
  heading?: string;
  maxHeight: number;
}

const isSentFromComposer = (program: string): boolean => {
  const trimmed = program.trim();
  return trimmed.startsWith("// Sent from OQTOPUS composer");
}
export const JobDetailProgram: React.FC<JobDetailProgramProps> = (
  jobInfo: JobDetailProgramProps
) => {
  const { t } = useTranslation();
  const text = jobInfo.program.join('\n');
  const sentFromComposer = isSentFromComposer(text);
  const [circuit, setCircuit] = useState<QuantumCircuit>({ qubitNumber: 0, steps: [] })
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (isSentFromComposer(text)) {
      const program = text.split("\n")[1];
      if (program.startsWith("//")) {
        const programJson = program.replace(/^\/\/\s*/, "");
        try {
          const parsed = JSON.parse(programJson);
          setCircuit(parsed);
        }
        catch (_) { }
      }
    }
  }, [text])

  return (
    <>
      <div className='flex items-center justify-between'>
        <h3 className={clsx('text-primary', 'font-bold')}>
          {jobInfo.heading != null ? jobInfo.heading : 'Program'}
        </h3>
        {sentFromComposer
          ? <div
            className='flex items-center'
          >
            <span
              className={clsx([
                ['text-primary', 'cursor-pointer', 'm-2']
              ])}
            >
              <img src="/img/common/icon-code.svg"
                width={32}
                height={32}
              />
            </span>
            <Switch
              value={showCode}
              onChange={() => setShowCode(!showCode)}
            />
            <span
              className={clsx([
                ['text-primary', 'cursor-pointer', 'm-2']
              ])}
            >
              <img src="/img/common/icon-quantum-circuit.svg"
                width={24}
                height={24}
              />
            </span>
          </div>
          : null
        }
      </div>
      <Spacer className="h-2" />
      {jobInfo.program === undefined || jobInfo.program === null || jobInfo.program.length === 0 ? (
        <div className={clsx('text-xs')}>{t('job.detail.program.nodata')}</div>
      ) : (
        <>
          {/* FIXME Far from an ideal solution... We REALLY do not need to put DndProvider here! */}
          { showCode ? (

              <DndProvider
                backend={HTML5Backend}
              >
                <QuantumCircuitCanvas
                  {...staticCircuitProps(circuit)}
                />
              </DndProvider>
            )
              : (
                <div className={clsx('relative')}>
                  <div className={clsx('p-3', 'rounded', 'bg-cmd-bg', 'text-sm')}>
                    <SimpleBar style={{ maxHeight: jobInfo.maxHeight }}>
                      <div className={clsx('whitespace-pre-wrap')}>{text}</div>
                    </SimpleBar>
                  </div>
                  <ClipboardCopy text={text} />
                </div>

              )

          }
        </>
      )}
    </>
  );
};
