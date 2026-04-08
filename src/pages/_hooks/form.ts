import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { FieldValues, Resolver, SubmitHandler, useForm } from 'react-hook-form';

export const useFormProcessor = <T extends FieldValues>(
  validationRules: yup.ObjectSchema<T>,
  process: ({ setProcessingFalse }: { setProcessingFalse: () => void }) => SubmitHandler<T>
) => {
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<T>({
    resolver: yupResolver(validationRules) as unknown as Resolver<T, any>,
  });

  const onSubmit = handleSubmit((data) => {
    if (processing) return;
    setProcessing(true);
    process({ setProcessingFalse: () => setProcessing(false) })(data);
  });

  return { processing, register, onSubmit, errors, reset, };
};
