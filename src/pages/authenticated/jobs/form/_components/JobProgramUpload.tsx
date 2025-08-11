import { Button } from '@/pages/_components/Button';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function JobProgramUpload({ setProgram }: JobProgramUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | undefined>();
  const { t } = useTranslation();

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
        {t('job.form.upload_job_info.choose_file')}
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
        <span onClick={() => ref.current?.click()}>
          {filename ?? t('job.form.upload_job_info.no_file_chosen')}
        </span>
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
