'use client';

import { useState } from 'react';
import { Button, Select, Input, DatePicker, InputNumber, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

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

const FIELD_OPTIONS = [
  { value: 'totalOrders', label: 'Toplam Sipariş Sayısı', type: 'number' },
  { value: 'totalSpent', label: 'Toplam Harcama', type: 'number' },
  { value: 'lastOrderDate', label: 'Son Sipariş Tarihi', type: 'date' },
  { value: 'createdAt', label: 'Kayıt Tarihi', type: 'date' },
  { value: 'lastLoginDate', label: 'Son Giriş Tarihi', type: 'date' },
  { value: 'city', label: 'Şehir', type: 'text' },
  { value: 'customerType', label: 'Müşteri Tipi', type: 'select', options: ['VIP', 'Premium', 'Standard'] },
  { value: 'status', label: 'Durum', type: 'select', options: ['Active', 'Inactive', 'Pending'] },
];

const OPERATOR_OPTIONS = {
  number: [
    { value: '$gte', label: 'Büyük veya Eşit (≥)' },
    { value: '$lte', label: 'Küçük veya Eşit (≤)' },
    { value: '$gt', label: 'Büyüktür (>)' },
    { value: '$lt', label: 'Küçüktür (<)' },
    { value: '$eq', label: 'Eşittir (=)' },
    { value: '$ne', label: 'Eşit Değil (≠)' },
  ],
  date: [
    { value: '$gte', label: 'Sonra veya Eşit' },
    { value: '$lte', label: 'Önce veya Eşit' },
    { value: '$gt', label: 'Sonra' },
    { value: '$lt', label: 'Önce' },
  ],
  text: [
    { value: '$eq', label: 'Eşittir' },
    { value: '$ne', label: 'Eşit Değil' },
    { value: '$contains', label: 'İçerir' },
  ],
  select: [
    { value: '$eq', label: 'Eşittir' },
    { value: '$ne', label: 'Eşit Değil' },
  ],
};

const TEMPLATES = [
  {
    name: 'VIP Müşteriler',
    description: 'Toplam harcaması 10.000₺ üzeri',
    rules: [{ field: 'totalSpent', operator: '$gte', value: 10000 }],
  },
  {
    name: 'Aktif Müşteriler',
    description: 'Son 30 günde sipariş verenler',
    rules: [{ field: 'lastOrderDate', operator: '$gte', value: '2024-01-01' }],
  },
  {
    name: 'Yeni Müşteriler',
    description: 'Son 3 ayda kayıt olanlar',
    rules: [{ field: 'createdAt', operator: '$gte', value: '2024-10-01' }],
  },
  {
    name: 'Sadık Müşteriler',
    description: '10+ sipariş ve 5000₺+ harcama',
    rules: [
      { field: 'totalOrders', operator: '$gte', value: 10, logicalOperator: 'AND' },
      { field: 'totalSpent', operator: '$gte', value: 5000 },
    ],
  },
];

export function RuleBuilder({ value, onChange }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>(() => {
    if (value && value !== '{}') {
      try {
        const parsed = JSON.parse(value);
        // Convert JSON to rules format
        const convertedRules: Rule[] = [];
        Object.keys(parsed).forEach((field) => {
          const operators = parsed[field];
          Object.keys(operators).forEach((operator) => {
            convertedRules.push({
              id: Math.random().toString(),
              field,
              operator,
              value: operators[operator],
            });
          });
        });
        return convertedRules;
      } catch {
        return [];
      }
    }
    return [];
  });

  const updateJSON = (updatedRules: Rule[]) => {
    const criteria: any = {};
    updatedRules.forEach((rule) => {
      if (!criteria[rule.field]) {
        criteria[rule.field] = {};
      }
      criteria[rule.field][rule.operator] = rule.value;
    });
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
                    icon={<DeleteOutlined />}
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
      <Button type="dashed" onClick={addRule} block icon={<PlusOutlined />}>
        Yeni Kriter Ekle
      </Button>

      {/* Preview JSON */}
      {rules.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <div className="text-xs text-gray-500 mb-1">Oluşturulan JSON (Önizleme):</div>
          <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
            {(() => {
              const criteria: any = {};
              rules.forEach((rule) => {
                if (rule.field && rule.operator) {
                  if (!criteria[rule.field]) {
                    criteria[rule.field] = {};
                  }
                  criteria[rule.field][rule.operator] = rule.value;
                }
              });
              return JSON.stringify(criteria, null, 2);
            })()}
          </code>
        </div>
      )}
    </div>
  );
}
