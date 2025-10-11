'use client';

import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

export interface UseFormBuilderOptions<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues?: Partial<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export interface UseFormBuilderReturn<T extends FieldValues> extends UseFormReturn<T> {
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Custom hook for building forms with Zod validation
 * @param options - Form configuration options
 * @returns Enhanced form methods
 */
export function useFormBuilder<T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange',
}: UseFormBuilderOptions<T>): UseFormBuilderReturn<T> {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });

  const { formState } = form;

  return {
    ...form,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
  };
}
