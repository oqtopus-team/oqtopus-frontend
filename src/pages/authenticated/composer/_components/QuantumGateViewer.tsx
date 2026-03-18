import React, { useContext, useEffect, useState } from 'react';
import { circuitContext } from '../circuit';
import { RealComposerGate } from '../composer';
import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { Checkbox, FormControlLabel, Slider, Stack } from '@mui/material';
import { Input } from '@/pages/_components/Input';
import { useTranslation } from 'react-i18next';
import { isParametrizedGate } from '../gates';
import { Select } from '@/pages/_components/Select';

type QuantumGateViewerProps = {
  gateViewer: RealComposerGate | undefined;
  setGateViewer: (gv: RealComposerGate | undefined) => void;
};

export default function QuantumGateViewer({ gateViewer, setGateViewer }: QuantumGateViewerProps) {
  const { t } = useTranslation();
  const circuitService = useContext(circuitContext);

  const [availableQubits, setAvailableQubits] = useState(circuitService.circuit);

  useEffect(() => {
    return circuitService.onCircuitChange((c) => {
      setAvailableQubits(Array.from({ length: c.length }));
    });
  }, []);

  function updateControlsTargets() {}

  function renderRegularGateEditor() {
    if (!gateViewer || gateViewer._tag === 'barrier') return null;

    return (
      <Stack spacing={2}>
        {gateViewer.targets.map((target, idx) => (
          <Select
            key={idx}
            label={`${t('composer.gate_viewer.target_qubit')}(${idx + 1})`}
            value={target}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              let newTargets = [...gateViewer.targets];
              let newControls = [...gateViewer.controls];

              const newTarget = Number(e.target.value);
              if (newTarget === target) return;

              const sameQubitTargetIdx = gateViewer.targets.findIndex(
                (target) => target === newTarget
              );
              if (sameQubitTargetIdx !== -1) newTargets[sameQubitTargetIdx] = target;

              const sameQubitControlIdx = gateViewer.controls.findIndex(
                (control) => control === newTarget
              );
              if (sameQubitControlIdx !== -1) newControls[sameQubitControlIdx] = target;

              newTargets[idx] = newTarget;
              circuitService.updateControlsTargets(gateViewer, newTargets, newControls);
            }}
          >
            {availableQubits.map((_, qubitIdx) => (
              <option key={qubitIdx} value={qubitIdx}>
                {qubitIdx}
              </option>
            ))}
          </Select>
        ))}
        {gateViewer.controls.map((control, idx) => (
          <Select
            key={idx}
            label={`${t('composer.gate_viewer.control_qubit')}(${idx + 1})`}
            value={control}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              let newTargets = [...gateViewer.targets];
              let newControls = [...gateViewer.controls];

              const newControl = Number(e.target.value);
              if (newControl === control) return;

              const sameQubitTargetIdx = gateViewer.targets.findIndex(
                (target) => target === newControl
              );
              if (sameQubitTargetIdx !== -1) newTargets[sameQubitTargetIdx] = control;

              const sameQubitControlIdx = gateViewer.controls.findIndex(
                (control) => control === newControl
              );
              if (sameQubitControlIdx !== -1) newControls[sameQubitControlIdx] = control;

              newControls[idx] = newControl;
              circuitService.updateControlsTargets(gateViewer, newTargets, newControls);
            }}
          >
            {availableQubits.map((_, qubitIdx) => (
              <option key={qubitIdx} value={qubitIdx}>
                {qubitIdx}
              </option>
            ))}
          </Select>
        ))}
      </Stack>
    );
  }

  function renderBarrierContent() {
    if (!gateViewer || gateViewer._tag !== 'barrier') return null;

    return (
      <Stack>
        {circuitService.circuit.map((_, rowIdx) => (
          <FormControlLabel
            key={rowIdx}
            control={
              <Checkbox
                checked={gateViewer.targets.includes(rowIdx)}
                onChange={(e) => {
                  const targets = e.target.checked
                    ? [...gateViewer.targets, rowIdx]
                    : gateViewer.targets.filter((t) => t !== rowIdx);

                  if (targets.length === 0) return;

                  circuitService.updateControlsTargets(gateViewer, targets, gateViewer.controls);
                }}
              />
            }
            label={`q[${rowIdx}]`}
          />
        ))}
      </Stack>
    );
  }

  function renderParametrizedGateContent() {
    if (!gateViewer || !isParametrizedGate(gateViewer)) return null;

    return (
      <div className="w-full mt-5">
        <div className="grid grid-cols-12 gap-3 items-center justify-center">
          <div className="sm:col-span-12 col-span-12">{t('composer.gate_viewer.param')}</div>
          <div className="sm:col-span-8 col-span-12 px-3">
            <div className="flex flex-col">
              <Slider
                key="param-slider1"
                aria-label="θ"
                onChange={(ev, val) => {
                  circuitService.updateGateRotationAngle(gateViewer, val * Math.PI);
                }}
                value={gateViewer.rotationAngle / Math.PI}
                min={0}
                max={2}
                step={0.001}
              />
              <div className="flex w-full">
                <span className="mr-auto"> 0</span>
                <span className="ml-auto">2π</span>
              </div>
            </div>
          </div>
          <div className="sm:col-span-4 col-span-12 flex items-center">
            <Input
              type="number"
              max={2}
              min={0}
              step={0.001}
              value={gateViewer.rotationAngle / Math.PI}
              onChange={(ev) => {
                const value = Number(ev.target.value);
                if (isNaN(value)) return;
                circuitService.updateGateRotationAngle(gateViewer, value * Math.PI);
              }}
            />
            <span className="mx-2">π</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx([
        !!gateViewer ? ['min-w-[10rem]', 'w-[40%]', 'p-3'] : ['w-0', 'border-0'],
        ['relative', 'min-h-64', 'my-5'],
        ['transition-width'],
        ['overflow-auto', 'rounded'],
        ['border', 'border-neutral-content', 'rounded-sm'],
      ])}
    >
      {!!gateViewer ? (
        <div className="p-2 flex flex-col gap-5 h-full">
          <div className="w-full flex justify-center">
            <h1 className={clsx([['text-primary', 'font-bold', 'text-xl'], ['mb-3']])}>
              {t('composer.gate_viewer.title')}
            </h1>

            <div
              className="ml-auto cursor-pointer rounded-full "
              onClick={() => setGateViewer(undefined)}
            >
              <img src="/img/common/sidebar_arrow.svg" alt="" width="25" height="25" />
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-row gap-2 items-center">
              <span className="col-span-2">
                <div
                  className={clsx([
                    ['text-info-content', 'font-bold'],
                    gateViewer.hasBorder ? ['border', 'border-gate-operation-border'] : [],
                  ])}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: gateViewer.backgroundColor,
                  }}
                >
                  {gateViewer.palletteItem}
                </div>
              </span>
              <div className="col-span-6">
                <h2 className="font-bold text-base-content">{gateViewer.name}</h2>
              </div>
            </div>

            <Spacer className="h-6" />
            {renderRegularGateEditor()}
            {renderBarrierContent()}
            {renderParametrizedGateContent()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
