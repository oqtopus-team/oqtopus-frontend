import { Button } from '@/pages/_components/Button';
import clsx from 'clsx';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { circuitContext } from '../circuit';

export default function GatesMultiSelectModePopup() {
  const { t } = useTranslation();
  const circuitService = useContext(circuitContext);
  const [isOpen, setIsOpen] = useState(circuitService.gatesMultiSelectModeOpen);

  useEffect(() => circuitService.onGatesMultiSelectModeOpenChange(setIsOpen), []);

  return (
    <div
      className={clsx(!isOpen && 'hidden', [
        'fixed',
        'top-2',
        'left-1/2',
        '-translate-x-1/2',
        'w-[300px]',
        'm-w-[100%]',
        'z-50',
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-2',
        'bg-[#fff]',
        'p-[0.75rem]',
        'rounded-lg',
        'shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)]',
      ])}
    >
      <h1>{t('composer.gates_multi_select_mode_popup.title')}</h1>
      <div className={clsx('w-full', 'flex', 'flex-row', 'justify-around')}>
        <Button
          onClick={() => {
            circuitService.gatesMultiSelectModeOpen = false;
          }}
          color="secondary"
        >
          {t('composer.gates_multi_select_mode_popup.done')}
        </Button>
        <Button
          onClick={() => {
            circuitService.gatesMultiSelectModeOpen = false;
            circuitService.selectedGates = [];
          }}
        >
          {t('composer.gates_multi_select_mode_popup.cancel')}
        </Button>
      </div>
    </div>
  );
}
