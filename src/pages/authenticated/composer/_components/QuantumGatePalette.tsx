import clsx from 'clsx';
import './Composer.css';
import QuantumGatePaletteItem from './QuantumGatePaletteItem';
import { useContext, useEffect, useState } from 'react';
import { circuitContext } from '../circuit';
import { isGateMultiQubitByDefault } from '../gates';

export default () => {
  const circuitService = useContext(circuitContext);
  const [mode, setMode] = useState(circuitService.mode);

  useEffect(() => circuitService.onModeChange(setMode), []);

  return (
    <div className={clsx(['flex gap-1'])}>
      {circuitService.supportedGates.map((gateTag) => (
        <QuantumGatePaletteItem
          gateTag={gateTag}
          key={gateTag}
          disabled={
            mode !== 'normal' ||
            (circuitService.circuit.length < 2 && isGateMultiQubitByDefault(gateTag))
          }
        />
      ))}
      <div
        className={clsx([
          ['flex', 'items-center', 'justify-center'],
          ['w-10', 'h-10', 'rounded'],
          ['cursor-pointer'],
          ['border', 'border-gate-operation-border'],
          mode == 'eraser' ? ['bg-gate-operation-enabled'] : [],
        ])}
        onClick={() => circuitService.toggleMode('eraser')}
      >
        <img className="p-2" src={`/img/composer/eraser.svg`} />
      </div>
    </div>
  );
};
