'use client';

import React from 'react';
import { Form, InputNumber } from 'antd';
import type { InputNumberProps, FormItemProps } from 'antd';

// Standard input number styling
const inputNumberClassName = '[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white';

interface FormNumberProps extends Omit<InputNumberProps, 'className'> {
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
  /** Whether to use full width */
  fullWidth?: boolean;
}

export function FormNumber({
  name,
  label,
  required = false,
  requiredMessage,
  rules = [],
  help,
  formItemProps = {},
  className = '',
  fullWidth = true,
  min = 0,
  ...inputProps
}: FormNumberProps) {
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
        <InputNumber
          min={min}
          style={fullWidth ? { width: '100%' } : undefined}
          className={`${inputNumberClassName} ${className}`}
          {...inputProps}
        />
      </Form.Item>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

export default FormNumber;
