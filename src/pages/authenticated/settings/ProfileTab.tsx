import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button, Skeleton, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { errorToastConfig, successToastConfig } from '@/config/toast';
import { useUserAPI } from '@/backend/hook';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import { SettingsGetSettingsResponseEditableFieldsEnum } from '@/api/generated';

interface ProfileFormData {
  email?: string;
  name?: string;
  organization?: string;
  created_at?: string;
}

function UserFormSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
    </Stack>
  );
}

interface ProfileTabProps {
  editableFields?: Array<SettingsGetSettingsResponseEditableFieldsEnum>;
}

export function ProfileTab({ editableFields = [] }: ProfileTabProps) {
  const { t, i18n } = useTranslation();
  const { getCurrentUser, updateCurrentUser } = useUserAPI();
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>();

  const [isLoading, setIsLoading] = useState(true);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Only send editable fields
      const updateData: ProfileFormData = {};
      if (editableFields.includes('name')) {
        updateData.name = data.name;
      }
      if (editableFields.includes('organization')) {
        updateData.organization = data.organization;
      }
      await updateCurrentUser(updateData);
      toast(t('settings.profile.saved'), successToastConfig);
    } catch (e) {
      toast(t('common.errors.default'), errorToastConfig);
    }
  };

  useEffect(() => {
    getCurrentUser()
      .then((userData) => {
        reset(userData);
        setValue('created_at', DateTimeFormatter(t, i18n, userData.created_at));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className={clsx('max-w-2xl')}>
      <h3 className={clsx('text-xl', 'font-semibold', 'mb-6')}>{t('settings.profile.title')}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-4')}>
        {isLoading ? (
          <UserFormSkeleton />
        ) : (
          <Stack spacing={3} direction="column">
            <TextField
              fullWidth
              label={t('settings.profile.email')}
              disabled
              helperText={t('settings.profile.emailReadonly')}
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              {...register('email')}
            />
            <TextField
              {...register('name')}
              disabled={!editableFields.includes('name') || isSubmitting}
              fullWidth
              label={t('settings.profile.name')}
              variant="outlined"
              required
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              {...register('organization')}
              disabled={!editableFields.includes('organization') || isSubmitting}
              fullWidth
              label={t('settings.profile.organization')}
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              {...register('created_at')}
              fullWidth
              label={t('settings.profile.created_at')}
              disabled
              helperText={t('settings.profile.created_at')}
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Stack>
        )}

        <div className={clsx('pt-4')}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || isSubmitting}
            size="large"
          >
            {isSubmitting ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
