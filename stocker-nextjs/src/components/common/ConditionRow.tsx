'use client';

import React, { useMemo } from 'react';
import { Space, Select, Input, InputNumber, DatePicker, Button, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Condition, ComparisonOperator, FieldDefinition, FieldType } from './ConditionBuilder';
import dayjs from 'dayjs';

const { Option } = Select;

interface ConditionRowProps {
  condition: Condition;
  fields: FieldDefinition[];
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}

// Operator labels
const operatorLabels: Record<ComparisonOperator, string> = {
  equals: 'Eşittir (=)',
  notEquals: 'Eşit Değil (≠)',
  greater: 'Büyüktür (>)',
  greaterOrEquals: 'Büyük veya Eşit (≥)',
  less: 'Küçüktür (<)',
  lessOrEquals: 'Küçük veya Eşit (≤)',
  contains: 'İçerir',
  notContains: 'İçermez',
  startsWith: 'İle Başlar',
  endsWith: 'İle Biter',
  isEmpty: 'Boş',
  isNotEmpty: 'Boş Değil',
  in: 'İçinde (IN)',
  notIn: 'İçinde Değil (NOT IN)',
};

// Get available operators based on field type
const getOperatorsForFieldType = (fieldType: FieldType): ComparisonOperator[] => {
  switch (fieldType) {
    case 'text':
      return [
        'equals',
        'notEquals',
        'contains',
        'notContains',
        'startsWith',
        'endsWith',
        'isEmpty',
        'isNotEmpty',
      ];
    case 'number':
      return ['equals', 'notEquals', 'greater', 'greaterOrEquals', 'less', 'lessOrEquals', 'isEmpty', 'isNotEmpty'];
    case 'date':
      return ['equals', 'notEquals', 'greater', 'greaterOrEquals', 'less', 'lessOrEquals', 'isEmpty', 'isNotEmpty'];
    case 'boolean':
      return ['equals', 'notEquals'];
    case 'select':
      return ['equals', 'notEquals', 'in', 'notIn', 'isEmpty', 'isNotEmpty'];
    default:
      return ['equals', 'notEquals'];
  }
};

export default function ConditionRow({ condition, fields, onChange, onRemove }: ConditionRowProps) {
  const selectedField = useMemo(() => {
    return fields.find((f) => f.value === condition.field);
  }, [fields, condition.field]);

  const availableOperators = useMemo(() => {
    if (!selectedField) return ['equals', 'notEquals'] as ComparisonOperator[];
    return getOperatorsForFieldType(selectedField.type);
  }, [selectedField]);

  const handleFieldChange = (fieldValue: string) => {
    const field = fields.find((f) => f.value === fieldValue);
    const defaultOperator = field ? getOperatorsForFieldType(field.type)[0] : 'equals';

    onChange({
      ...condition,
      field: fieldValue,
      operator: defaultOperator,
      value: '',
    });
  };

  const handleOperatorChange = (operator: ComparisonOperator) => {
    onChange({
      ...condition,
      operator,
      // Reset value if operator doesn't need value (isEmpty, isNotEmpty)
      value: operator === 'isEmpty' || operator === 'isNotEmpty' ? '' : condition.value,
    });
  };

  const handleValueChange = (value: any) => {
    onChange({
      ...condition,
      value,
    });
  };

  const renderValueInput = () => {
    // No value input for isEmpty/isNotEmpty
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      return <Tag color="blue">Değer gerektirmez</Tag>;
    }

    if (!selectedField) {
      return <Input placeholder="Önce alan seçin" disabled />;
    }

    // Select field (dropdown)
    if (selectedField.type === 'select' && selectedField.options) {
      if (condition.operator === 'in' || condition.operator === 'notIn') {
        return (
          <Select
            mode="multiple"
            placeholder="Değerler seçin"
            value={Array.isArray(condition.value) ? condition.value : []}
            onChange={handleValueChange}
            style={{ width: '100%' }}
          >
            {selectedField.options.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );
      }

      return (
        <Select
          placeholder="Değer seçin"
          value={condition.value}
          onChange={handleValueChange}
          style={{ width: '100%' }}
        >
          {selectedField.options.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      );
    }

    // Number field
    if (selectedField.type === 'number') {
      return (
        <InputNumber
          placeholder="Sayı girin"
          value={condition.value}
          onChange={handleValueChange}
          style={{ width: '100%' }}
        />
      );
    }

    // Date field
    if (selectedField.type === 'date') {
      return (
        <DatePicker
          placeholder="Tarih seçin"
          value={condition.value ? dayjs(condition.value) : null}
          onChange={(date) => handleValueChange(date?.toISOString())}
          style={{ width: '100%' }}
        />
      );
    }

    // Boolean field
    if (selectedField.type === 'boolean') {
      return (
        <Select placeholder="Değer seçin" value={condition.value} onChange={handleValueChange} style={{ width: '100%' }}>
          <Option value={true}>Evet / True</Option>
          <Option value={false}>Hayır / False</Option>
        </Select>
      );
    }

    // Text field (default)
    return (
      <Input
        placeholder="Değer girin veya {{Variable}} kullanın"
        value={condition.value}
        onChange={(e) => handleValueChange(e.target.value)}
        addonBefore={
          condition.valueType === 'dynamic' ? (
            <Tag color="orange">Değişken</Tag>
          ) : (
            <Tag color="blue">Sabit</Tag>
          )
        }
      />
    );
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      {/* Field Selector */}
      <Select
        placeholder="Alan seçin"
        value={condition.field || undefined}
        onChange={handleFieldChange}
        style={{ width: '35%' }}
        showSearch
        optionFilterProp="children"
      >
        {fields.map((field) => (
          <Option key={field.value} value={field.value}>
            {field.label}
          </Option>
        ))}
      </Select>

      {/* Operator Selector */}
      <Select
        placeholder="Operatör"
        value={condition.operator}
        onChange={handleOperatorChange}
        style={{ width: '30%' }}
        disabled={!condition.field}
      >
        {availableOperators.map((op) => (
          <Option key={op} value={op}>
            {operatorLabels[op]}
          </Option>
        ))}
      </Select>

      {/* Value Input */}
      <div style={{ flex: 1 }}>{renderValueInput()}</div>

      {/* Remove Button */}
      <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove} />
    </Space.Compact>
  );
}
