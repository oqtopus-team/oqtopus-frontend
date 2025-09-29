import { useContext, useEffect, useRef } from 'react';
import QuantumCircuitCanvas from './QuantumCircuitCanvas';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import clsx from 'clsx';
import QuantumGatePalette from './QuantumGatePalette';
import { ComposerGate, isDummyGate } from '../composer';
import { filterEmptyRowsAfterLastGate, Observable, transpose } from '../observable';
import { circuitContext } from '../circuit';
import { Input } from '@/pages/_components/Input';

export interface ObservableComposerProps {
  observable: Observable;
  onObservableUpdate: (o: Observable) => void;
}

const renderPauli = (operators: ComposerGate[]) => {
  return operators.reduce((prev, gate) => {
    if (isDummyGate(gate)) return prev == '' ? 'I' : `${prev} ⊗ I`;

    switch (gate._tag) {
      case 'i':
      case 'x':
      case 'y':
      case 'z':
        return prev == '' ? gate._tag.toUpperCase() : `${prev} ⊗ ${gate._tag.toUpperCase()}`;
      default:
        return prev;
    }
  }, '');
};

export default (props: ObservableComposerProps) => {
  const observableCircuitService = useContext(circuitContext);
  const observableRef = useRef(props.observable);

  useEffect(() => {
    return observableCircuitService.onCircuitChange((c) => {
      const operators = filterEmptyRowsAfterLastGate(transpose(c));
      const newObservable: Observable = {
        coeffs: [...new Array(operators.length)].map(
          (_, i) => observableRef.current.coeffs[i] ?? 1.0
        ),
        operators: operators,
      };
      props.onObservableUpdate(newObservable);
    });
  }, []);

  useEffect(() => {
    observableRef.current = props.observable;
  }, [props.observable]);

  const handleCoefficientUpdate = (timestep: number, coeff: number) => {
    props.onObservableUpdate({
      ...props.observable,
      coeffs: props.observable.coeffs.map((c, i) => (i === timestep ? coeff : c)),
    });
  };

  return (
    <div className="flex items-stretch">
      <div className="w-1/2">
        <DndProvider backend={HTML5Backend}>
          <div className={clsx([['w-full']])}>
            <QuantumGatePalette />
          </div>

          <QuantumCircuitCanvas static={false} fixedQubitNumber />
        </DndProvider>
      </div>

      <div className="w-1/2">
        <div className="h-full flex items-center">
          <div className="flex flex-col gap-3">
            {props.observable.coeffs.map((coeff, i) => {
              return (
                <div className="flex flex-nowrap gap-4 items-center" key={i}>
                  <div
                    className={clsx([
                      ['w-1/3', 'flex'],
                      [i == 0 ? 'justify-center' : 'justify-end'],
                    ])}
                  >
                    {i == 0 ? <div>H = </div> : <div>+</div>}
                  </div>
                  <div className="w-1/3">
                    <Input
                      type="number"
                      value={coeff}
                      step={0.0000001}
                      onInput={(ev) => {
                        const coeff = (ev.target as HTMLInputElement).valueAsNumber;
                        handleCoefficientUpdate(i, coeff);
                      }}
                    />
                  </div>
                  <div>×</div>
                  <div className="w-1/3">{renderPauli(props.observable.operators[i])}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
