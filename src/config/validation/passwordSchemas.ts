import * as yup from 'yup';

interface PasswordErrorKeys {
  required: string;
  lowercase: string;
  uppercase: string;
  number: string;
  special: string;
  min: string;
}

interface PasswordConfirmErrorKeys {
  required: string;
  mismatch: string;
}

export const createPasswordSchema = (errorKeys: PasswordErrorKeys, minLength: number = 12) =>
  yup
    .string()
    .required(errorKeys.required)
    .matches(/(?=.*[a-z])/, errorKeys.lowercase)
    .matches(/(?=.*[A-Z])/, errorKeys.uppercase)
    .matches(/(?=.*[0-9])/, errorKeys.number)
    .matches(/(?=.*[!-/:-@[-`{-~])/, errorKeys.special)
    .min(minLength, errorKeys.min);

export const createPasswordConfirmSchema = (
  refField: string,
  errorKeys: PasswordConfirmErrorKeys
) =>
  yup
    .string()
    .required(errorKeys.required)
    .oneOf([yup.ref(refField)], errorKeys.mismatch);

export const createEmailSchema = (t: (key: string) => string) =>
  yup
    .string()
    .required(t('signup.form.error_message.mail_address_enter'))
    .max(100, t('signup.form.error_message.mail_address_max'))
    .email(t('signup.form.error_message.mail_address_valid'));
