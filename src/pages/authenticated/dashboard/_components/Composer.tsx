import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import clsx from 'clsx';
import { t } from 'i18next';
import QuantumCircuitComposer from '../../composer/_components/QuantumCircuitComposer';
import { useState } from 'react';
import { circuitContext, QuantumCircuitService } from '../../composer/circuit';

export const Composer = (): React.ReactElement => {
  const [circuitService] = useState(
    new QuantumCircuitService(2, 5, ['x', 'y', 'z', 'h', 'cx'], true)
  );

  return (
    <>
      <div className={clsx('flex', 'justify-between', 'items-center')}>
        <div className={clsx('text-lg', 'font-bold', 'text-primary')}>
          {t('dashboard.composer.title')}
        </div>
        <Button kind="link" color="secondary" href="/composer">
          {t('dashboard.composer.button')}
        </Button>
      </div>
      <Spacer className="h-3" />
      <p className="text-xs">{t('dashboard.composer.description')}</p>
      <Spacer className="h-3" />
      <circuitContext.Provider value={circuitService}>
        <QuantumCircuitComposer />
      </circuitContext.Provider>
    </>
  );
};
