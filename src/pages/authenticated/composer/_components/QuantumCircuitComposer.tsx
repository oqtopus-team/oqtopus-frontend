import QuantumCircuitCanvas from './QuantumCircuitCanvas';

import clsx from 'clsx';
import QuantumGatePalette from './QuantumGatePalette';
import { DndContextProvider } from '../dragging';

export interface QuantumCircuitComposerProps {
  fixedQubitNumber?: boolean;
}

export default (props: QuantumCircuitComposerProps) => {
  return (
    <div id="quantum-circuit-composer">
      <DndContextProvider>
        <div className={clsx([['w-full']])}>
          <QuantumGatePalette />
        </div>

        <QuantumCircuitCanvas static={false} fixedQubitNumber={props.fixedQubitNumber ?? false} />
      </DndContextProvider>
    </div>
  );
};
