'use client';

/**
 * =====================================
 * ENTERPRISE SELECT COMPONENT
 * =====================================
 *
 * Accessible dropdown select using react-select.
 * Features:
 * - Keyboard navigation
 * - Search/filter option
 * - Multi-select support
 * - Custom option rendering
 */

import React, { useMemo } from 'react';
import ReactSelect, { SingleValue, MultiValue, StylesConfig } from 'react-select';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  /** Selected value */
  value: string | null;
  /** Change handler */
  onChange: (value: string) => void;
  /** Options list */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Allow search */
  searchable?: boolean;
  /** Allow clear */
  clearable?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeConfig = {
  sm: { height: 32, fontSize: 14 },
  md: { height: 40, fontSize: 14 },
  lg: { height: 48, fontSize: 16 },
};

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  searchable = false,
  clearable = false,
  className,
}: SelectProps) {
  // Convert to react-select format
  const selectOptions = useMemo(
    () =>
      options.map((opt) => ({
        value: opt.value,
        label: opt.label,
        isDisabled: opt.disabled,
      })),
    [options]
  );

  // Find selected option
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return selectOptions.find((opt) => opt.value === value) || null;
  }, [value, selectOptions]);

  const handleChange = (option: SingleValue<{ value: string; label: string }>) => {
    if (option) {
      onChange(option.value);
    } else if (clearable) {
      onChange('');
    }
  };

  const { height, fontSize } = sizeConfig[size];

  // Custom styles for react-select
  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (base, state) => ({
      ...base,
      minHeight: height,
      height: height,
      fontSize: fontSize,
      backgroundColor: state.isDisabled ? '#f1f5f9' : '#f8fafc',
      borderColor: error
        ? '#ef4444'
        : state.isFocused
          ? '#0f172a'
          : '#cbd5e1',
      borderRadius: 6,
      boxShadow: state.isFocused
        ? error
          ? '0 0 0 1px #ef4444'
          : '0 0 0 1px #0f172a'
        : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : state.isFocused ? '#0f172a' : '#94a3b8',
      },
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      opacity: state.isDisabled ? 0.5 : 1,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px',
      height: height - 2,
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: '#0f172a',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      padding: '0 8px',
      color: '#94a3b8',
      '&:hover': {
        color: '#64748b',
      },
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
      transition: 'transform 0.2s ease',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0 4px',
      color: '#94a3b8',
      '&:hover': {
        color: '#64748b',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      marginTop: 4,
      borderRadius: 6,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      maxHeight: 240,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: fontSize,
      padding: '8px 12px',
      borderRadius: 4,
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: state.isSelected
        ? '#f1f5f9'
        : state.isFocused
          ? '#f8fafc'
          : 'transparent',
      color: state.isDisabled ? '#94a3b8' : '#0f172a',
      fontWeight: state.isSelected ? 500 : 400,
      opacity: state.isDisabled ? 0.5 : 1,
      '&:active': {
        backgroundColor: state.isDisabled ? 'transparent' : '#e2e8f0',
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: fontSize,
      color: '#64748b',
    }),
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full', className)}>
      <ReactSelect
        value={selectedOption}
        onChange={handleChange}
        options={selectOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={clearable}
        isSearchable={searchable}
        styles={customStyles}
        noOptionsMessage={() => 'Seçenek bulunamadı'}
        classNamePrefix="select"
        menuPlacement="auto"
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
      />
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

/**
 * Multi-select variant
 */
export interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  searchable?: boolean;
  className?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  searchable = true,
  className,
}: MultiSelectProps) {
  // Convert to react-select format
  const selectOptions = useMemo(
    () =>
      options.map((opt) => ({
        value: opt.value,
        label: opt.label,
        isDisabled: opt.disabled,
      })),
    [options]
  );

  // Find selected options
  const selectedOptions = useMemo(() => {
    return selectOptions.filter((opt) => value.includes(opt.value));
  }, [value, selectOptions]);

  const handleChange = (
    newValue: MultiValue<{ value: string; label: string }>
  ) => {
    onChange(newValue.map((opt) => opt.value));
  };

  const { height, fontSize } = sizeConfig[size];

  // Custom styles for react-select
  const customStyles: StylesConfig<{ value: string; label: string }, true> = {
    control: (base, state) => ({
      ...base,
      minHeight: height,
      fontSize: fontSize,
      backgroundColor: state.isDisabled ? '#f1f5f9' : '#f8fafc',
      borderColor: error
        ? '#ef4444'
        : state.isFocused
          ? '#0f172a'
          : '#cbd5e1',
      borderRadius: 6,
      boxShadow: state.isFocused
        ? error
          ? '0 0 0 1px #ef4444'
          : '0 0 0 1px #0f172a'
        : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : state.isFocused ? '#0f172a' : '#94a3b8',
      },
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      opacity: state.isDisabled ? 0.5 : 1,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '4px 12px',
      gap: 4,
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: '#0f172a',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#334155',
      fontSize: fontSize - 2,
      padding: '2px 6px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#64748b',
      '&:hover': {
        backgroundColor: '#cbd5e1',
        color: '#334155',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      padding: '0 8px',
      color: '#94a3b8',
      '&:hover': {
        color: '#64748b',
      },
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
      transition: 'transform 0.2s ease',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0 4px',
      color: '#94a3b8',
      '&:hover': {
        color: '#64748b',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      marginTop: 4,
      borderRadius: 6,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      maxHeight: 240,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: fontSize,
      padding: '8px 12px',
      borderRadius: 4,
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: state.isSelected
        ? '#f1f5f9'
        : state.isFocused
          ? '#f8fafc'
          : 'transparent',
      color: state.isDisabled ? '#94a3b8' : '#0f172a',
      fontWeight: state.isSelected ? 500 : 400,
      opacity: state.isDisabled ? 0.5 : 1,
      '&:active': {
        backgroundColor: state.isDisabled ? 'transparent' : '#e2e8f0',
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: fontSize,
      color: '#64748b',
    }),
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full', className)}>
      <ReactSelect
        value={selectedOptions}
        onChange={handleChange}
        options={selectOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        isSearchable={searchable}
        isMulti
        styles={customStyles}
        noOptionsMessage={() => 'Seçenek bulunamadı'}
        classNamePrefix="multi-select"
        menuPlacement="auto"
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
      />
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default Select;
