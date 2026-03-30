import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button, Skeleton, Stack, TextField, TextFieldProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { errorToastConfig, successToastConfig } from '@/config/toast';
import { useUserAPI } from '@/backend/hook';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import {
  SettingsGetSettingsResponseEditableFieldsEnum,
  SettingsGetSettingsResponseVisibleFieldsEnum,
} from '@/api/generated';

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
  visibleFields?: Array<SettingsGetSettingsResponseVisibleFieldsEnum>;
}

export function ProfileTab({ editableFields = [], visibleFields }: ProfileTabProps) {
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

  const fields: Array<{
    key: 'email' | 'name' | 'organization' | 'created_at';
    props: Partial<TextFieldProps>;
  }> = [
    {
      key: 'email',
      props: {
        label: t('settings.profile.email'),
        disabled: true,
        helperText: t('settings.profile.emailReadonly'),
      },
    },
    {
      key: 'name',
      props: {
        label: t('settings.profile.name'),
        disabled: !editableFields.includes('name') || isSubmitting,
        required: true,
      },
    },
    {
      key: 'organization',
      props: {
        label: t('settings.profile.organization'),
        disabled: !editableFields.includes('organization') || isSubmitting,
      },
    },
    {
      key: 'created_at',
      props: {
        label: t('settings.profile.created_at'),
        disabled: true,
        helperText: t('settings.profile.created_at'),
      },
    },
  ];

  return (
    <div className={clsx('max-w-2xl')}>
      <h3 className={clsx('text-xl', 'font-semibold', 'mb-6')}>{t('settings.profile.title')}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-4')}>
        {isLoading ? (
          <UserFormSkeleton />
        ) : (
          <Stack spacing={3} direction="column">
            {fields
              .filter(({ key }) => visibleFields?.includes(key))
              .map(({ key, props }) => (
                <TextField
                  key={key}
                  {...register(key)}
                  {...props}
                  fullWidth
                  variant="outlined"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                      className: '!text-neutral-content [&.Mui-disabled]:!text-neutral-content',
                    },
                    input: {
                      className: '!text-base-content',
                    },
                    formHelperText: {
                      className: '!text-neutral-content [&.Mui-disabled]:!text-neutral-content',
                    },
                  }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: 'rgb(var(--neutral-content)) !important',
                      WebkitTextFillColor: 'rgb(var(--neutral-content)) !important',
                    },
                  }}
                />
              ))}
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
