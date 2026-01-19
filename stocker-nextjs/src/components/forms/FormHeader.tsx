'use client';

import React from 'react';
import { Form, Input, Switch } from 'antd';
import type { FormInstance } from 'antd';

interface FormHeaderProps {
  /** The Ant Design form instance */
  form: FormInstance;
  /** Icon component to display (e.g., from Heroicons) */
  icon: React.ReactNode;
  /** Field name for the title input */
  titleField: string;
  /** Placeholder text for the title input */
  titlePlaceholder?: string;
  /** Field name for the description/subtitle input (optional) */
  descriptionField?: string;
  /** Placeholder text for the description input */
  descriptionPlaceholder?: string;
  /** Whether to show the status toggle */
  showStatusToggle?: boolean;
  /** Field name for the status toggle (defaults to 'isActive') */
  statusField?: string;
  /** Current status value (for controlled component) */
  statusValue?: boolean;
  /** Callback when status changes */
  onStatusChange?: (value: boolean) => void;
  /** Labels for active/inactive states */
  statusLabels?: { active: string; inactive: string };
  /** Custom right side content (replaces status toggle) */
  rightContent?: React.ReactNode;
  /** Validation rules for title field */
  titleRules?: any[];
  /** Whether the title field is disabled (e.g., during edit mode for code fields) */
  titleDisabled?: boolean;
  /** Whether the form is in loading state */
  loading?: boolean;
}

export function FormHeader({
  form,
  icon,
  titleField,
  titlePlaceholder = 'Başlık girin...',
  descriptionField,
  descriptionPlaceholder = 'Açıklama...',
  showStatusToggle = true,
  statusField = 'isActive',
  statusValue,
  onStatusChange,
  statusLabels = { active: 'Aktif', inactive: 'Pasif' },
  rightContent,
  titleRules = [{ required: true, message: 'Bu alan zorunludur' }],
  titleDisabled = false,
  loading = false,
}: FormHeaderProps) {
  const handleStatusChange = (val: boolean) => {
    form.setFieldValue(statusField, val);
    onStatusChange?.(val);
  };

  return (
    <div className="px-8 py-6 border-b border-slate-200">
      <div className="flex items-center gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Title and Description */}
        <div className="flex-1">
          <Form.Item
            name={titleField}
            rules={titleRules}
            className="mb-0"
          >
            <Input
              placeholder={titlePlaceholder}
              variant="borderless"
              disabled={titleDisabled || loading}
              className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
            />
          </Form.Item>
          {descriptionField && (
            <Form.Item name={descriptionField} className="mb-0 mt-1">
              <Input
                placeholder={descriptionPlaceholder}
                variant="borderless"
                disabled={loading}
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
              />
            </Form.Item>
          )}
        </div>

        {/* Right Content (Status Toggle or Custom) */}
        <div className="flex-shrink-0">
          {rightContent ? (
            rightContent
          ) : showStatusToggle ? (
            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-slate-600">
                {statusValue ? statusLabels.active : statusLabels.inactive}
              </span>
              <Form.Item name={statusField} valuePropName="checked" noStyle initialValue={true}>
                <Switch
                  checked={statusValue}
                  onChange={handleStatusChange}
                  disabled={loading}
                />
              </Form.Item>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FormHeader;
