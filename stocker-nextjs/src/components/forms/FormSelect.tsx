'use client';

import React from 'react';
import { Form, Select, TreeSelect } from 'antd';
import type { SelectProps, TreeSelectProps, FormItemProps } from 'antd';

// Standard select styling
const selectClassName = 'w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white';

interface FormSelectProps extends Omit<SelectProps, 'className'> {
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
  /** Help text below the select */
  help?: string;
  /** Form.Item props */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules'>;
  /** Custom class name to append */
  className?: string;
}

export function FormSelect({
  name,
  label,
  required = false,
  requiredMessage,
  rules = [],
  help,
  formItemProps = {},
  className = '',
  showSearch = true,
  optionFilterProp = 'label',
  ...selectProps
}: FormSelectProps) {
  const allRules = [
    ...(required ? [{ required: true, message: requiredMessage || `${label || 'Seçim'} zorunludur` }] : []),
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
        <Select
          showSearch={showSearch}
          optionFilterProp={optionFilterProp}
          className={`${selectClassName} ${className}`}
          {...selectProps}
        />
      </Form.Item>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

interface FormTreeSelectProps extends Omit<TreeSelectProps, 'className'> {
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
  /** Help text below the select */
  help?: string;
  /** Form.Item props */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules'>;
  /** Custom class name to append */
  className?: string;
}

export function FormTreeSelect({
  name,
  label,
  required = false,
  requiredMessage,
  rules = [],
  help,
  formItemProps = {},
  className = '',
  showSearch = true,
  treeNodeFilterProp = 'title',
  treeLine = { showLeafIcon: false },
  treeDefaultExpandAll = true,
  dropdownStyle = { maxHeight: 400, overflow: 'auto' },
  ...treeSelectProps
}: FormTreeSelectProps) {
  const allRules = [
    ...(required ? [{ required: true, message: requiredMessage || `${label || 'Seçim'} zorunludur` }] : []),
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
        <TreeSelect
          showSearch={showSearch}
          treeNodeFilterProp={treeNodeFilterProp}
          treeLine={treeLine}
          treeDefaultExpandAll={treeDefaultExpandAll}
          dropdownStyle={dropdownStyle}
          className={`${selectClassName} ${className}`}
          {...treeSelectProps}
        />
      </Form.Item>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

export default FormSelect;
