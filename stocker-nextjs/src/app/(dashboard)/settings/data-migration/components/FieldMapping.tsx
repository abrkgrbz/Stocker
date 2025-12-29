'use client';

/**
 * Field Mapping Step
 * Map source fields to target fields with auto-suggestions
 */

import { useState, useEffect } from 'react';
import { Spinner } from '@/components/primitives';
import {
  GitMerge,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Info,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  useSaveMapping,
  useStartValidation,
  useAutoMappingSuggestions,
  entityTypeLabels,
  entityFields,
} from '@/lib/api/hooks/useMigration';
import type {
  MigrationSessionDto,
  MigrationEntityType,
  MappingConfigDto,
  FieldMappingDto,
  AutoMappingSuggestion,
} from '@/lib/api/services/migration.service';

interface FieldMappingProps {
  sessionId: string;
  session: MigrationSessionDto | undefined;
  onNext: () => void;
  onBack: () => void;
}

interface FieldMappingState {
  sourceField: string;
  targetField: string;
  confidence: number;
  isAutoMapped: boolean;
}

// Turkish field name patterns for auto-mapping
const TURKISH_FIELD_PATTERNS: Record<string, string[]> = {
  code: ['kod', 'kodu', 'code', 'no', 'numara'],
  name: ['ad', 'adi', 'adı', 'isim', 'ismi', 'name', 'tanim', 'tanım', 'tanımı'],
  taxNumber: ['vergi', 'vergino', 'vergi_no', 'vkn', 'tax', 'taxnumber'],
  email: ['email', 'eposta', 'e-posta', 'mail'],
  phone: ['tel', 'telefon', 'phone', 'gsm', 'cep'],
  address: ['adres', 'address', 'adr'],
  city: ['il', 'sehir', 'şehir', 'city'],
  district: ['ilce', 'ilçe', 'district'],
  country: ['ulke', 'ülke', 'country'],
  barcode: ['barkod', 'barcode', 'ean', 'upc'],
  price: ['fiyat', 'price', 'tutar', 'birimfiyat'],
  purchasePrice: ['alis', 'alış', 'alisfiyat', 'alış_fiyat', 'maliyet', 'cost'],
  salePrice: ['satis', 'satış', 'satısfiyat', 'satış_fiyat'],
  vatRate: ['kdv', 'vat', 'vergi_orani', 'kdvorani'],
  quantity: ['miktar', 'adet', 'qty', 'quantity', 'stok'],
  unit: ['birim', 'unit', 'olcu', 'ölçü'],
  category: ['kategori', 'category', 'grup', 'grup_kodu'],
  brand: ['marka', 'brand'],
  description: ['aciklama', 'açıklama', 'description', 'not', 'notlar'],
};

// Auto-map source field to target field
function autoMapField(sourceField: string, targetFields: { name: string }[]): { target: string; confidence: number } | null {
  const normalizedSource = sourceField.toLowerCase().replace(/[_\-\s]/g, '');

  for (const targetField of targetFields) {
    const patterns = TURKISH_FIELD_PATTERNS[targetField.name];
    if (patterns) {
      for (const pattern of patterns) {
        if (normalizedSource.includes(pattern) || pattern.includes(normalizedSource)) {
          return { target: targetField.name, confidence: 0.9 };
        }
      }
    }

    // Direct match
    if (normalizedSource === targetField.name.toLowerCase()) {
      return { target: targetField.name, confidence: 1.0 };
    }
  }

  return null;
}

export default function FieldMapping({ sessionId, session, onNext, onBack }: FieldMappingProps) {
  const [mappings, setMappings] = useState<Record<MigrationEntityType, FieldMappingState[]>>({} as any);
  const [expandedEntity, setExpandedEntity] = useState<MigrationEntityType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const saveMapping = useSaveMapping();
  const startValidation = useStartValidation();
  const autoMappingSuggestions = useAutoMappingSuggestions();

  // Initialize mappings when session is loaded
  useEffect(() => {
    if (session?.entities && session.entities.length > 0) {
      const initializeMappings = async () => {
        setIsLoadingSuggestions(true);
        const newMappings: Record<MigrationEntityType, FieldMappingState[]> = {} as any;

        for (const entityType of session.entities) {
          // Get target fields for this entity
          const targetFields = entityFields[entityType as MigrationEntityType] || [];

          try {
            // Try to get auto-mapping suggestions from backend
            const suggestions = await autoMappingSuggestions.mutateAsync({
              sessionId,
              entityType: entityType as MigrationEntityType,
            });

            if (suggestions && suggestions.length > 0) {
              // Use backend suggestions
              const entityMappings: FieldMappingState[] = suggestions.map((suggestion: AutoMappingSuggestion) => ({
                sourceField: suggestion.sourceField,
                targetField: suggestion.suggestedTarget,
                confidence: suggestion.confidence,
                isAutoMapped: suggestion.confidence > 0.5,
              }));
              newMappings[entityType as MigrationEntityType] = entityMappings;
            } else {
              // Fall back to using target fields as source fields with local auto-mapping
              const sourceFields = targetFields.map(f => f.name);
              const entityMappings: FieldMappingState[] = sourceFields.map(sourceField => {
                const autoMap = autoMapField(sourceField, targetFields);
                return {
                  sourceField,
                  targetField: autoMap?.target || '',
                  confidence: autoMap?.confidence || 0,
                  isAutoMapped: !!autoMap,
                };
              });
              newMappings[entityType as MigrationEntityType] = entityMappings;
            }
          } catch {
            // On error, fall back to using target fields as source fields with local auto-mapping
            const sourceFields = targetFields.map(f => f.name);
            const entityMappings: FieldMappingState[] = sourceFields.map(sourceField => {
              const autoMap = autoMapField(sourceField, targetFields);
              return {
                sourceField,
                targetField: autoMap?.target || '',
                confidence: autoMap?.confidence || 0,
                isAutoMapped: !!autoMap,
              };
            });
            newMappings[entityType as MigrationEntityType] = entityMappings;
          }
        }

        setMappings(newMappings);
        setIsLoadingSuggestions(false);

        // Expand first entity by default
        if (session.entities.length > 0) {
          setExpandedEntity(session.entities[0] as MigrationEntityType);
        }
      };

      initializeMappings();
    }
  }, [sessionId, session?.entities]);

  // Update field mapping
  const updateMapping = (entityType: MigrationEntityType, sourceField: string, targetField: string) => {
    setMappings(prev => ({
      ...prev,
      [entityType]: prev[entityType]?.map(m =>
        m.sourceField === sourceField
          ? { ...m, targetField, isAutoMapped: false }
          : m
      ) || [],
    }));
  };

  // Reset mappings to auto-mapped values
  const resetMappings = (entityType: MigrationEntityType) => {
    const targetFields = entityFields[entityType] || [];

    setMappings(prev => ({
      ...prev,
      [entityType]: prev[entityType]?.map(m => {
        const autoMap = autoMapField(m.sourceField, targetFields);
        return {
          ...m,
          targetField: autoMap?.target || '',
          confidence: autoMap?.confidence || 0,
          isAutoMapped: true,
        };
      }) || [],
    }));
  };

  // Check if all required fields are mapped
  const getUnmappedRequiredFields = (entityType: MigrationEntityType): string[] => {
    const targetFields = entityFields[entityType] || [];
    const entityMappings = mappings[entityType] || [];

    const mappedTargets = new Set(entityMappings.map(m => m.targetField).filter(Boolean));
    const requiredFields = targetFields.filter(f => f.required);

    return requiredFields
      .filter(f => !mappedTargets.has(f.name))
      .map(f => f.name);
  };

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    setIsProcessing(true);

    try {
      // Convert mappings to API format
      const mappingConfigs: MappingConfigDto[] = Object.entries(mappings).map(([entityType, fieldMappings]) => ({
        entityType: entityType as MigrationEntityType,
        fieldMappings: fieldMappings
          .filter(m => m.targetField)
          .map(m => ({
            sourceField: m.sourceField,
            targetField: m.targetField,
            isRequired: entityFields[entityType as MigrationEntityType]?.find(f => f.name === m.targetField)?.required || false,
          })),
        autoMapped: fieldMappings.every(m => m.isAutoMapped),
        confidence: fieldMappings.reduce((sum, m) => sum + m.confidence, 0) / fieldMappings.length,
      }));

      // Save mappings
      await saveMapping.mutateAsync({
        sessionId,
        mappings: mappingConfigs,
      });

      // Start validation
      await startValidation.mutateAsync(sessionId);

      onNext();
    } catch {
      // Error handled by mutations
    } finally {
      setIsProcessing(false);
    }
  };

  // Check overall mapping status
  const hasAllRequiredMapped = session?.entities.every(entityType => {
    const unmapped = getUnmappedRequiredFields(entityType as MigrationEntityType);
    return unmapped.length === 0;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-900 mb-1">Otomatik Alan Eşleme</p>
            <p>
              Sistem, dosyalarınızdaki alan isimlerini analiz ederek hedef alanlarla otomatik eşledi.
              Gerekirse eşlemeleri manuel olarak düzenleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingSuggestions && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
          <span className="ml-3 text-sm text-slate-600">Alan eşlemeleri yükleniyor...</span>
        </div>
      )}

      {/* Entity Mapping Cards */}
      {!isLoadingSuggestions && (
      <div className="space-y-3">
        {session?.entities.map((entityType) => {
          const entityMappings = mappings[entityType as MigrationEntityType] || [];
          const targetFields = entityFields[entityType as MigrationEntityType] || [];
          const unmappedRequired = getUnmappedRequiredFields(entityType as MigrationEntityType);
          const isExpanded = expandedEntity === entityType;
          const mappedCount = entityMappings.filter(m => m.targetField).length;
          const autoMappedCount = entityMappings.filter(m => m.isAutoMapped && m.targetField).length;

          return (
            <div
              key={entityType}
              className={`border rounded-lg overflow-hidden transition-all ${
                unmappedRequired.length > 0
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedEntity(isExpanded ? null : entityType as MigrationEntityType)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {unmappedRequired.length > 0 ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{entityTypeLabels[entityType as MigrationEntityType]}</p>
                    <p className="text-xs text-slate-500">
                      {mappedCount} / {entityMappings.length} alan eşlendi
                      {autoMappedCount > 0 && (
                        <span className="text-amber-600"> • {autoMappedCount} otomatik</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unmappedRequired.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      {unmappedRequired.length} zorunlu alan eksik
                    </span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Mapping Table */}
              {isExpanded && (
                <div className="border-t border-slate-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-slate-500">
                        Kaynak → Hedef alan eşlemeleri
                      </div>
                      <button
                        onClick={() => resetMappings(entityType)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Sıfırla
                      </button>
                    </div>

                    <div className="space-y-2">
                      {entityMappings.map((mapping, index) => {
                        const targetField = targetFields.find(f => f.name === mapping.targetField);
                        const isRequired = targetField?.required || false;
                        const isMapped = !!mapping.targetField;

                        return (
                          <div
                            key={mapping.sourceField}
                            className={`flex items-center gap-3 p-2 rounded-md ${
                              !isMapped && isRequired
                                ? 'bg-amber-50'
                                : mapping.isAutoMapped
                                  ? 'bg-blue-50'
                                  : 'bg-slate-50'
                            }`}
                          >
                            {/* Source Field */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900 truncate">
                                  {mapping.sourceField}
                                </span>
                                {mapping.isAutoMapped && mapping.confidence > 0.8 && (
                                  <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                )}
                              </div>
                            </div>

                            {/* Arrow */}
                            <GitMerge className="w-4 h-4 text-slate-400 flex-shrink-0" />

                            {/* Target Field Select */}
                            <div className="flex-1 min-w-0">
                              <select
                                value={mapping.targetField}
                                onChange={(e) => updateMapping(entityType, mapping.sourceField, e.target.value)}
                                className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                                  !isMapped
                                    ? 'border-amber-300 bg-white'
                                    : 'border-slate-200 bg-white'
                                }`}
                              >
                                <option value="">-- Eşleme Yok --</option>
                                {targetFields.map(field => (
                                  <option key={field.name} value={field.name}>
                                    {field.name} {field.required && '*'}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Field Type */}
                            {targetField && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-600 rounded flex-shrink-0">
                                {targetField.type}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Unmapped Required Fields Warning */}
                    {unmappedRequired.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-100 rounded-md">
                        <div className="flex gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-800">
                            <p className="font-medium mb-1">Zorunlu alanlar eşlenmedi:</p>
                            <p>{unmappedRequired.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Geri
        </button>
        <button
          onClick={handleSaveAndContinue}
          disabled={!hasAllRequiredMapped || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <Spinner size="sm" />
              İşleniyor...
            </>
          ) : (
            <>
              Doğrulamaya Devam Et
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
