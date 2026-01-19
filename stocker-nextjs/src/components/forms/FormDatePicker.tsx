'use client';

import React from 'react';
import { Form, DatePicker } from 'antd';
import type { DatePickerProps, FormItemProps } from 'antd';

// Standard date picker styling
const datePickerClassName = '!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white';

interface FormDatePickerProps extends Omit<DatePickerProps, 'className'> {
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
  /** Help text below the date picker */
  help?: string;
  /** Form.Item props */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules'>;
  /** Custom class name to append */
  className?: string;
  /** Whether to use full width */
  fullWidth?: boolean;
}

export function FormDatePicker({
  name,
  label,
  required = false,
  requiredMessage,
  rules = [],
  help,
  formItemProps = {},
  className = '',
  fullWidth = true,
  format = 'DD.MM.YYYY',
  placeholder = 'Tarih seçin',
  ...datePickerProps
}: FormDatePickerProps) {
  const allRules = [
    ...(required ? [{ required: true, message: requiredMessage || `${label || 'Tarih'} zorunludur` }] : []),
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
        <DatePicker
          format={format}
          placeholder={placeholder}
          style={fullWidth ? { width: '100%' } : undefined}
          className={`${datePickerClassName} ${className}`}
          {...datePickerProps}
        />
      </Form.Item>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

export default FormDatePicker;
