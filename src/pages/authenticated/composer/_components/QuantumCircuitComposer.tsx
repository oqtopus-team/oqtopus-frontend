import QuantumCircuitCanvas from './QuantumCircuitCanvas';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import clsx from 'clsx';
import QuantumGatePalette from './QuantumGatePalette';

export interface QuantumCircuitComposerProps {
  fixedQubitNumber?: boolean;
}
export default (props: QuantumCircuitComposerProps) => {
  return (
    <div id="quantum-circuit-composer">
      <DndProvider backend={HTML5Backend}>
        <div className={clsx([['w-full']])}>
          <QuantumGatePalette />
        </div>

        <QuantumCircuitCanvas static={false} fixedQubitNumber={props.fixedQubitNumber || false} />
      </DndProvider>
    </div>
  );
};
