import { ReactElement, useContext, useEffect, useRef, useState } from 'react';

import { circuitContext, getNonEmptyGatesRows } from '../circuit';
import {
  createGateParams,
  GateDefinition,
  GateParams,
  isGateNameValid,
  mapCustomGateRowsToParamsNames,
} from '../custom_gates';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { supportedGates } from '../gates';
import clsx from 'clsx';
import { Card } from '@/pages/_components/Card';
import { Spacer } from '@/pages/_components/Spacer';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function CustomGateModal({ isOpen, setIsOpen }: Props): ReactElement {
  const circuitService = useContext(circuitContext);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [gateDefinition, setGateDefinition] = useState<GateDefinition | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      const [params, singleGateParams] = mapGatesToGateDefinitionParams() ?? [];
      if (!params || !singleGateParams) return;
      setGateDefinition({
        name: '',
        params,
        singleGateParams,
      });
    } else {
      setGateDefinition(undefined);
      setNameError(undefined);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.height = 'auto';
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
  }, [gateDefinition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', createCustomGateOnEnter);
    return () => {
      window.removeEventListener('keydown', createCustomGateOnEnter);
    };
  }, [isOpen, gateDefinition]);

  function createCustomGateOnEnter(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    if (nameError !== undefined) return;

    createCustomGate();
  }

  function mapGatesToGateDefinitionParams(): [string[], GateParams[]] | undefined {
    // collect all rows occupied by selected gates
    const rows = new Set<number>(
      circuitService.selectedGates.map((g) => getNonEmptyGatesRows(g)).flat()
    );

    const rowParamMap = mapCustomGateRowsToParamsNames(rows);
    const gateParams = createGateParams(circuitService.selectedGates, rowParamMap);

    return [Object.values(rowParamMap), gateParams];
  }

  function handleNameInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    if (!isGateNameValid(value)) {
      setNameError(
        'A gate name must start with a letter or an underscore. It must consist only of letters, numbers, and underscores.'
      );
    } else if (
      supportedGates.some((gateTag) => gateTag === value) ||
      circuitService.customGates[value]
    ) {
      setNameError('Gate with provided name is already defined.');
    } else {
      nameError && setNameError(undefined);
    }

    gateDefinition && setGateDefinition({ ...gateDefinition, name: value });
  }

  function createCustomGate() {
    if (!gateDefinition || gateDefinition.name === '') return;
    circuitService.groupSelectedGates(gateDefinition);
    setIsOpen(false);
  }

  function gateDefinitionToString(): string {
    if (!gateDefinition) return '';

    const paramsString = gateDefinition.params.join(', ');
    let result = `gate ${gateDefinition?.name || '<name>'} ${paramsString} {\n`;

    gateDefinition.singleGateParams.forEach((gateParams) => {
      const paramsString = gateParams.params.join(', ');

      const tag = 'customTag' in gateParams ? gateParams.customTag : gateParams._tag;
      const rotationAngleString =
        'rotationAngle' in gateParams ? `(${gateParams.rotationAngle})` : '';

      result += `  ${tag}${rotationAngleString} ${paramsString};\n`;
    });

    result += '}';

    return result;
  }

  const canCreateGate = nameError === undefined && gateDefinition && gateDefinition.name !== '';

  return (
    <div
      className={clsx(
        !isOpen && '!hidden',
        ['!fixed', '!top-0', '!left-0', '!w-full', '!h-full', 'z-40'],
        ['flex', 'flex-col', 'items-center', 'justify-center'],
        ['bg-modal-bg', 'bg-opacity-50']
      )}
    >
      <Card className={clsx('w-[400px]', 'max-w-[100%]', 'text-xg')}>
        <h1 className={clsx('text-xl', 'font-bold', 'text-primary')}>Create custom gate</h1>
        <Spacer className={'h-4'} />
        <section>
          <label>Provide name for custom gate:</label>
          <Spacer className={'h-2'} />
          <Input
            type="text"
            value={gateDefinition?.name ?? ''}
            onChange={handleNameInputChange}
            errorMessage={nameError}
          />
        </section>
        <Spacer className={'h-4'} />
        <textarea
          ref={textAreaRef}
          className={clsx('p-2', 'rounded', 'w-full', 'text-disable-content', 'bg-disable-bg')}
          style={{ resize: 'none' }}
          disabled={true}
          value={gateDefinitionToString()}
        />
        <Spacer className={'h-4'} />
        <section className={clsx('w-full', 'flex', 'flex-row', 'justify-around')}>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button
            color={canCreateGate ? 'secondary' : 'disabled'}
            onClick={createCustomGate}
            disabled={!canCreateGate}
          >
            Create
          </Button>
        </section>
      </Card>
    </div>
  );
}
