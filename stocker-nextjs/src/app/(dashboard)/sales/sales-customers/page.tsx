
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, Dropdown, MenuProps, Modal, message, Input } from 'antd';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    EllipsisHorizontalIcon,
    UsersIcon,
    TrashIcon,
    PencilIcon,
    BuildingOfficeIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button } from '@/components/primitives/buttons';
import { salesCustomerService, SalesCustomer } from '@/lib/api/services/salesCustomerService';

export default function SalesCustomersPage() {
    const router = useRouter();
    const [data, setData] = useState<SalesCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const customers = await salesCustomerService.getAll();
            setData(customers);
        } catch (error) {
            message.error('Müşteriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        Modal.confirm({
            title: 'Silme İşlemi',
            content: `"${name}" müşterisini silmek istediğinize emin misiniz?`,
            okText: 'Sil',
            cancelText: 'İptal',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await salesCustomerService.delete(id);
                    message.success('Müşteri silindi');
                    fetchCustomers();
                } catch (error) {
                    message.error('Silme işlemi başarısız');
                }
            }
        });
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'MÜŞTERİ',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: SalesCustomer) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{text}</div>
                        <div className="text-xs text-slate-500">{record.code}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'İLETİŞİM',
            key: 'contact',
            render: (_: any, record: SalesCustomer) => (
                <div className="space-y-1">
                    <div className="text-sm text-slate-700">{record.email || '-'}</div>
                    <div className="text-xs text-slate-500">{record.phone || '-'}</div>
                </div>
            ),
        },
        {
            title: 'KONUM',
            key: 'location',
            render: (_: any, record: SalesCustomer) => (
                <div className="flex items-center gap-1 text-slate-600">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{record.city || '-'}, {record.country || '-'}</span>
                </div>
            )
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
            render: (_: any, record: SalesCustomer) => {
                const items: MenuProps['items'] = [
                    {
                        key: 'edit',
                        label: 'Düzenle',
                        icon: <PencilIcon className="w-4 h-4" />,
                        onClick: () => router.push(`/sales/sales-customers/${record.id}/edit`)
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
                    <h1 className="text-2xl font-semibold text-slate-900">Satış Müşterileri</h1>
                    <p className="text-sm text-slate-500">Satış faturaları için müşteri yönetimi</p>
                </div>
                <Link href="/sales/sales-customers/new">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 border-none">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Yeni Müşteri
                    </Button>
                </Link>
            </div>

            {/* Stats - Optional placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <UsersIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 uppercase">Toplam Müşteri</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{data.length}</div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="mb-6 max-w-md">
                    <Input
                        prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                        placeholder="İsim veya kod ile ara..."
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
