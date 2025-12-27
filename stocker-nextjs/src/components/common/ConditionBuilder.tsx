'use client';

import React from 'react';
import { Card, Button, Radio, Space, Alert, Typography } from 'antd';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConditionRow from './ConditionRow';

const { Text } = Typography;

export interface ConditionGroup {
  logicalOperator: 'AND' | 'OR';
  conditions: Condition[];
  groups?: ConditionGroup[];
}

export interface Condition {
  field: string;
  operator: ComparisonOperator;
  value: any;
  valueType?: 'static' | 'dynamic';
}

export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greater'
  | 'greaterOrEquals'
  | 'less'
  | 'lessOrEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn';

export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface FieldDefinition {
  value: string;
  label: string;
  type: FieldType;
  options?: Array<{ value: string; label: string }>;
}

interface ConditionBuilderProps {
  value?: ConditionGroup;
  onChange: (value: ConditionGroup) => void;
  fields: FieldDefinition[];
  maxDepth?: number;
  currentDepth?: number;
}

export default function ConditionBuilder({
  value,
  onChange,
  fields,
  maxDepth = 3,
  currentDepth = 0,
}: ConditionBuilderProps) {
  const conditionGroup = value || {
    logicalOperator: 'AND' as const,
    conditions: [],
    groups: [],
  };

  const handleAddCondition = () => {
    const newGroup: ConditionGroup = {
      ...conditionGroup,
      conditions: [
        ...conditionGroup.conditions,
        {
          field: '',
          operator: 'equals',
          value: '',
        },
      ],
    };
    onChange(newGroup);
  };

  const handleRemoveCondition = (index: number) => {
    const newGroup: ConditionGroup = {
      ...conditionGroup,
      conditions: conditionGroup.conditions.filter((_, i) => i !== index),
    };
    onChange(newGroup);
  };

  const handleUpdateCondition = (index: number, condition: Condition) => {
    const newConditions = [...conditionGroup.conditions];
    newConditions[index] = condition;
    const newGroup: ConditionGroup = {
      ...conditionGroup,
      conditions: newConditions,
    };
    onChange(newGroup);
  };

  const handleAddGroup = () => {
    if (currentDepth >= maxDepth) {
      return;
    }

    const newGroup: ConditionGroup = {
      ...conditionGroup,
      groups: [
        ...(conditionGroup.groups || []),
        {
          logicalOperator: 'AND',
          conditions: [],
          groups: [],
        },
      ],
    };
    onChange(newGroup);
  };

  const handleRemoveGroup = (index: number) => {
    const newGroup: ConditionGroup = {
      ...conditionGroup,
      groups: conditionGroup.groups?.filter((_, i) => i !== index) || [],
    };
    onChange(newGroup);
  };

  const handleUpdateGroup = (index: number, group: ConditionGroup) => {
    const newGroups = [...(conditionGroup.groups || [])];
    newGroups[index] = group;
    const newGroup: ConditionGroup = {
      ...conditionGroup,
      groups: newGroups,
    };
    onChange(newGroup);
  };

  const handleLogicalOperatorChange = (operator: 'AND' | 'OR') => {
    const newGroup: ConditionGroup = {
      ...conditionGroup,
      logicalOperator: operator,
    };
    onChange(newGroup);
  };

  const hasMultipleItems =
    conditionGroup.conditions.length + (conditionGroup.groups?.length || 0) > 1;

  const totalItems = conditionGroup.conditions.length + (conditionGroup.groups?.length || 0);

  return (
    <Card
      size="small"
      style={{
        backgroundColor: currentDepth > 0 ? '#fafafa' : '#fff',
        borderColor: currentDepth > 0 ? '#d9d9d9' : '#f0f0f0',
      }}
    >
      {/* Conditions */}
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {conditionGroup.conditions.map((condition, index) => (
          <div key={`condition-${index}`}>
            <ConditionRow
              condition={condition}
              fields={fields}
              onChange={(updated) => handleUpdateCondition(index, updated)}
              onRemove={() => handleRemoveCondition(index)}
            />

            {/* Show logical operator between conditions/groups */}
            {index < totalItems - 1 && hasMultipleItems && (
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <Radio.Group
                  value={conditionGroup.logicalOperator}
                  onChange={(e) => handleLogicalOperatorChange(e.target.value)}
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value="AND">VE (AND)</Radio.Button>
                  <Radio.Button value="OR">VEYA (OR)</Radio.Button>
                </Radio.Group>
              </div>
            )}
          </div>
        ))}

        {/* Nested Groups */}
        {conditionGroup.groups?.map((group, index) => (
          <div key={`group-${index}`}>
            <Card
              size="small"
              title={
                <Space>
                  <Text strong>Grup {index + 1}</Text>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<TrashIcon className="w-4 h-4" />}
                    onClick={() => handleRemoveGroup(index)}
                  >
                    Grubu Kaldır
                  </Button>
                </Space>
              }
              style={{ borderColor: '#1890ff' }}
            >
              <ConditionBuilder
                value={group}
                onChange={(updated) => handleUpdateGroup(index, updated)}
                fields={fields}
                maxDepth={maxDepth}
                currentDepth={currentDepth + 1}
              />
            </Card>

            {/* Show logical operator between groups */}
            {conditionGroup.conditions.length + index < totalItems - 1 && hasMultipleItems && (
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <Radio.Group
                  value={conditionGroup.logicalOperator}
                  onChange={(e) => handleLogicalOperatorChange(e.target.value)}
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value="AND">VE (AND)</Radio.Button>
                  <Radio.Button value="OR">VEYA (OR)</Radio.Button>
                </Radio.Group>
              </div>
            )}
          </div>
        ))}

        {/* Add Buttons */}
        <Space>
          <Button type="dashed" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddCondition} block>
            Koşul Ekle
          </Button>

          {currentDepth < maxDepth && (
            <Button type="dashed" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddGroup}>
              Koşul Grubu Ekle
            </Button>
          )}
        </Space>

        {/* Empty State */}
        {totalItems === 0 && (
          <Alert
            type="info"
            message="Henüz koşul eklenmedi"
            description="Yukarıdaki butonları kullanarak koşul veya koşul grubu ekleyebilirsiniz."
          />
        )}

        {/* Depth limit warning */}
        {currentDepth >= maxDepth && (
          <Alert
            type="warning"
            message="Maksimum grup derinliğine ulaşıldı"
            description="Daha fazla iç içe grup ekleyemezsiniz."
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}
