import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Divider } from '@/pages/_components/Divider';
import { Input } from '@/pages/_components/Input';
import { Spacer } from '@/pages/_components/Spacer';
import { Button } from '@/pages/_components/Button';
import { ComplexForm } from './ComplexForm';
import { OperatorItem } from '@/domain/types/Job';

export const OperatorForm = ({
  current,
  set,
  error,
}: {
  current: OperatorItem[];
  set: (_: OperatorItem[]) => void;
  error: {
    pauli: { [index: number]: string };
    coeff: { [index: number]: [string | undefined, string | undefined] };
  };
}) => {
  const { t } = useTranslation();

  return (
    <div className={clsx('grid', 'gap-2')}>
      <Divider />
      <Spacer className="h-2" />
      <p className={clsx('font-bold', 'text-primary')}>operator</p>
      <div className={clsx('grid', 'gap-4')}>
        {current.map((item, index) => (
          <div key={index} className={clsx('flex', 'gap-1', 'items-center')}>
            <div className={clsx('grid', 'gap-1', 'w-full')}>
              <Input
                label="pauli"
                placeholder={t('job.form.info_pauli_placeholder')}
                value={item.pauli}
                onChange={(e) => {
                  set(current.map((o, i) => (i === index ? { ...o, pauli: e.target.value } : o)));
                }}
                errorMessage={error.pauli[index]}
              />
              <ComplexForm
                label="coeff"
                curr={item.coeff}
                set={(coeff) => {
                  set(current.map((o, i) => (i === index ? { ...o, coeff } : o)));
                }}
                error={error.coeff[index] ?? [undefined, undefined]}
              />
            </div>
            <Button
              color="error"
              size="small"
              className={clsx('w-8', 'h-16', 'flex', 'justify-center', 'items-center')}
              onClick={() => {
                set(current.filter((_, i) => i !== index));
              }}
            >
              x
            </Button>
          </div>
        ))}
      </div>
      <div className={clsx('w-min')}>
        <Button
          color="secondary"
          size="small"
          onClick={() => set([...current, { pauli: '', coeff: ['', '0'] }])}
        >
          +
        </Button>
      </div>
    </div>
  );
};
