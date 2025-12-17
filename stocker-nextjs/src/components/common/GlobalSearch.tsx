'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from 'antd';
import {
  Search,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  BarChart3,
  Building2,
  ArrowRight,
  Command,
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
}

// Quick navigation items
const quickLinks: SearchItem[] = [
  // CRM
  { id: 'customers', title: 'Müşteriler', description: 'Müşteri listesi ve yönetimi', icon: <Users className="w-4 h-4" />, href: '/crm/customers', category: 'CRM' },
  { id: 'leads', title: 'Potansiyeller', description: 'Potansiyel müşteriler', icon: <Users className="w-4 h-4" />, href: '/crm/leads', category: 'CRM' },
  { id: 'opportunities', title: 'Fırsatlar', description: 'Satış fırsatları', icon: <BarChart3 className="w-4 h-4" />, href: '/crm/opportunities', category: 'CRM' },
  { id: 'deals', title: 'Anlaşmalar', description: 'Anlaşma yönetimi', icon: <FileText className="w-4 h-4" />, href: '/crm/deals', category: 'CRM' },

  // Inventory
  { id: 'products', title: 'Ürünler', description: 'Ürün kataloğu', icon: <Package className="w-4 h-4" />, href: '/inventory/products', category: 'Stok' },
  { id: 'warehouses', title: 'Depolar', description: 'Depo yönetimi', icon: <Building2 className="w-4 h-4" />, href: '/inventory/warehouses', category: 'Stok' },
  { id: 'stock-movements', title: 'Stok Hareketleri', description: 'Giriş/çıkış takibi', icon: <ShoppingCart className="w-4 h-4" />, href: '/inventory/stock-movements', category: 'Stok' },

  // Sales
  { id: 'sales-orders', title: 'Satış Siparişleri', description: 'Sipariş yönetimi', icon: <ShoppingCart className="w-4 h-4" />, href: '/sales/orders', category: 'Satış' },
  { id: 'sales-invoices', title: 'Satış Faturaları', description: 'Fatura yönetimi', icon: <FileText className="w-4 h-4" />, href: '/sales/invoices', category: 'Satış' },

  // Purchase
  { id: 'purchase-orders', title: 'Satın Alma Siparişleri', description: 'Tedarik siparişleri', icon: <ShoppingCart className="w-4 h-4" />, href: '/purchase/orders', category: 'Satın Alma' },
  { id: 'suppliers', title: 'Tedarikçiler', description: 'Tedarikçi listesi', icon: <Building2 className="w-4 h-4" />, href: '/purchase/suppliers', category: 'Satın Alma' },

  // Settings
  { id: 'settings', title: 'Ayarlar', description: 'Sistem ayarları', icon: <Settings className="w-4 h-4" />, href: '/settings', category: 'Sistem' },
  { id: 'users', title: 'Kullanıcılar', description: 'Kullanıcı yönetimi', icon: <Users className="w-4 h-4" />, href: '/settings/users', category: 'Sistem' },
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search query
  const filteredItems = searchQuery.trim()
    ? quickLinks.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickLinks;

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  // Flatten for keyboard navigation
  const flatItems = Object.values(groupedItems).flat();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            router.push(flatItems[selectedIndex].href);
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [flatItems, selectedIndex, router, onClose]
  );

  const handleItemClick = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={560}
      centered
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
        },
        mask: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <div className="bg-white" onKeyDown={handleKeyDown}>
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Sayfa veya özellik ara..."
            className="flex-1 text-base text-slate-900 placeholder-slate-400 outline-none bg-transparent"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sonuç bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">Farklı bir arama terimi deneyin</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-4 py-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {category}
                  </span>
                </div>
                {items.map((item) => {
                  const itemIndex = flatItems.findIndex((i) => i.id === item.id);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.href)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}
                        `}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500 truncate">{item.description}</div>
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd>
              <span className="ml-1">Gezin</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Enter</kbd>
              <span className="ml-1">Aç</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Command className="w-3 h-3" />
            <span>Stocker Arama</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
