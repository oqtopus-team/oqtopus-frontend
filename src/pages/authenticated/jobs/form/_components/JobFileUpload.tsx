import { JobFileData } from '@/domain/types/Job';
import { Button } from '@/pages/_components/Button';
import clsx from 'clsx';
import * as yup from 'yup';
import { ChangeEvent, useRef, useState } from 'react';
import Notification from '@/pages/_components/Notification';
import { useTranslation } from 'react-i18next';
import { Device } from '@/domain/types/Device';

type JobFileUploadProps = {
  setJobFileData: (data: JobFileData) => void;
  devices: Device[];
};

const jobFileDataSchema = yup.object<JobFileData>({
  name: yup.string().required('name is required'),
  description: yup.string().nullable().optional(),
  shots: yup.number().integer().required(),
  deviceId: yup
    .string()
    .test('deviceId', (value, ctx) => {
      const devices: Device[] = ctx.options.context?.devices;
      if (!devices?.some((d) => d.id === value)) {
        return ctx.createError({
          message: `device must be one of the following: [${devices.map((d) => d.id).join(', ')}]`,
        });
      }
      return true;
    })
    .required(),
  jobType: yup.string().oneOf(['estimation', 'sampling']).required(),
  jobInfo: yup.object({
    program: yup.array().of(yup.string()).required(),
    operator: yup
      .array()
      .of(
        yup.object({
          pauli: yup.string().required(),
          coeff: yup.array().of(yup.string()).length(2),
        })
      )
      .nullable()
      .optional(),
  }),
});

export default function JobFileUpload({ setJobFileData, devices }: JobFileUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length !== 1) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (loadEvent) => {
      const { result } = loadEvent.target ?? {};
      if (!result) return;

      try {
        const jobData = JSON.parse(result as string);
        await jobFileDataSchema.validate(jobData, { context: { devices: devices } as any });
        setJobFileData(jobData);
      } catch (e: any) {
        if (typeof e === 'object' && 'message' in e) {
          setUploadError(e.message);
        } else {
          setUploadError(e);
        }
      } finally {
        // reset input value to prevent storing file in the memory when it's no longer needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <Button color="default" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          className={clsx('hidden')}
          onChange={handleFile}
          type="file"
          accept=".json"
        />
        {t('job.form.upload_file_button')}
      </Button>
      {uploadError && (
        <Notification
          message={uploadError}
          variation="error"
          close={() => setUploadError(undefined)}
        />
      )}
    </>
  );
}
