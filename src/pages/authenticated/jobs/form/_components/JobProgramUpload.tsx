import { Button } from '@/pages/_components/Button';
import { Divider } from '@mui/material';
import clsx from 'clsx';
import { useRef, useState } from 'react';

export default function JobProgramUpload({ setProgram }: JobProgramUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | undefined>();

  return (
    <div className={clsx('flex', 'flex-row', 'items-center', 'gap-[0.25rem]', 'cursor-pointer')}>
      <input
        ref={ref}
        className={clsx('hidden')}
        type="file"
        accept=".zip"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setProgram(file);
          setFilename(file.name);
        }}
      />
      <Button color="secondary" onClick={() => ref.current?.click()}>
        Choose File
      </Button>
      <div
        className={clsx(
          'flex',
          'flex-row',
          'flex-grow',
          'justify-between',
          'items-center',
          'gap-[0.25rem]',
          'p-1',
          'border-b-2',
          'border-solid',
          'border-[#E5E7EB]'
        )}
      >
        <span onClick={() => ref.current?.click()}>{filename ?? 'No file chosen'}</span>
        <Button
          disabled={!filename}
          color="error"
          size="small"
          onClick={() => {
            if (!ref.current) return;

            ref.current.value = '';
            setFilename(undefined);
            setProgram(undefined);
          }}
        >
          x
        </Button>
      </div>
    </div>
  );
}

type JobProgramUploadProps = {
  setProgram(f: File | undefined): void;
};
