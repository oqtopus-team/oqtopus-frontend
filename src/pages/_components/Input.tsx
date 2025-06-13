import clsx from 'clsx';
import { ComponentPropsWithRef, forwardRef, useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

export const Input = forwardRef<
  HTMLInputElement,
  {
    label?: string;
    errorMessage?: string;
  } & ComponentPropsWithRef<'input'>
>(({ label, type, errorMessage, className, ...props }, ref) => {
  const [hidden, setHidden] = useState(true);

  // Input elements must be either controlled or uncontrolled
  // (specify either the value prop, or the defaultValue prop, but not both)
  if (props.value) {
    delete props.defaultValue;
  } else if (props.defaultValue) {
    delete props.value;
  }

  return (
    <div className={clsx('grid', 'gap-1', 'w-full')}>
      {label && <p className="text-xs">{label}</p>}
      {type === 'password' ? (
        <div className={clsx('flex', 'items-center')}>
          <input
            ref={ref}
            {...props}
            className={clsx(
              'peer',
              'w-full',
              ['border', 'rounded-l', 'outline-primary'],
              ['py-1.5', 'px-3', 'text-xs'],
              errorMessage && ['!border-error', '!outline-error'],
              className
            )}
            type={hidden ? 'password' : 'text'}
          />
          <button
            tabIndex={-1}
            type="button"
            className={clsx(
              ['h-full'],
              ['flex', 'items-center'],
              ['border-y', 'border-r', 'rounded-r', 'outline-primary'],
              ['px-3'],
              [
                'peer-focus:border-0',
                'peer-focus:outline',
                'peer-focus:outline-2',
                'peer-focus:h-[30px]',
              ],
              errorMessage && ['!border-error', '!outline-error', 'peer-focus:h-[29px]']
            )}
            onClick={() => {
              setHidden((curr) => !curr);
            }}
          >
            {hidden ? <BsEye /> : <BsEyeSlash />}
          </button>
        </div>
      ) : (
        <input
          ref={ref}
          {...props}
          type={type}
          className={clsx(
            'w-full',
            ['rounded', 'border', 'outline-primary'],
            ['py-1.5', 'px-3', 'text-xs'],
            errorMessage && ['!border-error', '!outline-error'],
            className
          )}
        />
      )}
      {errorMessage && (
        <p className={clsx('text-xs', 'text-error', 'font-semibold')}>{errorMessage}</p>
      )}
    </div>
  );
});
