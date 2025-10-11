'use client';

import React from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Switch, Radio, Checkbox } from 'antd';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import type { Rule } from 'antd/es/form';

const { TextArea } = Input;
const { Option } = Select;

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'textarea'
  | 'select'
  | 'date'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'phone'
  | 'iban'
  | 'tax-id'
  | 'tc-identity';

export interface FormFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  type?: FormFieldType;
  placeholder?: string;
  control: Control<T>;
  disabled?: boolean;
  required?: boolean;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  rows?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: string;
  addonAfter?: string;
  help?: string;
  tooltip?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  control,
  disabled = false,
  required = false,
  options = [],
  min,
  max,
  rows = 4,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  help,
  tooltip,
}: FormFieldProps<T>) {
  const renderInput = (field: any, fieldState: any) => {
    const hasError = !!fieldState.error;
    const errorMessage = fieldState.error?.message;

    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'phone':
      case 'iban':
      case 'tax-id':
      case 'tc-identity':
        return (
          <Input
            {...field}
            type={type === 'password' ? 'password' : type === 'email' ? 'email' : 'text'}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            prefix={prefix}
            suffix={suffix}
            addonBefore={addonBefore}
            addonAfter={addonAfter}
            size="large"
          />
        );

      case 'number':
        return (
          <InputNumber
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            min={min}
            max={max}
            style={{ width: '100%' }}
            size="large"
          />
        );

      case 'currency':
        return (
          <InputNumber
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            min={0}
            precision={2}
            addonBefore={addonBefore || '₺'}
            addonAfter={addonAfter}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value) => value!.replace(/\./g, '')}
            style={{ width: '100%' }}
            size="large"
          />
        );

      case 'percentage':
        return (
          <InputNumber
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            min={0}
            max={100}
            precision={2}
            addonAfter={addonAfter || '%'}
            style={{ width: '100%' }}
            size="large"
          />
        );

      case 'textarea':
        return (
          <TextArea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            rows={rows}
            size="large"
          />
        );

      case 'select':
        return (
          <Select
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            size="large"
            style={{ width: '100%' }}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'date':
        return (
          <DatePicker
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            size="large"
          />
        );

      case 'switch':
        return (
          <Switch
            {...field}
            checked={field.value}
            disabled={disabled}
          />
        );

      case 'radio':
        return (
          <Radio.Group {...field} disabled={disabled}>
            {options.map((option) => (
              <Radio key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );

      case 'checkbox':
        return (
          <Checkbox
            {...field}
            checked={field.value}
            disabled={disabled}
          >
            {label}
          </Checkbox>
        );

      default:
        return (
          <Input
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            status={hasError ? 'error' : ''}
            size="large"
          />
        );
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Form.Item
          label={type !== 'checkbox' ? label : undefined}
          validateStatus={fieldState.error ? 'error' : ''}
          help={fieldState.error?.message || help}
          required={required}
          tooltip={tooltip}
        >
          {renderInput(field, fieldState)}
        </Form.Item>
      )}
    />
  );
}
