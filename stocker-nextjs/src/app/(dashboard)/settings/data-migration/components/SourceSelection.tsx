'use client';

/**
 * Source Selection Step
 * Select data source type and entities to migrate
 */

import { useState } from 'react';
import { Spinner } from '@/components/primitives';
import {
  FileSpreadsheet,
  Building2,
  Database,
  Users,
  Package,
  Warehouse,
  Tag,
  Layers,
  Scale,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  BarChart3,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  useCreateSession,
  sourceTypeLabels,
  entityTypeLabels,
} from '@/lib/api/hooks/useMigration';
import type {
  MigrationSourceType,
  MigrationEntityType,
} from '@/lib/api/services/migration.service';

interface SourceSelectionProps {
  onSessionCreated: (sessionId: string) => void;
  onCancel: () => void;
}

// Source type configurations
const SOURCE_TYPES: { type: MigrationSourceType; icon: React.ComponentType<{ className?: string }>; description: string; color: string }[] = [
  { type: 'Excel', icon: FileSpreadsheet, description: 'Excel veya CSV dosyası', color: 'text-emerald-600 bg-emerald-50' },
  { type: 'Logo', icon: Building2, description: 'Logo Tiger / Go', color: 'text-blue-600 bg-blue-50' },
  { type: 'ETA', icon: Database, description: 'ETA SQL', color: 'text-purple-600 bg-purple-50' },
  { type: 'Mikro', icon: Database, description: 'Mikro', color: 'text-orange-600 bg-orange-50' },
  { type: 'Netsis', icon: Database, description: 'Netsis', color: 'text-cyan-600 bg-cyan-50' },
  { type: 'Parasut', icon: Building2, description: 'Paraşüt', color: 'text-pink-600 bg-pink-50' },
  { type: 'Other', icon: Database, description: 'Diğer sistemler', color: 'text-slate-600 bg-slate-50' },
];

// Entity type configurations with grouping
const ENTITY_GROUPS: { label: string; entities: { type: MigrationEntityType; icon: React.ComponentType<{ className?: string }>; description: string }[] }[] = [
  {
    label: 'Temel Veriler',
    entities: [
      { type: 'Category', icon: Layers, description: 'Ürün kategorileri' },
      { type: 'Brand', icon: Tag, description: 'Markalar' },
      { type: 'Unit', icon: Scale, description: 'Ölçü birimleri' },
      { type: 'Warehouse', icon: Warehouse, description: 'Depolar' },
    ],
  },
  {
    label: 'Ürünler',
    entities: [
      { type: 'Product', icon: Package, description: 'Ürün kartları' },
      { type: 'PriceList', icon: DollarSign, description: 'Fiyat listeleri' },
    ],
  },
  {
    label: 'Cari Hesaplar',
    entities: [
      { type: 'Customer', icon: Users, description: 'Müşteriler' },
      { type: 'Supplier', icon: Building2, description: 'Tedarikçiler' },
      { type: 'Contact', icon: Phone, description: 'İlgili kişiler' },
      { type: 'Address', icon: MapPin, description: 'Adresler' },
      { type: 'BankAccount', icon: CreditCard, description: 'Banka hesapları' },
    ],
  },
  {
    label: 'Stok Verileri',
    entities: [
      { type: 'OpeningBalance', icon: BarChart3, description: 'Açılış stokları' },
      { type: 'StockMovement', icon: TrendingUp, description: 'Stok hareketleri' },
    ],
  },
];

export default function SourceSelection({ onSessionCreated, onCancel }: SourceSelectionProps) {
  const [selectedSource, setSelectedSource] = useState<MigrationSourceType | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<MigrationEntityType[]>([]);
  const [sourceName, setSourceName] = useState('');

  const createSession = useCreateSession();

  // Toggle entity selection
  const toggleEntity = (entity: MigrationEntityType) => {
    setSelectedEntities(prev =>
      prev.includes(entity)
        ? prev.filter(e => e !== entity)
        : [...prev, entity]
    );
  };

  // Select all entities in a group
  const selectGroup = (entities: { type: MigrationEntityType }[]) => {
    const groupTypes = entities.map(e => e.type);
    const allSelected = groupTypes.every(t => selectedEntities.includes(t));

    if (allSelected) {
      setSelectedEntities(prev => prev.filter(e => !groupTypes.includes(e)));
    } else {
      setSelectedEntities(prev => [...new Set([...prev, ...groupTypes])]);
    }
  };

  // Handle session creation
  const handleCreate = async () => {
    if (!selectedSource || selectedEntities.length === 0) return;

    try {
      const session = await createSession.mutateAsync({
        sourceType: selectedSource,
        sourceName: sourceName || sourceTypeLabels[selectedSource],
        entities: selectedEntities,
      });
      onSessionCreated(session.id);
    } catch {
      // Error handled by mutation
    }
  };

  const isValid = selectedSource && selectedEntities.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Source Type Selection */}
      <div>
        <h2 className="text-sm font-medium text-slate-900 mb-1">Veri Kaynağı</h2>
        <p className="text-xs text-slate-500 mb-4">Verilerinizin bulunduğu sistemi seçin</p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {SOURCE_TYPES.map(({ type, icon: Icon, description, color }) => (
            <button
              key={type}
              onClick={() => {
                setSelectedSource(type);
                if (!sourceName) {
                  setSourceName(sourceTypeLabels[type]);
                }
              }}
              className={`relative p-4 rounded-lg border-2 transition-all text-center ${
                selectedSource === type
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {selectedSource === type && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-900" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">{sourceTypeLabels[type]}</p>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Source Name */}
      {selectedSource && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Aktarım Adı
          </label>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Örn: Logo Tiger 2024 Verileri"
            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-400 mt-1">Bu aktarımı tanımlamak için bir isim verin</p>
        </div>
      )}

      {/* Entity Selection */}
      <div>
        <h2 className="text-sm font-medium text-slate-900 mb-1">Aktarılacak Veriler</h2>
        <p className="text-xs text-slate-500 mb-4">Aktarmak istediğiniz veri türlerini seçin</p>

        <div className="space-y-4">
          {ENTITY_GROUPS.map((group) => {
            const groupTypes = group.entities.map(e => e.type);
            const allSelected = groupTypes.every(t => selectedEntities.includes(t));
            const someSelected = groupTypes.some(t => selectedEntities.includes(t));

            return (
              <div key={group.label} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => selectGroup(group.entities)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-900">{group.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {groupTypes.filter(t => selectedEntities.includes(t)).length} / {groupTypes.length} seçili
                    </span>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        allSelected
                          ? 'bg-slate-900 border-slate-900'
                          : someSelected
                            ? 'bg-slate-400 border-slate-400'
                            : 'border-slate-300'
                      }`}
                    >
                      {(allSelected || someSelected) && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </button>

                <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {group.entities.map(({ type, icon: Icon, description }) => (
                    <button
                      key={type}
                      onClick={() => toggleEntity(type)}
                      className={`flex items-center gap-2 p-2 rounded-md border transition-all text-left ${
                        selectedEntities.includes(type)
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedEntities.includes(type)
                            ? 'bg-slate-900 border-slate-900'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedEntities.includes(type) && (
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{entityTypeLabels[type]}</p>
                        <p className="text-xs text-slate-500 truncate">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Aktarım Sırası Önemli</p>
            <p className="text-blue-700">
              Bazı veriler birbirine bağlıdır. Örneğin, ürünleri aktarmadan önce kategorileri ve birimleri aktarmanız gerekir.
              Sistem, verileri otomatik olarak doğru sırada aktaracaktır.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleCreate}
          disabled={!isValid || createSession.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createSession.isPending ? (
            <>
              <Spinner size="sm" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              Devam Et
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
