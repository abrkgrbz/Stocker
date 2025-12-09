'use client';

import React from 'react';
import { Card, Progress, Skeleton, Typography, Space, Tooltip, Button, Tag } from 'antd';
import {
  CloudOutlined,
  DatabaseOutlined,
  FileOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useStorageUsage, formatBytes, getStorageStatus } from '@/lib/api/hooks/useStorage';

const { Text, Title } = Typography;

interface StorageUsageCardProps {
  showDetails?: boolean;
  className?: string;
}

export default function StorageUsageCard({ showDetails = true, className = '' }: StorageUsageCardProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useStorageUsage();

  if (isLoading) {
    return (
      <Card className={`shadow-sm ${className}`}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (isError) {
    const errorMessage = error?.message || 'Depolama bilgisi alınamadı';
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('bulunamadı');

    return (
      <Card className={`shadow-sm ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-orange-50 rounded-full mb-4">
            <WarningOutlined className="text-3xl text-orange-500" />
          </div>
          <Title level={5} className="!mb-2 !text-gray-700">
            {isNotFound ? 'Depolama Alanı Henüz Oluşturulmamış' : 'Depolama Bilgisi Alınamadı'}
          </Title>
          <Text className="text-gray-500 mb-4">
            {isNotFound
              ? 'Depolama alanınız ilk dosya yüklemesinde otomatik olarak oluşturulacaktır.'
              : errorMessage
            }
          </Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Tekrar Dene
          </Button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { status, label, color } = getStorageStatus(data.usagePercentage);
  const usedFormatted = formatBytes(data.usedBytes);
  const quotaFormatted = `${data.quotaGB} GB`;
  const availableFormatted = formatBytes(data.availableBytes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`shadow-sm ${className}`}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CloudOutlined className="text-xl text-blue-600" />
              </div>
              <div>
                <Text className="font-semibold text-gray-800">Depolama Kullanımı</Text>
                <div className="text-xs text-gray-500">MinIO Object Storage</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag
                icon={status === 'success' ? <CheckCircleOutlined /> : <WarningOutlined />}
                color={status}
              >
                {label}
              </Tag>
              <Tooltip title="Yenile">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={isFetching} />}
                  onClick={() => refetch()}
                />
              </Tooltip>
            </div>
          </div>
        }
      >
        {/* Main Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold" style={{ color }}>
                {data.usagePercentage.toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-2">kullanıldı</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-700">
                {usedFormatted}
              </div>
              <div className="text-sm text-gray-500">
                / {quotaFormatted}
              </div>
            </div>
          </div>

          <Progress
            percent={data.usagePercentage}
            showInfo={false}
            strokeColor={color}
            trailColor="#f0f0f0"
            strokeWidth={12}
            className="!mb-0"
          />
        </div>

        {/* Stats Grid */}
        {showDetails && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="p-2 bg-green-50 rounded-lg inline-block mb-2">
                <DatabaseOutlined className="text-lg text-green-600" />
              </div>
              <div className="text-sm font-semibold text-gray-700">{quotaFormatted}</div>
              <div className="text-xs text-gray-500">Toplam Kota</div>
            </div>

            <div className="text-center">
              <div className="p-2 bg-blue-50 rounded-lg inline-block mb-2">
                <CloudOutlined className="text-lg text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-700">{usedFormatted}</div>
              <div className="text-xs text-gray-500">Kullanılan</div>
            </div>

            <div className="text-center">
              <div className="p-2 bg-purple-50 rounded-lg inline-block mb-2">
                <FileOutlined className="text-lg text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-gray-700">{data.objectCount.toLocaleString('tr-TR')}</div>
              <div className="text-xs text-gray-500">Dosya Sayısı</div>
            </div>
          </div>
        )}

        {/* Available Space Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <InfoCircleOutlined className="text-gray-400" />
            <Text className="text-sm text-gray-600">
              <span className="font-medium" style={{ color }}>{availableFormatted}</span> kullanılabilir alan kaldı
            </Text>
          </div>
        </div>

        {/* Warning for high usage */}
        {data.usagePercentage >= 90 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <WarningOutlined className="text-red-500 mt-0.5" />
              <div>
                <Text className="text-sm text-red-700 font-medium">
                  Depolama alanınız dolmak üzere!
                </Text>
                <Text className="text-xs text-red-600 block mt-1">
                  Dosya yükleyebilmek için depolama paketinizi yükseltmeniz gerekebilir.
                </Text>
              </div>
            </div>
          </div>
        )}

        {data.usagePercentage >= 70 && data.usagePercentage < 90 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <WarningOutlined className="text-yellow-600 mt-0.5" />
              <div>
                <Text className="text-sm text-yellow-700 font-medium">
                  Depolama alanınız azalıyor
                </Text>
                <Text className="text-xs text-yellow-600 block mt-1">
                  Gereksiz dosyaları temizlemeyi veya paketinizi yükseltmeyi düşünebilirsiniz.
                </Text>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
