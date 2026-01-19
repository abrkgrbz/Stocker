'use client';

import React from 'react';
import { Form, Input } from 'antd';
import type { InputProps, FormItemProps } from 'antd';

const { TextArea } = Input;

// Standard form input styling
const inputClassName = '!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white';
const textareaClassName = `${inputClassName} !resize-none`;

interface FormInputProps extends Omit<InputProps, 'className'> {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom validation message for required fields */
  requiredMessage?: string;
  /** Additional form item rules */
  rules?: FormItemProps['rules'];
  /** Help text below the input */
  help?: string;
  /** Form.Item props */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules'>;
  /** Custom class name to append */
  className?: string;
}

export function FormInput({
  name,
  label,
  required = false,
  requiredMessage,
  rules = [],
  help,
  formItemProps = {},
  className = '',
  ...inputProps
}: FormInputProps) {
  const allRules = [
    ...(required ? [{ required: true, message: requiredMessage || `${label || 'Bu alan'} zorunludur` }] : []),
    ...rules,
  ];

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Form.Item
        name={name}
        rules={allRules}
        className="mb-0"
        {...formItemProps}
      >
        <Input
          className={`${inputClassName} ${className}`}
          {...inputProps}
        />
      </Form.Item>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

interface FormTextAreaProps extends Omit<React.ComponentProps<typeof TextArea>, 'className'> {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom validation message for required fields */
  requiredMessage?: string;
  /** Additional form item rules */
  rules?: FormItemProps['rules'];
  /** Help text below the input */
  help?: string;
  /** Form.Item props */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules'>;
  /** Custom class name to append */
  className?: string;
}

export function FormTextArea({
  name,
  label,
  required = false,
  requiredMessage,
  rules = [],
  help,
  formItemProps = {},
  className = '',
  rows = 3,
  ...textareaProps
}: FormTextAreaProps) {
  const allRules = [
    ...(required ? [{ required: true, message: requiredMessage || `${label || 'Bu alan'} zorunludur` }] : []),
    ...rules,
  ];

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Form.Item
        name={name}
        rules={allRules}
        className="mb-0"
        {...formItemProps}
      >
        <TextArea
          rows={rows}
          className={`${textareaClassName} ${className}`}
          {...textareaProps}
        />
      </Form.Item>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

export default FormInput;
