import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Modal,
    TextInput,
    ViewStyle,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import {
    X,
    Filter,
    ChevronDown,
    Check,
    Calendar,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

// Types
export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'search';
    options?: FilterOption[];
    placeholder?: string;
}

export interface FilterValues {
    [key: string]: string | string[] | { start?: string; end?: string } | undefined;
}

interface FilterSheetProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterConfig[];
    values: FilterValues;
    onChange: (values: FilterValues) => void;
    onReset: () => void;
    title?: string;
}

export function FilterSheet({
    visible,
    onClose,
    filters,
    values,
    onChange,
    onReset,
    title = 'Filtreler',
}: FilterSheetProps) {
    const { colors } = useTheme();
    const [localValues, setLocalValues] = useState<FilterValues>(values);
    const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

    // Sync local values when modal opens
    React.useEffect(() => {
        if (visible) {
            setLocalValues(values);
        }
    }, [visible, values]);

    const handleApply = () => {
        onChange(localValues);
        onClose();
    };

    const handleReset = () => {
        const emptyValues: FilterValues = {};
        filters.forEach(f => {
            if (f.type === 'multiselect') {
                emptyValues[f.key] = [];
            } else if (f.type === 'daterange') {
                emptyValues[f.key] = { start: undefined, end: undefined };
            } else {
                emptyValues[f.key] = undefined;
            }
        });
        setLocalValues(emptyValues);
        onReset();
        onClose();
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        Object.entries(localValues).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) count++;
            else if (typeof value === 'object' && value !== null) {
                const dateRange = value as { start?: string; end?: string };
                if (dateRange.start || dateRange.end) count++;
            } else if (value) count++;
        });
        return count;
    }, [localValues]);

    const renderFilter = (filter: FilterConfig) => {
        const isExpanded = expandedFilter === filter.key;
        const currentValue = localValues[filter.key];

        switch (filter.type) {
            case 'select':
                return (
                    <SelectFilter
                        key={filter.key}
                        filter={filter}
                        value={currentValue as string | undefined}
                        onChange={(val) => setLocalValues(prev => ({ ...prev, [filter.key]: val }))}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedFilter(isExpanded ? null : filter.key)}
                        colors={colors}
                    />
                );
            case 'multiselect':
                return (
                    <MultiSelectFilter
                        key={filter.key}
                        filter={filter}
                        value={(currentValue as string[]) || []}
                        onChange={(val) => setLocalValues(prev => ({ ...prev, [filter.key]: val }))}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedFilter(isExpanded ? null : filter.key)}
                        colors={colors}
                    />
                );
            case 'daterange':
                return (
                    <DateRangeFilter
                        key={filter.key}
                        filter={filter}
                        value={(currentValue as { start?: string; end?: string }) || {}}
                        onChange={(val) => setLocalValues(prev => ({ ...prev, [filter.key]: val }))}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedFilter(isExpanded ? null : filter.key)}
                        colors={colors}
                    />
                );
            case 'search':
                return (
                    <SearchFilter
                        key={filter.key}
                        filter={filter}
                        value={currentValue as string | undefined}
                        onChange={(val) => setLocalValues(prev => ({ ...prev, [filter.key]: val }))}
                        colors={colors}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        maxHeight: '80%',
                    }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border.primary,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Filter size={20} color={colors.brand.primary} />
                            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                {title}
                            </Text>
                            {activeFilterCount > 0 && (
                                <View
                                    style={{
                                        backgroundColor: colors.brand.primary,
                                        borderRadius: 10,
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                                        {activeFilterCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <X size={24} color={colors.text.secondary} />
                        </Pressable>
                    </View>

                    {/* Filters */}
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 16, gap: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {filters.map(renderFilter)}
                    </ScrollView>

                    {/* Actions */}
                    <View
                        style={{
                            flexDirection: 'row',
                            padding: 16,
                            gap: 12,
                            borderTopWidth: 1,
                            borderTopColor: colors.border.primary,
                        }}
                    >
                        <Pressable
                            onPress={handleReset}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                paddingVertical: 14,
                                borderRadius: 12,
                                backgroundColor: colors.background.tertiary,
                            }}
                        >
                            <RotateCcw size={18} color={colors.text.secondary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 15, fontWeight: '600' }}>
                                Sıfırla
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleApply}
                            style={{
                                flex: 2,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                paddingVertical: 14,
                                borderRadius: 12,
                                backgroundColor: colors.brand.primary,
                            }}
                        >
                            <Check size={18} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                                Uygula
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Select Filter Component
interface SelectFilterProps {
    filter: FilterConfig;
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    isExpanded: boolean;
    onToggle: () => void;
    colors: any;
}

function SelectFilter({ filter, value, onChange, isExpanded, onToggle, colors }: SelectFilterProps) {
    const selectedOption = filter.options?.find(o => o.value === value);

    return (
        <View>
            <Pressable
                onPress={onToggle}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    backgroundColor: colors.background.tertiary,
                    borderRadius: 12,
                    borderWidth: value ? 2 : 1,
                    borderColor: value ? colors.brand.primary : colors.border.primary,
                }}
            >
                <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>
                    {filter.label}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: value ? colors.brand.primary : colors.text.tertiary, fontSize: 14 }}>
                        {selectedOption?.label || 'Seçiniz'}
                    </Text>
                    <ChevronDown
                        size={18}
                        color={colors.text.tertiary}
                        style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={{
                        marginTop: 8,
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        overflow: 'hidden',
                    }}
                >
                    <Pressable
                        onPress={() => {
                            onChange(undefined);
                            onToggle();
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 14,
                            backgroundColor: !value ? colors.brand.primary + '10' : 'transparent',
                        }}
                    >
                        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>Tümü</Text>
                        {!value && <Check size={18} color={colors.brand.primary} />}
                    </Pressable>
                    {filter.options?.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => {
                                onChange(option.value);
                                onToggle();
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 14,
                                borderTopWidth: 1,
                                borderTopColor: colors.border.secondary,
                                backgroundColor: value === option.value ? colors.brand.primary + '10' : 'transparent',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: colors.text.primary, fontSize: 14 }}>{option.label}</Text>
                                {option.count !== undefined && (
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>({option.count})</Text>
                                )}
                            </View>
                            {value === option.value && <Check size={18} color={colors.brand.primary} />}
                        </Pressable>
                    ))}
                </Animated.View>
            )}
        </View>
    );
}

// MultiSelect Filter Component
interface MultiSelectFilterProps {
    filter: FilterConfig;
    value: string[];
    onChange: (value: string[]) => void;
    isExpanded: boolean;
    onToggle: () => void;
    colors: any;
}

function MultiSelectFilter({ filter, value, onChange, isExpanded, onToggle, colors }: MultiSelectFilterProps) {
    const toggleOption = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    return (
        <View>
            <Pressable
                onPress={onToggle}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    backgroundColor: colors.background.tertiary,
                    borderRadius: 12,
                    borderWidth: value.length > 0 ? 2 : 1,
                    borderColor: value.length > 0 ? colors.brand.primary : colors.border.primary,
                }}
            >
                <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>
                    {filter.label}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: value.length > 0 ? colors.brand.primary : colors.text.tertiary, fontSize: 14 }}>
                        {value.length > 0 ? `${value.length} seçili` : 'Seçiniz'}
                    </Text>
                    <ChevronDown
                        size={18}
                        color={colors.text.tertiary}
                        style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={{
                        marginTop: 8,
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        overflow: 'hidden',
                    }}
                >
                    {filter.options?.map((option, index) => (
                        <Pressable
                            key={option.value}
                            onPress={() => toggleOption(option.value)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 14,
                                borderTopWidth: index > 0 ? 1 : 0,
                                borderTopColor: colors.border.secondary,
                                backgroundColor: value.includes(option.value) ? colors.brand.primary + '10' : 'transparent',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: colors.text.primary, fontSize: 14 }}>{option.label}</Text>
                                {option.count !== undefined && (
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>({option.count})</Text>
                                )}
                            </View>
                            <View
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    borderWidth: 2,
                                    borderColor: value.includes(option.value) ? colors.brand.primary : colors.border.primary,
                                    backgroundColor: value.includes(option.value) ? colors.brand.primary : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {value.includes(option.value) && <Check size={14} color="#fff" />}
                            </View>
                        </Pressable>
                    ))}
                </Animated.View>
            )}
        </View>
    );
}

// Date Range Filter Component
interface DateRangeFilterProps {
    filter: FilterConfig;
    value: { start?: string; end?: string };
    onChange: (value: { start?: string; end?: string }) => void;
    isExpanded: boolean;
    onToggle: () => void;
    colors: any;
}

function DateRangeFilter({ filter, value, onChange, isExpanded, onToggle, colors }: DateRangeFilterProps) {
    const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
    const hasValue = value.start || value.end;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const presets = [
        { label: 'Bugün', getValue: () => {
            const today = new Date().toISOString().split('T')[0];
            return { start: today, end: today };
        }},
        { label: 'Bu Hafta', getValue: () => {
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - today.getDay());
            return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
        }},
        { label: 'Bu Ay', getValue: () => {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
        }},
        { label: 'Son 30 Gün', getValue: () => {
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - 30);
            return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
        }},
    ];

    return (
        <View>
            <Pressable
                onPress={onToggle}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    backgroundColor: colors.background.tertiary,
                    borderRadius: 12,
                    borderWidth: hasValue ? 2 : 1,
                    borderColor: hasValue ? colors.brand.primary : colors.border.primary,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} color={hasValue ? colors.brand.primary : colors.text.tertiary} />
                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>
                        {filter.label}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: hasValue ? colors.brand.primary : colors.text.tertiary, fontSize: 14 }}>
                        {hasValue
                            ? `${formatDate(value.start)} - ${formatDate(value.end)}`
                            : 'Seçiniz'}
                    </Text>
                    <ChevronDown
                        size={18}
                        color={colors.text.tertiary}
                        style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={{
                        marginTop: 8,
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        padding: 12,
                    }}
                >
                    {/* Quick Presets */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {presets.map((preset) => (
                            <Pressable
                                key={preset.label}
                                onPress={() => onChange(preset.getValue())}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    backgroundColor: colors.background.tertiary,
                                }}
                            >
                                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{preset.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Date Inputs */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Başlangıç</Text>
                            <Pressable
                                onPress={() => setShowCalendar('start')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 8,
                                    gap: 8,
                                }}
                            >
                                <Calendar size={16} color={colors.text.tertiary} />
                                <Text style={{ color: value.start ? colors.text.primary : colors.text.tertiary, fontSize: 14 }}>
                                    {formatDate(value.start) || 'Seçiniz'}
                                </Text>
                            </Pressable>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Bitiş</Text>
                            <Pressable
                                onPress={() => setShowCalendar('end')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 8,
                                    gap: 8,
                                }}
                            >
                                <Calendar size={16} color={colors.text.tertiary} />
                                <Text style={{ color: value.end ? colors.text.primary : colors.text.tertiary, fontSize: 14 }}>
                                    {formatDate(value.end) || 'Seçiniz'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Simple Calendar Modal */}
                    {showCalendar && (
                        <SimpleCalendar
                            visible={!!showCalendar}
                            onClose={() => setShowCalendar(null)}
                            selectedDate={showCalendar === 'start' ? value.start : value.end}
                            onSelect={(date) => {
                                onChange({
                                    ...value,
                                    [showCalendar]: date,
                                });
                                setShowCalendar(null);
                            }}
                            colors={colors}
                        />
                    )}
                </Animated.View>
            )}
        </View>
    );
}

// Search Filter Component
interface SearchFilterProps {
    filter: FilterConfig;
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    colors: any;
}

function SearchFilter({ filter, value, onChange, colors }: SearchFilterProps) {
    return (
        <View
            style={{
                backgroundColor: colors.background.tertiary,
                borderRadius: 12,
                padding: 14,
            }}
        >
            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500', marginBottom: 8 }}>
                {filter.label}
            </Text>
            <TextInput
                value={value || ''}
                onChangeText={(text) => onChange(text || undefined)}
                placeholder={filter.placeholder || 'Ara...'}
                placeholderTextColor={colors.text.tertiary}
                style={{
                    backgroundColor: colors.surface.primary,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text.primary,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                }}
            />
        </View>
    );
}

// Simple Calendar Component
interface SimpleCalendarProps {
    visible: boolean;
    onClose: () => void;
    selectedDate?: string;
    onSelect: (date: string) => void;
    colors: any;
}

function SimpleCalendar({ visible, onClose, selectedDate, onSelect, colors }: SimpleCalendarProps) {
    const [viewDate, setViewDate] = useState(() => {
        return selectedDate ? new Date(selectedDate) : new Date();
    });

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Monday = 0
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
    };

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isSelected = (day: number) => {
        if (!selectedDate || !day) return false;
        const selected = new Date(selectedDate);
        return selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
    };

    const isToday = (day: number) => {
        if (!day) return false;
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        width: 320,
                    }}
                >
                    {/* Month Navigation */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Pressable onPress={prevMonth} style={{ padding: 8 }}>
                            <ChevronLeft size={24} color={colors.text.primary} />
                        </Pressable>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                            {monthNames[month]} {year}
                        </Text>
                        <Pressable onPress={nextMonth} style={{ padding: 8 }}>
                            <ChevronRight size={24} color={colors.text.primary} />
                        </Pressable>
                    </View>

                    {/* Day Names */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        {dayNames.map((day) => (
                            <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, fontWeight: '500' }}>
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Days Grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {days.map((day, index) => (
                            <View key={index} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
                                {day && (
                                    <Pressable
                                        onPress={() => {
                                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            onSelect(dateStr);
                                        }}
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 8,
                                            backgroundColor: isSelected(day)
                                                ? colors.brand.primary
                                                : isToday(day)
                                                    ? colors.brand.primary + '20'
                                                    : 'transparent',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: isSelected(day) ? '#fff' : colors.text.primary,
                                                fontSize: 14,
                                                fontWeight: isSelected(day) || isToday(day) ? '600' : '400',
                                            }}
                                        >
                                            {day}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Close Button */}
                    <Pressable
                        onPress={onClose}
                        style={{
                            marginTop: 16,
                            padding: 12,
                            backgroundColor: colors.background.tertiary,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>Kapat</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

// Filter Button Component (for use in headers)
interface FilterButtonProps {
    onPress: () => void;
    activeCount?: number;
    style?: ViewStyle;
}

export function FilterButton({ onPress, activeCount = 0, style }: FilterButtonProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: activeCount > 0 ? colors.brand.primary : colors.background.tertiary,
                },
                style,
            ]}
        >
            <Filter size={16} color={activeCount > 0 ? '#fff' : colors.text.secondary} />
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: activeCount > 0 ? '#fff' : colors.text.secondary,
                }}
            >
                Filtre
            </Text>
            {activeCount > 0 && (
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                    }}
                >
                    <Text style={{ color: colors.brand.primary, fontSize: 11, fontWeight: '700' }}>
                        {activeCount}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}
