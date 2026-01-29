
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, Dropdown, MenuProps, Modal, message, Input, Tag } from 'antd';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    EllipsisHorizontalIcon,
    ArchiveBoxIcon,
    TrashIcon,
    PencilIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button } from '@/components/primitives/buttons';
import { salesProductService, SalesProduct } from '@/lib/api/services/salesProductService';

export default function SalesProductsPage() {
    const router = useRouter();
    const [data, setData] = useState<SalesProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const products = await salesProductService.getAll();
            setData(products);
        } catch (error) {
            message.error('Ürünler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        Modal.confirm({
            title: 'Silme İşlemi',
            content: `"${name}" ürününü silmek istediğinize emin misiniz?`,
            okText: 'Sil',
            cancelText: 'İptal',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await salesProductService.delete(id);
                    message.success('Ürün silindi');
                    fetchProducts();
                } catch (error) {
                    message.error('Silme işlemi başarısız');
                }
            }
        });
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'ÜRÜN',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: SalesProduct) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ArchiveBoxIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{text}</div>
                        <div className="text-xs text-slate-500">{record.code}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'KATEGORİ',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => (
                text ? <Tag>{text}</Tag> : <span className="text-slate-400">-</span>
            )
        },
        {
            title: 'FİYAT',
            key: 'price',
            render: (_: any, record: SalesProduct) => (
                <div className="font-medium text-slate-900">
                    {record.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: record.currency })}
                </div>
            )
        },
        {
            title: 'BİRİM',
            dataIndex: 'unit',
            key: 'unit',
            render: (text: string) => <span className="text-slate-600">{text}</span>
        },
        {
            title: 'DURUM',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isActive ? 'Aktif' : 'Pasif'}
                </span>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            render: (_: any, record: SalesProduct) => {
                const items: MenuProps['items'] = [
                    {
                        key: 'edit',
                        label: 'Düzenle',
                        icon: <PencilIcon className="w-4 h-4" />,
                        onClick: () => router.push(`/sales/sales-products/${record.id}/edit`)
                    },
                    {
                        key: 'delete',
                        label: 'Sil',
                        icon: <TrashIcon className="w-4 h-4" />,
                        danger: true,
                        onClick: () => handleDelete(record.id, record.name)
                    }
                ];

                return (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button variant="ghost" className="px-2" icon={<EllipsisHorizontalIcon className="w-5 h-5 text-slate-400" />} />
                    </Dropdown>
                );
            }
        },
    ];

    return (
        <PageContainer maxWidth="7xl">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Satış Ürünleri</h1>
                    <p className="text-sm text-slate-500">Satış modülünde kullanılacak ürün ve hizmetler</p>
                </div>
                <Link href="/sales/sales-products/new">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 border-none">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Yeni Ürün
                    </Button>
                </Link>
            </div>

            {/* Content */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="mb-6 max-w-md">
                    <Input
                        prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                        placeholder="Ürün adı veya kodu ile ara..."
                        className="rounded-lg border-slate-300"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    className="enterprise-table"
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </PageContainer>
    );
}
