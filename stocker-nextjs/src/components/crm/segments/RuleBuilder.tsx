'use client';

import { useState } from 'react';
import { Button, Select, Input, DatePicker, InputNumber, Space, Tag } from 'antd';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface RuleBuilderProps {
  value?: string;
  onChange?: (value: string) => void;
}

// Field option type definition
interface FieldOption {
  value: string;
  label: string;
  type: 'date' | 'number' | 'text' | 'select';
  options?: string[]; // For select type fields
}

// Field options matching backend SegmentCriteriaEngine supported fields
const FIELD_OPTIONS: FieldOption[] = [
  { value: 'createdAt', label: 'Kayıt Tarihi', type: 'date' },
  { value: 'annualRevenue', label: 'Yıllık Gelir (₺)', type: 'number' },
  { value: 'numberOfEmployees', label: 'Çalışan Sayısı', type: 'number' },
  { value: 'companyName', label: 'Şirket Adı', type: 'text' },
  { value: 'email', label: 'E-posta', type: 'text' },
  { value: 'industry', label: 'Sektör', type: 'text' },
  { value: 'city', label: 'Şehir', type: 'text' },
  { value: 'state', label: 'Bölge/İl', type: 'text' },
  { value: 'country', label: 'Ülke', type: 'text' },
];

const OPERATOR_OPTIONS = {
  number: [
    { value: '>=', label: 'Büyük veya Eşit (≥)' },
    { value: '<=', label: 'Küçük veya Eşit (≤)' },
    { value: '>', label: 'Büyüktür (>)' },
    { value: '<', label: 'Küçüktür (<)' },
    { value: '=', label: 'Eşittir (=)' },
    { value: '!=', label: 'Eşit Değil (≠)' },
  ],
  date: [
    { value: '>=', label: 'Sonra veya Eşit' },
    { value: '<=', label: 'Önce veya Eşit' },
    { value: '>', label: 'Sonra' },
    { value: '<', label: 'Önce' },
  ],
  text: [
    { value: '=', label: 'Eşittir' },
    { value: '!=', label: 'Eşit Değil' },
    { value: 'CONTAINS', label: 'İçerir' },
  ],
  select: [
    { value: '=', label: 'Eşittir' },
    { value: '!=', label: 'Eşit Değil' },
  ],
};

const TEMPLATES = [
  {
    name: 'Yüksek Gelirli Müşteriler',
    description: 'Yıllık geliri 1.000.000₺ üzeri',
    rules: [{ field: 'annualRevenue', operator: '>=', value: 1000000 }],
  },
  {
    name: 'Yeni Müşteriler',
    description: 'Son 3 ayda kayıt olanlar',
    rules: [{ field: 'createdAt', operator: '>=', value: '2024-10-01' }],
  },
  {
    name: 'Büyük Şirketler',
    description: '50+ çalışanı olan şirketler',
    rules: [{ field: 'numberOfEmployees', operator: '>=', value: 50 }],
  },
  {
    name: 'İstanbul Müşterileri',
    description: 'İstanbul\'daki müşteriler',
    rules: [{ field: 'city', operator: '=', value: 'İstanbul' }],
  },
];

export function RuleBuilder({ value, onChange }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>(() => {
    if (value && value !== '{}') {
      try {
        const parsed = JSON.parse(value);
        // Check if it's the new SegmentCriteria format
        if (parsed.Conditions && Array.isArray(parsed.Conditions)) {
          return parsed.Conditions.map((condition: any, index: number) => ({
            id: Math.random().toString(),
            field: condition.Field,
            operator: condition.Operator,
            value: condition.Value,
            logicalOperator: index > 0 ? (parsed.Operator || 'AND') : undefined,
          }));
        }
        // Fallback for old MongoDB-style format (for backwards compatibility)
        const convertedRules: Rule[] = [];
        Object.keys(parsed).forEach((field) => {
          const operators = parsed[field];
          if (typeof operators === 'object') {
            Object.keys(operators).forEach((operator) => {
              // Convert MongoDB operators to standard operators
              const standardOp = operator.replace('$gte', '>=').replace('$lte', '<=')
                .replace('$gt', '>').replace('$lt', '<')
                .replace('$eq', '=').replace('$ne', '!=')
                .replace('$contains', 'CONTAINS');
              convertedRules.push({
                id: Math.random().toString(),
                field,
                operator: standardOp,
                value: operators[operator],
              });
            });
          }
        });
        return convertedRules;
      } catch {
        return [];
      }
    }
    return [];
  });

  const updateJSON = (updatedRules: Rule[]) => {
    // Convert rules to backend SegmentCriteria format
    const hasOrCondition = updatedRules.some(r => r.logicalOperator === 'OR');
    const criteria = {
      Operator: hasOrCondition ? 'OR' : 'AND',
      Conditions: updatedRules
        .filter(r => r.field && r.operator)
        .map(r => ({
          Field: r.field,
          Operator: r.operator,
          Value: r.value
        }))
    };
    onChange?.(JSON.stringify(criteria));
  };

  const addRule = () => {
    const newRules = [
      ...rules,
      {
        id: Math.random().toString(),
        field: '',
        operator: '',
        value: null,
        logicalOperator: rules.length > 0 ? 'AND' : undefined,
      },
    ];
    setRules(newRules as any);
  };

  const removeRule = (id: string) => {
    const newRules = rules.filter((r) => r.id !== id);
    setRules(newRules as any);
    updateJSON(newRules as any);
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    const newRules = rules.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRules(newRules as any);
    updateJSON(newRules as any);
  };

  const toggleLogicalOperator = (id: string) => {
    const newRules = rules.map((r) =>
      r.id === id ? { ...r, logicalOperator: r.logicalOperator === 'AND' ? 'OR' : 'AND' } : r
    );
    setRules(newRules as any);
    updateJSON(newRules as any);
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    const newRules = template.rules.map((rule) => ({
      id: Math.random().toString(),
      ...rule,
    }));
    setRules(newRules as any);
    updateJSON(newRules as any);
  };

  const getFieldType = (fieldValue: string) => {
    return FIELD_OPTIONS.find((f) => f.value === fieldValue)?.type || 'text';
  };

  const renderValueInput = (rule: Rule) => {
    const fieldType = getFieldType(rule.field);
    const fieldOption = FIELD_OPTIONS.find((f) => f.value === rule.field);

    switch (fieldType) {
      case 'number':
        return (
          <InputNumber
            style={{ width: 200 }}
            placeholder="Değer girin"
            value={rule.value}
            onChange={(val) => updateRule(rule.id, { value: val })}
          />
        );
      case 'date':
        return (
          <DatePicker
            style={{ width: 200 }}
            placeholder="Tarih seçin"
            onChange={(date) => updateRule(rule.id, { value: date?.format('YYYY-MM-DD') })}
          />
        );
      case 'select':
        return (
          <Select
            style={{ width: 200 }}
            placeholder="Seçin"
            value={rule.value}
            onChange={(val) => updateRule(rule.id, { value: val })}
          >
            {fieldOption?.options?.map((opt) => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return (
          <Input
            style={{ width: 200 }}
            placeholder="Değer girin"
            value={rule.value}
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Templates */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">📋 Hazır Şablonlar</h4>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <Button key={template.name} size="small" onClick={() => applyTemplate(template)}>
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Rules */}
      {rules.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">
            Müşterilerim aşağıdaki koşulların{' '}
            <Tag color="blue">{rules[0]?.logicalOperator === 'OR' ? 'HERHANGİ BİRİNİ' : 'TÜMÜNÜ'}</Tag> karşılamalıdır:
          </h4>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={rule.id}>
                {index > 0 && rule.logicalOperator && (
                  <div className="flex items-center gap-2 my-2">
                    <Button
                      size="small"
                      type={rule.logicalOperator === 'AND' ? 'primary' : 'default'}
                      onClick={() => toggleLogicalOperator(rule.id)}
                    >
                      {rule.logicalOperator}
                    </Button>
                    <span className="text-xs text-gray-500">
                      ({rule.logicalOperator === 'AND' ? 'VE' : 'VEYA'} koşulu için tıklayın)
                    </span>
                  </div>
                )}

                <Space.Compact block>
                  <Select
                    style={{ width: '35%' }}
                    placeholder="Müşteri Özelliği"
                    value={rule.field}
                    onChange={(val) => updateRule(rule.id, { field: val, operator: '', value: null })}
                  >
                    {FIELD_OPTIONS.map((field) => (
                      <Select.Option key={field.value} value={field.value}>
                        {field.label}
                      </Select.Option>
                    ))}
                  </Select>

                  <Select
                    style={{ width: '30%' }}
                    placeholder="Operatör"
                    value={rule.operator}
                    onChange={(val) => updateRule(rule.id, { operator: val })}
                    disabled={!rule.field}
                  >
                    {rule.field &&
                      OPERATOR_OPTIONS[getFieldType(rule.field) as keyof typeof OPERATOR_OPTIONS]?.map((op) => (
                        <Select.Option key={op.value} value={op.value}>
                          {op.label}
                        </Select.Option>
                      ))}
                  </Select>

                  <div style={{ width: '30%' }}>{rule.field && renderValueInput(rule)}</div>

                  <Button
                    danger
                    icon={<TrashIcon className="w-4 h-4" />}
                    onClick={() => removeRule(rule.id)}
                    style={{ width: '5%' }}
                  />
                </Space.Compact>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Rule Button */}
      <Button type="dashed" onClick={addRule} block icon={<PlusIcon className="w-4 h-4" />}>
        Yeni Kriter Ekle
      </Button>

      {/* Preview JSON */}
      {rules.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <div className="text-xs text-gray-500 mb-1">Oluşturulan JSON (Önizleme):</div>
          <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
            {(() => {
              const hasOrCondition = rules.some(r => r.logicalOperator === 'OR');
              const criteria = {
                Operator: hasOrCondition ? 'OR' : 'AND',
                Conditions: rules
                  .filter(r => r.field && r.operator)
                  .map(r => ({
                    Field: r.field,
                    Operator: r.operator,
                    Value: r.value
                  }))
              };
              return JSON.stringify(criteria, null, 2);
            })()}
          </code>
        </div>
      )}
    </div>
  );
}
