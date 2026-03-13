import React, { useContext, useEffect, useState, useMemo } from 'react';
import { circuitContext } from '../circuit';
import { RealComposerGate, createComposerGate } from '../composer';
import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { Checkbox, FormControlLabel, Slider, Stack } from '@mui/material';
import { Input } from '@/pages/_components/Input';
import { useTranslation } from 'react-i18next';
import { isParametrizedGate, isCustomGate } from '../gates';
import { Select } from '@/pages/_components/Select';
import { collectAllGatesFromCustomGate, GateDefinition } from '../custom_gates';
import { gateRenderingBlockMap, GateColor} from '../gates_rendering/Gates';
import { cellSize, gateBlockSize, cellBlockDiff} from '../gates_rendering/constants';

type QuantumGateViewerProps = {
  gateViewer: RealComposerGate | undefined;
  setGateViewer: (gv: RealComposerGate | undefined) => void;
};

const StandardGate = ({ 
  gateDef, 
  tag, 
  customTag 
}: { 
  gateDef: any; 
  tag: string; 
  customTag?: string;
}) => {
  const bgColor = gateDef?.backgroundColor || GateColor.GATE_ATOMIC;
  const hasBorder = gateDef?.hasBorder || false;
  const isCustom = tag === '$custom_gate';

  let content: React.ReactNode;

  if (tag === '$custom_gate') {
    content = <span>{customTag?.slice(0, 3) || 'C'}</span>;
  } else {
    content = gateDef?.palletteItem || <span>{tag.toUpperCase()}</span>;
  }

  return (
    <div
      className={clsx([
        'text-info-content',
        hasBorder ? ['border', 'border-gate-operation-border'] : [],
      ])}
      style={{
        width: gateBlockSize,
        height: gateBlockSize,
        borderRadius: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        userSelect: 'none',
      }}
    >
      {content}
    </div>
  );
};

const MiniCircuitPreview = ({ 
  definition, 
  gates 
}: { 
  definition: GateDefinition; 
  gates: RealComposerGate[] 
}) => {
  const OFFSET_X = 20;
  const OFFSET_Y = 20;

  const maxCol = gates.length > 0 ? Math.max(...gates.map(g => g.column)) + 1 : 1;
  const width = Math.max(maxCol * cellSize + OFFSET_X * 2, 200);
  const height = definition.params.length * cellSize + OFFSET_Y * 2;

  return (
    <div 
      className="overflow-x-auto border border-neutral-content rounded-sm bg-base-100 w-full relative"
      style={{ minHeight: Math.min(height, 300) }}
    >
      <div style={{ width, height, position: 'relative' }} className="mx-auto">
        
        <svg 
          width={width} 
          height={height} 
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        >
          {definition.params.map((paramName, idx) => {
            const y = idx * cellSize + OFFSET_Y + (cellSize / 2); 
            return (
              <g key={idx}>
                <text x={5} y={y - 10} fontSize="10" fill="currentColor" className="text-base-content opacity-60">
                  {paramName}
                </text>
                <line 
                  x1={OFFSET_X} y1={y} x2={width} y2={y} 
                  className="stroke-base-content opacity-20" 
                  strokeWidth="1" 
                />
              </g>
            );
          })}
        </svg>

        {gates.map((g, i) => {
          const gateDef = gateRenderingBlockMap[g._tag as keyof typeof gateRenderingBlockMap];
          
          const left = g.column * cellSize + OFFSET_X;
          const minRow = Math.min(...g.targets, ...g.controls);
          const topBase = minRow * cellSize + OFFSET_Y;
          const currentCustomTag = g._tag === '$custom_gate' ? g.customTag : undefined;

          let GateComponent: React.ReactNode = null;

          const topOffset = cellBlockDiff / 2;

          if (g._tag === 'barrier') {
            const maxRow = Math.max(...g.targets);
            const barrierHeight = (maxRow - minRow + 1) * cellSize;
            GateComponent = (
               <div 
                 style={{ height: barrierHeight }} 
                 className="w-full border-l-2 border-dashed border-base-content/50 mx-auto" 
               />
            );
          } else if (gateDef && 'renderComposerItem' in gateDef) {

            GateComponent = gateDef.renderComposerItem({
              targets: g.targets,
              controls: g.controls,
              styles: '',
              isSettingControl: false,
              customTag: currentCustomTag
            });
          } else {
            GateComponent = (
              <StandardGate 
                gateDef={gateDef} 
                tag={g._tag} 
                customTag={currentCustomTag} 
              />
            );
          }

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: left,
                top: topBase + topOffset,
                width: cellSize,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              {GateComponent}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function QuantumGateViewer({ gateViewer, setGateViewer }: QuantumGateViewerProps) {
  const { t } = useTranslation();
  const circuitService = useContext(circuitContext);

  const [availableQubits, setAvailableQubits] = useState(circuitService.circuit);

const { customGateDef, previewGates } = useMemo(() => {
    if (!gateViewer || !isCustomGate(gateViewer)) {
      return { customGateDef: null, previewGates: [] };
    }
    const def = circuitService.customGates[gateViewer.customTag];
    if (!def) return { customGateDef: null, previewGates: [] };

    const dummyTargets = def.params.map((_, i) => i);
    const dummyParent = {
      ...createComposerGate('$custom_gate', 0, 0),
      targets: dummyTargets,
      customTag: def.name,
      _tag: '$custom_gate' as const
    };

    const gates = collectAllGatesFromCustomGate(dummyParent as any, def);
    return { customGateDef: def, previewGates: gates };
  }, [gateViewer, circuitService.customGates]);

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

function renderCustomGateContent() {
    if (!gateViewer || !isCustomGate(gateViewer) || !customGateDef) return null;

    return (
      <div className="w-full mt-5">
        <div className="text-base-content mb-2">
          Internal Structure
        </div>
        <MiniCircuitPreview 
          definition={customGateDef} 
          gates={previewGates} 
        />
        <p className="text-xs text-base-content/50 mt-1 text-right">
           Preview
        </p>
      </div>
    );
  }

  const gateDef = gateViewer ? gateRenderingBlockMap[gateViewer._tag as keyof typeof gateRenderingBlockMap] : undefined;
  
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
                    gateDef?.hasBorder ? ['border', 'border-gate-operation-border'] : [],
                  ])}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: gateDef?.backgroundColor || 'transparent',
                  }}
                >
                  {gateDef?.palletteItem|| (
                     <span>
                       {gateViewer._tag === '$custom_gate' 
                         ? (gateViewer.customTag?.slice(0,3) || 'C') 
                         : gateDef?.label}
                     </span>
                  )}
                </div>
              </span>
              <div className="col-span-6">
                <h2 className="font-bold text-base-content">
                  {gateViewer._tag === '$custom_gate' 
                    ? (gateViewer.customTag || gateDef?.name) 
                    : gateDef?.name}
                </h2>
              </div>
            </div>

            <Spacer className="h-6" />
            {renderRegularGateEditor()}
            {renderBarrierContent()}
            {renderParametrizedGateContent()}
            {renderCustomGateContent()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
