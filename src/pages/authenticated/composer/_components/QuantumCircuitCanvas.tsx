import { useContext, useEffect, useRef, useState } from 'react';
import { circuitContext } from '../circuit';
import clsx from 'clsx';
import QuantumCircuitGateCell from './QuantumCircuitGateCell';
import { RealComposerGate } from '../composer';
import { Button } from '@/pages/_components/Button';
import { RxCopy } from 'react-icons/rx';
import { FaObjectGroup, FaObjectUngroup } from 'react-icons/fa';
import QuantumGateViewer from './QuantumGateViewer';
import { CustomGateModal } from './CustomGateModal';
import { cellSize } from '../gates_rendering/constants';
import { useTranslation } from 'react-i18next';

export const staticCircuitProps = (): Props => ({
  fixedQubitNumber: true,
  static: true,
});

interface Props {
  fixedQubitNumber: boolean;
  static: boolean;
}

export default (props: Props) => {
  const { t } = useTranslation();
  const circuitService = useContext(circuitContext);
  const circuitGridRef = useRef<HTMLDivElement>(null);

  const [qubitNumber, setQubitNumber] = useState(circuitService.circuit.length);
  const [circuit, setCircuit] = useState(circuitService.circuit);

  const [selectedGates, setSelectedGates] = useState<RealComposerGate[]>(
    circuitService.selectedGates
  );
  const [gateViewer, setGateViewer] = useState<RealComposerGate | undefined>(
    selectedGates.length === 1 ? selectedGates[1] : undefined
  );
  const [mode, setMode] = useState(circuitService.mode);

  useEffect(() => {
    return circuitService.onCircuitChange((c) => {
      setQubitNumber(c.length);
      setCircuit(c);
    });
  }, []);

  useEffect(() => circuitService.onModeChange(setMode), []);

  useEffect(() => {
    return circuitService.onSelectedGatesChange((gates) => {
      setSelectedGates(gates);
      if (!circuitService.isObservableCircuit) {
        setGateViewer(gates.length === 1 ? gates[0] : undefined);
      }
    });
  }, []);

  useEffect(() => {
    const circuitGrid = circuitGridRef.current;
    if (!circuitGrid) return;

    const abortController = new AbortController();

    circuitGrid.addEventListener(
      'mousemove',
      (e) => {
        if (circuitService.mode !== 'control') return;
        if (!circuitGridRef.current) return;

        const gate = circuitService.selectedGates[0];
        const gridStartY = circuitGridRef.current.getBoundingClientRect().y;
        let currentRow = Math.floor((e.clientY - gridStartY) / cellSize);

        if (currentRow < 0 || currentRow >= circuitService.circuit.length) return;

        if (gate.controls.some((c) => c === currentRow)) return;
        if (gate.targets.some((t) => t === currentRow)) return;

        let newTargets = [...gate.targets];
        let newControls = gate.controls.map((c, idx) =>
          idx === circuitService.controlModeProgress ? currentRow : c
        );

        circuitService.updateControlsTargets(gate, newTargets, newControls);
      },
      { signal: abortController.signal }
    );

    return () => {
      abortController.abort();
    };
  }, []);

  const canGroupGates = circuitService.selectedGates.length >= 2;
  const canUngroupGates = circuitService.selectedGates.some((g) => g._tag === '$custom_gate');

  return (
    <>
      <div>
        <div className={clsx([['flex'], [!gateViewer ? 'gap-0' : 'gap-3']])}>
          <div
            className={clsx([
              ['relative', 'min-h-64', 'my-5'],
              ['transition-all'],
              !gateViewer ? ['w-full'] : ['w-[calc(60%-24px)]'],
              ['overflow-auto'],
              ['border', 'border-neutral-content', 'rounded-sm'],
            ])}
          >
            <div className={clsx([['flex']])}>
              <div className={clsx([['py-5', 'pl-2']])}>
                {props.fixedQubitNumber === false ? (
                  <button
                    className={clsx([
                      ['h-8', 'w-8'],
                      ['flex', 'justify-center', 'items-center'],
                      ['rounded-full', 'bg-neutral-content', 'text-primary-content'],
                      ['hover:bg-primary', 'disabled:bg-neutral-content'],
                      ['cursor-pointer', 'disabled:cursor-default'],
                    ])}
                    disabled={qubitNumber <= 1}
                    onClick={() => circuitService.removeQubit()}
                  >
                    <span>-</span>
                  </button>
                ) : null}
                {circuit.map((circuitRow, row) => (
                  <div
                    className={clsx([
                      ['h-[64px]', 'w-8'],
                      ['flex', 'justify-center', 'items-center'],
                    ])}
                    key={row}
                    onClick={() => mode === 'eraser' && circuitService.removeEmptyQubit(row)}
                  >
                    <span
                      className={clsx([
                        mode === 'eraser'
                          ? circuitRow.every((x) => x === undefined || x._tag == 'emptyCell')
                            ? ['text-neutral-content hover:text-status-job-failed']
                            : ['text-disable-bg']
                          : [],
                      ])}
                    >
                      q{row}
                    </span>
                  </div>
                ))}
                {props.fixedQubitNumber === false ? (
                  <button
                    className={clsx([
                      ['h-8', 'w-8'],
                      ['flex', 'justify-center', 'items-center'],
                      ['rounded-full', 'bg-neutral-content', 'text-primary-content'],
                      ['hover:bg-primary'],
                      ['cursor-pointer'],
                    ])}
                    onClick={() => circuitService.addQubit()}
                  >
                    <span>+</span>
                  </button>
                ) : null}
              </div>
              <div className={clsx([['relative', 'h-full', 'w-full']])}>
                <div
                  ref={circuitGridRef}
                  className={clsx([
                    ['absolute', 'top-0', 'left-0', 'w-auto', 'm-5', 'mt-[52px]'],
                    ['transition-all', 'duration-300'],
                  ])}
                  style={{
                    display: 'table',
                    borderCollapse: 'collapse',
                  }}
                >
                  {circuit.map((circuitRow, row) => (
                    <div
                      key={`row-q${row}`}
                      style={{
                        display: 'table-row',
                        position: 'relative',
                        minHeight: `${cellSize}px`,
                        height: `${cellSize}px`,
                        width: '100%',
                      }}
                    >
                      {circuitRow.map((gate, column) => (
                        <QuantumCircuitGateCell
                          key={`cell-q${row}-t${column}`}
                          gate={gate}
                          row={row}
                          column={column}
                          static={props.static}
                          selected={selectedGates.some((g) => g.id === gate.id)}
                        />
                      ))}
                      <div
                        className={clsx([
                          ['absolute', 'top-0', 'left-0'],
                          ['pointer-events-none'],
                          ['w-full', 'h-full'],
                          ['flex', 'justify-center', 'items-center'],
                        ])}
                      >
                        <div className={clsx([['w-full', 'h-1'], ['bg-neutral-content']])} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {!circuitService.isObservableCircuit && !props.static && (
            <QuantumGateViewer gateViewer={gateViewer} setGateViewer={setGateViewer} />
          )}
        </div>
        {!circuitService.isObservableCircuit && !props.static && (
          <div className={clsx('flex', 'flex-row', 'gap-2')}>
            <Button
              color="secondary"
              style={{ marginBottom: '1.25rem' }}
              onClick={() => circuitService.duplicateSelectedGates()}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <RxCopy />
                {t('composer.actions.duplicate')}
              </div>
            </Button>
            <Button
              color={canGroupGates ? 'secondary' : 'disabled'}
              disabled={!canGroupGates}
              style={{ marginBottom: '1.25rem' }}
              onClick={() => {
                circuitService.isCustomGateModalOpen = true;
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <FaObjectGroup />
                {t('composer.actions.group')}
              </div>
            </Button>
            <Button
              color={canUngroupGates ? 'secondary' : 'disabled'}
              disabled={!canUngroupGates}
              style={{ marginBottom: '1.25rem' }}
              onClick={() => circuitService.ungroupSelectedGates()}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <FaObjectUngroup />
                {t('composer.actions.ungroup')}
              </div>
            </Button>
          </div>
        )}
      </div>
      <CustomGateModal />
    </>
  );
};
