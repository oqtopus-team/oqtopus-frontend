import { useState } from 'react';
import clsx from 'clsx';
import { TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { successToastConfig } from '@/config/toast';

interface ProfileFormData {
  email: string;
  name: string;
  organization: string;
  memberSince: string;
}

export function ProfileTab() {
  const { t } = useTranslation();
  const { handleSubmit, register } = useForm<ProfileFormData>({
    defaultValues: {
      email: 'user@example.com',
      name: 'John Doe',
      organization: 'Acme Corp',
      memberSince: '2023-01-15',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    toast(t('settings.profile.saved'), successToastConfig);
  };

  return (
    <div className={clsx('max-w-2xl')}>
      <h3 className={clsx('text-xl', 'font-semibold', 'mb-6')}>{t('settings.profile.title')}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-4')}>
        <div>
          <TextField
            fullWidth
            label={t('settings.profile.email')}
            disabled
            helperText={t('settings.profile.emailReadonly')}
            variant="outlined"
            {...register('email')}
          />
        </div>

        <div>
          <TextField
            {...register('name')}
            fullWidth
            label={t('settings.profile.name')}
            variant="outlined"
            required
          />
        </div>

        <div>
          <TextField
            {...register('organization')}
            fullWidth
            label={t('settings.profile.organization')}
            variant="outlined"
          />
        </div>

        <div>
          <TextField
            {...register('memberSince')}
            fullWidth
            label={t('settings.profile.memberSince')}
            disabled
            helperText={t('settings.profile.memberSinceReadonly')}
            variant="outlined"
          />
        </div>

        <div className={clsx('pt-4')}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            size="large"
          >
            {isLoading ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
