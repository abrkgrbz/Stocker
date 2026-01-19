'use client';

import React from 'react';
import { Form, Switch } from 'antd';
import type { SwitchProps, FormItemProps } from 'antd';
import type { FormInstance } from 'antd';

interface FormSwitchProps extends Omit<SwitchProps, 'className' | 'checked' | 'onChange'> {
  /** The Ant Design form instance */
  form: FormInstance;
  /** Field name */
  name: string;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Dynamic description based on value */
  descriptionTrue?: string;
  /** Dynamic description based on value */
  descriptionFalse?: string;
  /** Current value (for controlled component) */
  value?: boolean;
  /** Callback when value changes */
  onChange?: (value: boolean) => void;
  /** Form.Item props */
  formItemProps?: Omit<FormItemProps, 'name'>;
  /** Whether the switch is disabled */
  disabled?: boolean;
}

export function FormSwitch({
  form,
  name,
  title,
  description,
  descriptionTrue,
  descriptionFalse,
  value,
  onChange,
  formItemProps = {},
  disabled = false,
  checkedChildren,
  unCheckedChildren,
  ...switchProps
}: FormSwitchProps) {
  const handleChange = (val: boolean) => {
    form.setFieldValue(name, val);
    onChange?.(val);
  };

  const displayDescription = description || (value ? descriptionTrue : descriptionFalse);

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <div className="text-sm font-medium text-slate-700">{title}</div>
        {displayDescription && (
          <div className="text-xs text-slate-500 mt-0.5">{displayDescription}</div>
        )}
      </div>
      <Form.Item name={name} valuePropName="checked" noStyle {...formItemProps}>
        <Switch
          checked={value}
          onChange={handleChange}
          disabled={disabled}
          checkedChildren={checkedChildren}
          unCheckedChildren={unCheckedChildren}
          {...switchProps}
        />
      </Form.Item>
    </div>
  );
}

export default FormSwitch;
