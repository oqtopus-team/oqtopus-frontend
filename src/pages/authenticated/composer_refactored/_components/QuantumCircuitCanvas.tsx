import { useContext, useEffect, useRef, useState } from 'react';
import { circuitContext } from '../circuit';
import clsx from 'clsx';
import QuantumCircuitGateCell from './QuantumCircuitGateCell';
import { isDummyGate, RealComposerGate } from '../composer';
import { Button } from '@/pages/_components/Button';
import { RxCopy } from 'react-icons/rx';
import { FaObjectGroup, FaObjectUngroup } from 'react-icons/fa';
import QuantumGateViewer from './QuantumGateViewer';
import { CustomGateModal } from './CustomGateModal';
import { cellSize } from '../gates_rendering/constants';

export const staticCircuitProps = (): Props => ({
  fixedQubitNumber: true,
  static: true,
});

interface Props {
  fixedQubitNumber: boolean;
  static: boolean;
}

export default (props: Props) => {
  const circuitService = useContext(circuitContext);
  const circuitGridRef = useRef<HTMLDivElement>(null);

  const [qubitNumber, setQubitNumber] = useState(circuitService.circuit.length);
  const [circuitDepth, setCircuitDepth] = useState(circuitService.circuit[0]?.length ?? 0);
  const [circuit, setCircuit] = useState(circuitService.circuit);

  const [selectedGates, setSelectedGates] = useState<RealComposerGate[]>(
    circuitService.selectedGates
  );
  const [gateViewer, setGateViewer] = useState<RealComposerGate | undefined>(
    selectedGates.length === 1 ? selectedGates[1] : undefined
  );
  const [mode, setMode] = useState(circuitService.mode);
  const [isCustomGateModalOpen, setIsCustomGateModalOpen] = useState(false);

  useEffect(() => {
    return circuitService.onCircuitChange((c) => {
      setQubitNumber(c.length);
      setCircuitDepth(c[0]?.length ?? 0);
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

  // useEffect(() => {
  //   if (holdingControlQuit === false) {
  //     props.toggleMode("normal")();
  //   } else {
  //     if (props.mode !== "control") {
  //       props.toggleMode("control")();
  //     }
  //   }
  // }, [holdingControlQuit]);

  // const handleQubitClick = (qIndex: number) => {
  //   const wire = composedProgram[qIndex];
  //   if (props.mode === "eraser") {
  //     if (wire.every((g) => g === undefined || g._tag === "$dummy")) {
  //       handleComposedProgramUpdated(
  //         [...composedProgram.slice(0, qIndex), ...composedProgram.slice(qIndex + 1)],
  //         composedProgram.length - 1
  //       );
  //     }
  //   }
  // };

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
                {circuit.map((circuitRow, row) => (
                  <div
                    className={clsx([
                      ['h-[64px]', 'w-8'],
                      ['flex', 'justify-center', 'items-center'],
                    ])}
                    key={row}
                    onClick={() => circuitService.removeEmptyQubit(row)}
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
                  <div
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
                  </div>
                ) : null}
              </div>
              <div className={clsx([['relative', 'h-full', 'w-full']])}>
                <div
                  ref={circuitGridRef}
                  style={{
                    gridTemplateRows: `repeat(${qubitNumber}, ${cellSize}px)`,
                    gridTemplateColumns: `repeat(${circuitDepth}, ${cellSize}px)`,
                  }}
                  className={clsx([
                    ['absolute', 'top-0', 'left-0', 'm-5'],
                    ['grid', 'grid-flow'],
                    ['w-full'],
                    ['transition-all', 'duration-300'],
                  ])}
                >
                  {circuit.map((circuitRow, row) => {
                    return circuitRow.map((gate, column) => {
                      return (
                        <div
                          className={clsx(['relative', 'w-full', 'h-full'])}
                          key={`cell-q${row}-t${column}`}
                          style={{ zIndex: !isDummyGate(gate) ? '1' : '0' }}
                        >
                          <div
                            className={clsx([
                              'absolute',
                              'top-0',
                              'left-0',
                              'w-full',
                              'h-full',
                              'z-20',
                              'flex',
                              'items-center',
                              'justify-center',
                            ])}
                          >
                            <QuantumCircuitGateCell
                              gate={gate}
                              row={row}
                              column={column}
                              circuitGrid={circuitGridRef}
                              static={props.static}
                              selected={selectedGates.some((g) => g.id === gate.id)}
                              key={`q${row}-t${column}`}
                            />
                          </div>
                          <div
                            className={clsx([
                              ['absolute', 'top-0', 'left-0'],
                              ['z-10'],
                              ['w-full', 'h-full'],
                              ['flex', 'justify-center', 'items-center'],
                            ])}
                          >
                            <div className={clsx([['w-full', 'h-1'], ['bg-neutral-content']])} />
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            </div>
            <div>
              <div></div>
            </div>
          </div>
          {!circuitService.isObservableCircuit && (
            <QuantumGateViewer gateViewer={gateViewer} setGateViewer={setGateViewer} />
          )}
        </div>
        {!circuitService.isObservableCircuit && (
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
                Duplicate
              </div>
            </Button>
            <Button
              color={canGroupGates ? 'secondary' : 'disabled'}
              disabled={!canGroupGates}
              style={{ marginBottom: '1.25rem' }}
              onClick={() => setIsCustomGateModalOpen(true)}
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
                Group
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
                Ungroup
              </div>
            </Button>
          </div>
        )}
      </div>
      <CustomGateModal isOpen={isCustomGateModalOpen} setIsOpen={setIsCustomGateModalOpen} />
    </>
  );
};
