'use client';

import { useForm, UseFormReturn, FieldValues, DefaultValues, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';

export interface UseFormBuilderOptions<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues?: DefaultValues<T>;
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
    // @ts-ignore - zodResolver type compatibility issue with generic schemas
    resolver: zodResolver(schema) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
    mode,
  });

  const { formState } = form;

  return {
    ...form,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
  } as UseFormBuilderReturn<T>;
}
