'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Divider,
  Modal,
  Upload,
  Image,
  Empty,
  message,
} from 'antd';
import type { UploadFile, RcFile } from 'antd/es/upload';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  WarningOutlined,
  BarcodeOutlined,
  TagOutlined,
  PlusOutlined,
  PictureOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  useProduct,
  useDeleteProduct,
  useActivateProduct,
  useDeactivateProduct,
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useSetProductImageAsPrimary,
} from '@/lib/api/hooks/useInventory';
import type { ProductType, ProductImageDto } from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;

const productTypeConfig: Record<ProductType, { color: string; label: string }> = {
  Raw: { color: 'blue', label: 'Hammadde' },
  SemiFinished: { color: 'cyan', label: 'Yarı Mamul' },
  Finished: { color: 'green', label: 'Mamul' },
  Service: { color: 'purple', label: 'Hizmet' },
  Consumable: { color: 'orange', label: 'Sarf Malzeme' },
  FixedAsset: { color: 'gold', label: 'Duran Varlık' },
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: images = [], isLoading: imagesLoading } = useProductImages(productId);
  const deleteProduct = useDeleteProduct();
  const activateProduct = useActivateProduct();
  const deactivateProduct = useDeactivateProduct();
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const setPrimaryImage = useSetProductImageAsPrimary();

  const handleUpload = async (file: RcFile) => {
    try {
      await uploadImage.mutateAsync({
        productId,
        file,
        options: { setAsPrimary: images.length === 0 },
      });
    } catch (error) {
      // Error handled by hook
    }
    return false; // Prevent default upload behavior
  };

  const handleDeleteImage = async (imageId: number) => {
    Modal.confirm({
      title: 'Resmi Sil',
      content: 'Bu resmi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteImage.mutateAsync({ productId, imageId });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await setPrimaryImage.mutateAsync({ productId, imageId });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = () => {
    if (!product) return;
    Modal.confirm({
      title: 'Ürünü Sil',
      content: `"${product.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteProduct.mutateAsync(productId);
          router.push('/inventory/products');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!product) return;
    try {
      if (product.isActive) {
        await deactivateProduct.mutateAsync(productId);
      } else {
        await activateProduct.mutateAsync(productId);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <Alert
          message="Ürün Bulunamadı"
          description="İstenen ürün bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/products')}>
              Ürünlere Dön
            </Button>
          }
        />
      </div>
    );
  }

  const typeConfig = productTypeConfig[product.productType] || { color: 'default', label: product.productType };
  const isLowStock = product.totalStockQuantity < product.minStockLevel;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Geri
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
              {product.isActive ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
              ) : (
                <Tag color="default" icon={<StopOutlined />}>Pasif</Tag>
              )}
            </div>
            <Text type="secondary">{product.code}</Text>
          </div>
        </div>
        <Space>
          <Button
            icon={product.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={handleToggleActive}
            loading={activateProduct.isPending || deactivateProduct.isPending}
          >
            {product.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/inventory/products/${productId}/edit`)}
          >
            Düzenle
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={deleteProduct.isPending}
          >
            Sil
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Stok"
              value={product.totalStockQuantity}
              valueStyle={isLowStock ? { color: '#fa8c16' } : undefined}
              suffix={isLowStock && <WarningOutlined className="text-orange-500 ml-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kullanılabilir Stok"
              value={product.availableStockQuantity}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Birim Fiyat"
              value={product.unitPrice || 0}
              prefix="₺"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Stok Değeri"
              value={(product.unitPrice || 0) * product.totalStockQuantity}
              prefix="₺"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Details */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Ürün Bilgileri">
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
              <Descriptions.Item label="Ürün Kodu">{product.code}</Descriptions.Item>
              <Descriptions.Item label="Ürün Türü">
                <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Barkod">
                {product.barcode ? (
                  <Space>
                    <BarcodeOutlined />
                    {product.barcode}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="SKU">{product.sku || '-'}</Descriptions.Item>
              <Descriptions.Item label="Kategori">
                {product.categoryName ? (
                  <Tag icon={<TagOutlined />}>{product.categoryName}</Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Marka">{product.brandName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Birim">{product.unitName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={2}>
                {product.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Stok Ayarları</Divider>

            <Descriptions column={{ xs: 1, sm: 2, md: 4 }} bordered>
              <Descriptions.Item label="Min. Stok">{product.minStockLevel}</Descriptions.Item>
              <Descriptions.Item label="Maks. Stok">{product.maxStockLevel}</Descriptions.Item>
              <Descriptions.Item label="Yeniden Sipariş">{product.reorderLevel}</Descriptions.Item>
              <Descriptions.Item label="Sipariş Miktarı">{product.reorderQuantity}</Descriptions.Item>
              <Descriptions.Item label="Tedarik Süresi">{product.leadTimeDays} gün</Descriptions.Item>
              <Descriptions.Item label="Seri No Takibi">
                {product.trackSerialNumbers ? <Tag color="success">Evet</Tag> : <Tag>Hayır</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Lot Takibi">
                {product.trackLotNumbers ? <Tag color="success">Evet</Tag> : <Tag>Hayır</Tag>}
              </Descriptions.Item>
            </Descriptions>

            {(product.weight || product.length || product.width || product.height) && (
              <>
                <Divider>Fiziksel Özellikler</Divider>
                <Descriptions column={{ xs: 1, sm: 2, md: 4 }} bordered>
                  {product.weight && (
                    <Descriptions.Item label="Ağırlık">
                      {product.weight} {product.weightUnit || 'kg'}
                    </Descriptions.Item>
                  )}
                  {product.length && (
                    <Descriptions.Item label="Uzunluk">
                      {product.length} {product.dimensionUnit || 'cm'}
                    </Descriptions.Item>
                  )}
                  {product.width && (
                    <Descriptions.Item label="Genişlik">
                      {product.width} {product.dimensionUnit || 'cm'}
                    </Descriptions.Item>
                  )}
                  {product.height && (
                    <Descriptions.Item label="Yükseklik">
                      {product.height} {product.dimensionUnit || 'cm'}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Product Images */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <PictureOutlined />
                <span>Ürün Görselleri</span>
                <Tag>{images.length}</Tag>
              </div>
            }
            className="mb-4"
          >
            {imagesLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : images.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Henüz görsel eklenmedi"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || product.name}
                      style={{ width: '100%', height: 96, objectFit: 'cover', cursor: 'pointer' }}
                      preview={{
                        mask: (
                          <div className="flex items-center justify-center gap-2">
                            {!img.isPrimary && (
                              <Button
                                type="text"
                                size="small"
                                icon={<StarOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimary(img.id);
                                }}
                                style={{ color: 'white' }}
                                title="Ana görsel yap"
                              />
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(img.id);
                              }}
                              style={{ color: 'white' }}
                              title="Sil"
                            />
                          </div>
                        ),
                      }}
                    />
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 z-10">
                        <Tag color="gold" icon={<StarFilled />} className="text-xs">
                          Ana
                        </Tag>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleUpload}
              disabled={uploadImage.isPending}
            >
              <Button
                icon={<PlusOutlined />}
                loading={uploadImage.isPending}
                block
              >
                Görsel Ekle
              </Button>
            </Upload>
          </Card>

          <Card title="Fiyatlandırma" className="mb-4">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Birim Fiyat">
                {product.unitPrice ? (
                  <>₺{product.unitPrice.toLocaleString('tr-TR')} {product.unitPriceCurrency}</>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Maliyet">
                {product.costPrice ? (
                  <>₺{product.costPrice.toLocaleString('tr-TR')} {product.costPriceCurrency}</>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Tarihler">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Oluşturulma">
                {new Date(product.createdAt).toLocaleString('tr-TR')}
              </Descriptions.Item>
              {product.updatedAt && (
                <Descriptions.Item label="Son Güncelleme">
                  {new Date(product.updatedAt).toLocaleString('tr-TR')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
