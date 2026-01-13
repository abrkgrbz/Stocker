'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Switch, Select, Table, InputNumber, Button, Card, Row, Col, Space } from 'antd';
import type { FormInstance } from 'antd';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useInventory';
import { useWorkCenters } from '@/lib/api/hooks/useManufacturing';
import type { CreateRoutingRequest, UpdateRoutingRequest, RoutingDto, RoutingOperationRequest } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

interface RoutingFormProps {
  form: FormInstance;
  initialValues?: RoutingDto;
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
}

interface OperationItem extends RoutingOperationRequest {
  key: string;
}

export function RoutingForm({ form, initialValues, onFinish, loading }: RoutingFormProps) {
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const { data: products = [] } = useProducts();
  const { data: workCenters = [] } = useWorkCenters({ activeOnly: true });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        productId: initialValues.productId,
        version: initialValues.version,
        description: initialValues.description,
        effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
        isDefault: initialValues.isDefault,
      });

      if (initialValues.operations) {
        setOperations(
          initialValues.operations.map((op, idx) => ({
            key: `op-${idx}`,
            operationNumber: op.operationNumber,
            workCenterId: op.workCenterId,
            operationName: op.operationName,
            description: op.description,
            setupTime: op.setupTime,
            runTime: op.runTime,
            waitTime: op.waitTime,
            moveTime: op.moveTime,
            overlapPercentage: op.overlapPercentage,
          }))
        );
      }
    } else {
      form.setFieldsValue({
        version: '1.0',
        effectiveDate: dayjs(),
        isDefault: false,
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: Record<string, unknown>) => {
    const submitData = {
      ...values,
      effectiveDate: (values.effectiveDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
      expiryDate: (values.expiryDate as dayjs.Dayjs)?.format('YYYY-MM-DD') || undefined,
      operations: operations.map(({ key, ...op }) => op),
    };
    onFinish(submitData);
  };

  const addOperation = () => {
    const nextNumber = operations.length > 0
      ? Math.max(...operations.map(o => o.operationNumber)) + 10
      : 10;

    setOperations([
      ...operations,
      {
        key: `op-${Date.now()}`,
        operationNumber: nextNumber,
        workCenterId: '',
        operationName: '',
        description: '',
        setupTime: 0,
        runTime: 0,
        waitTime: 0,
        moveTime: 0,
        overlapPercentage: 0,
      },
    ]);
  };

  const removeOperation = (key: string) => {
    setOperations(operations.filter(op => op.key !== key));
  };

  const updateOperation = (key: string, field: keyof RoutingOperationRequest, value: unknown) => {
    setOperations(operations.map(op =>
      op.key === key ? { ...op, [field]: value } : op
    ));
  };

  const moveOperation = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= operations.length) return;

    const newOperations = [...operations];
    [newOperations[index], newOperations[newIndex]] = [newOperations[newIndex], newOperations[index]];
    setOperations(newOperations);
  };

  const operationColumns = [
    {
      title: 'Sıra',
      dataIndex: 'operationNumber',
      key: 'operationNumber',
      width: 80,
      render: (_: unknown, record: OperationItem) => (
        <InputNumber
          min={1}
          value={record.operationNumber}
          onChange={(v) => updateOperation(record.key, 'operationNumber', v || 1)}
          className="!w-full"
          size="small"
        />
      ),
    },
    {
      title: 'İş Merkezi',
      dataIndex: 'workCenterId',
      key: 'workCenterId',
      width: 180,
      render: (_: unknown, record: OperationItem) => (
        <Select
          value={record.workCenterId || undefined}
          onChange={(v) => updateOperation(record.key, 'workCenterId', v)}
          placeholder="Seçiniz"
          options={workCenters.map(wc => ({ value: wc.id, label: `${wc.code} - ${wc.name}` }))}
          className="!w-full"
          size="small"
        />
      ),
    },
    {
      title: 'Operasyon Adı',
      dataIndex: 'operationName',
      key: 'operationName',
      width: 180,
      render: (_: unknown, record: OperationItem) => (
        <Input
          value={record.operationName}
          onChange={(e) => updateOperation(record.key, 'operationName', e.target.value)}
          placeholder="Operasyon adı"
          size="small"
        />
      ),
    },
    {
      title: 'Hazırlık (dk)',
      dataIndex: 'setupTime',
      key: 'setupTime',
      width: 100,
      render: (_: unknown, record: OperationItem) => (
        <InputNumber
          min={0}
          value={record.setupTime}
          onChange={(v) => updateOperation(record.key, 'setupTime', v || 0)}
          className="!w-full"
          size="small"
        />
      ),
    },
    {
      title: 'Çalışma (dk)',
      dataIndex: 'runTime',
      key: 'runTime',
      width: 100,
      render: (_: unknown, record: OperationItem) => (
        <InputNumber
          min={0}
          value={record.runTime}
          onChange={(v) => updateOperation(record.key, 'runTime', v || 0)}
          className="!w-full"
          size="small"
        />
      ),
    },
    {
      title: 'Bekleme (dk)',
      dataIndex: 'waitTime',
      key: 'waitTime',
      width: 100,
      render: (_: unknown, record: OperationItem) => (
        <InputNumber
          min={0}
          value={record.waitTime}
          onChange={(v) => updateOperation(record.key, 'waitTime', v || 0)}
          className="!w-full"
          size="small"
        />
      ),
    },
    {
      title: 'Taşıma (dk)',
      dataIndex: 'moveTime',
      key: 'moveTime',
      width: 100,
      render: (_: unknown, record: OperationItem) => (
        <InputNumber
          min={0}
          value={record.moveTime}
          onChange={(v) => updateOperation(record.key, 'moveTime', v || 0)}
          className="!w-full"
          size="small"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: OperationItem, index: number) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<ArrowUpIcon className="w-3 h-3" />}
            onClick={() => moveOperation(index, 'up')}
            disabled={index === 0}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownIcon className="w-3 h-3" />}
            onClick={() => moveOperation(index, 'down')}
            disabled={index === operations.length - 1}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<TrashIcon className="w-3 h-3" />}
            onClick={() => removeOperation(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="max-w-6xl"
    >
      {/* Temel Bilgiler */}
      <Card
        title="Temel Bilgiler"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="productId"
              label="Ürün"
              rules={[{ required: true, message: 'Ürün seçiniz' }]}
            >
              <Select
                showSearch
                placeholder="Ürün seçiniz"
                optionFilterProp="label"
                options={products.map(p => ({ value: p.id.toString(), label: `${p.code} - ${p.name}` }))}
                disabled={!!initialValues}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="version"
              label="Versiyon"
              rules={[{ required: true, message: 'Versiyon gereklidir' }]}
            >
              <Input
                placeholder="1.0"
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="isDefault"
              label="Varsayılan Rota"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="effectiveDate"
              label="Geçerlilik Başlangıcı"
              rules={[{ required: true, message: 'Başlangıç tarihi gereklidir' }]}
            >
              <DatePicker
                className="!w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="expiryDate"
              label="Geçerlilik Bitişi"
            >
              <DatePicker
                className="!w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="description"
              label="Açıklama"
            >
              <Input
                placeholder="Rota açıklaması..."
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Operasyonlar */}
      <Card
        title="Operasyonlar"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
        extra={
          <Button
            type="dashed"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={addOperation}
            size="small"
          >
            Operasyon Ekle
          </Button>
        }
      >
        <Table
          columns={operationColumns}
          dataSource={operations}
          rowKey="key"
          pagination={false}
          scroll={{ x: 1000 }}
          size="small"
          locale={{
            emptyText: 'Operasyon eklemek için butona tıklayın',
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
        />

        {operations.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-slate-500">Toplam Hazırlık: </span>
                <span className="font-semibold text-slate-900">
                  {operations.reduce((sum, op) => sum + (op.setupTime || 0), 0)} dk
                </span>
              </div>
              <div>
                <span className="text-slate-500">Toplam Çalışma: </span>
                <span className="font-semibold text-slate-900">
                  {operations.reduce((sum, op) => sum + (op.runTime || 0), 0)} dk
                </span>
              </div>
              <div>
                <span className="text-slate-500">Toplam Bekleme: </span>
                <span className="font-semibold text-slate-900">
                  {operations.reduce((sum, op) => sum + (op.waitTime || 0), 0)} dk
                </span>
              </div>
              <div>
                <span className="text-slate-500">Toplam Taşıma: </span>
                <span className="font-semibold text-slate-900">
                  {operations.reduce((sum, op) => sum + (op.moveTime || 0), 0)} dk
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </Form>
  );
}
