'use client';

/**
 * International Smart Phone Input Component
 * Premium design with country picker, auto-formatting, and searchable dropdown
 * Monochrome Enterprise Theme - Black/White/Gray
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// COUNTRY DATA
// ═══════════════════════════════════════════════════════════════

export interface Country {
  code: string;      // ISO 3166-1 alpha-2 code
  name: string;      // Country name in Turkish
  dialCode: string;  // Phone dial code
  flag: string;      // Emoji flag
  format: string;    // Phone format pattern (# = digit)
  priority?: number; // For sorting common countries first
}

export const COUNTRIES: Country[] = [
  // Priority countries (most common)
  { code: 'TR', name: 'Türkiye', dialCode: '+90', flag: '🇹🇷', format: '### ### ## ##', priority: 1 },
  { code: 'US', name: 'Amerika Birleşik Devletleri', dialCode: '+1', flag: '🇺🇸', format: '(###) ###-####', priority: 2 },
  { code: 'GB', name: 'Birleşik Krallık', dialCode: '+44', flag: '🇬🇧', format: '#### ######', priority: 3 },
  { code: 'DE', name: 'Almanya', dialCode: '+49', flag: '🇩🇪', format: '#### ########', priority: 4 },
  { code: 'FR', name: 'Fransa', dialCode: '+33', flag: '🇫🇷', format: '# ## ## ## ##', priority: 5 },
  { code: 'NL', name: 'Hollanda', dialCode: '+31', flag: '🇳🇱', format: '# ########', priority: 6 },
  { code: 'IT', name: 'İtalya', dialCode: '+39', flag: '🇮🇹', format: '### ### ####', priority: 7 },
  { code: 'ES', name: 'İspanya', dialCode: '+34', flag: '🇪🇸', format: '### ### ###', priority: 8 },

  // Other countries (alphabetical by Turkish name)
  { code: 'AF', name: 'Afganistan', dialCode: '+93', flag: '🇦🇫', format: '## ### ####' },
  { code: 'AL', name: 'Arnavutluk', dialCode: '+355', flag: '🇦🇱', format: '### ### ###' },
  { code: 'DZ', name: 'Cezayir', dialCode: '+213', flag: '🇩🇿', format: '### ## ## ##' },
  { code: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩', format: '### ###' },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴', format: '### ### ###' },
  { code: 'AR', name: 'Arjantin', dialCode: '+54', flag: '🇦🇷', format: '## ####-####' },
  { code: 'AU', name: 'Avustralya', dialCode: '+61', flag: '🇦🇺', format: '### ### ###' },
  { code: 'AT', name: 'Avusturya', dialCode: '+43', flag: '🇦🇹', format: '### ######' },
  { code: 'AZ', name: 'Azerbaycan', dialCode: '+994', flag: '🇦🇿', format: '## ### ## ##' },
  { code: 'BD', name: 'Bangladeş', dialCode: '+880', flag: '🇧🇩', format: '#### ######' },
  { code: 'BY', name: 'Belarus', dialCode: '+375', flag: '🇧🇾', format: '## ###-##-##' },
  { code: 'BE', name: 'Belçika', dialCode: '+32', flag: '🇧🇪', format: '### ## ## ##' },
  { code: 'BA', name: 'Bosna Hersek', dialCode: '+387', flag: '🇧🇦', format: '## ###-###' },
  { code: 'BR', name: 'Brezilya', dialCode: '+55', flag: '🇧🇷', format: '## #####-####' },
  { code: 'BG', name: 'Bulgaristan', dialCode: '+359', flag: '🇧🇬', format: '### ### ###' },
  { code: 'CL', name: 'Şili', dialCode: '+56', flag: '🇨🇱', format: '# #### ####' },
  { code: 'CN', name: 'Çin', dialCode: '+86', flag: '🇨🇳', format: '### #### ####' },
  { code: 'CO', name: 'Kolombiya', dialCode: '+57', flag: '🇨🇴', format: '### ### ####' },
  { code: 'HR', name: 'Hırvatistan', dialCode: '+385', flag: '🇭🇷', format: '## ### ####' },
  { code: 'CY', name: 'Kıbrıs', dialCode: '+357', flag: '🇨🇾', format: '## ######' },
  { code: 'CZ', name: 'Çekya', dialCode: '+420', flag: '🇨🇿', format: '### ### ###' },
  { code: 'DK', name: 'Danimarka', dialCode: '+45', flag: '🇩🇰', format: '## ## ## ##' },
  { code: 'EG', name: 'Mısır', dialCode: '+20', flag: '🇪🇬', format: '### ### ####' },
  { code: 'EE', name: 'Estonya', dialCode: '+372', flag: '🇪🇪', format: '#### ####' },
  { code: 'FI', name: 'Finlandiya', dialCode: '+358', flag: '🇫🇮', format: '## ### ## ##' },
  { code: 'GE', name: 'Gürcistan', dialCode: '+995', flag: '🇬🇪', format: '### ## ## ##' },
  { code: 'GR', name: 'Yunanistan', dialCode: '+30', flag: '🇬🇷', format: '### ### ####' },
  { code: 'HU', name: 'Macaristan', dialCode: '+36', flag: '🇭🇺', format: '## ### ####' },
  { code: 'IN', name: 'Hindistan', dialCode: '+91', flag: '🇮🇳', format: '##### #####' },
  { code: 'ID', name: 'Endonezya', dialCode: '+62', flag: '🇮🇩', format: '### ### ####' },
  { code: 'IR', name: 'İran', dialCode: '+98', flag: '🇮🇷', format: '### ### ####' },
  { code: 'IQ', name: 'Irak', dialCode: '+964', flag: '🇮🇶', format: '### ### ####' },
  { code: 'IE', name: 'İrlanda', dialCode: '+353', flag: '🇮🇪', format: '## ### ####' },
  { code: 'IL', name: 'İsrail', dialCode: '+972', flag: '🇮🇱', format: '## ### ####' },
  { code: 'JP', name: 'Japonya', dialCode: '+81', flag: '🇯🇵', format: '##-####-####' },
  { code: 'JO', name: 'Ürdün', dialCode: '+962', flag: '🇯🇴', format: '# #### ####' },
  { code: 'KZ', name: 'Kazakistan', dialCode: '+7', flag: '🇰🇿', format: '### ###-##-##' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', format: '### ######' },
  { code: 'KW', name: 'Kuveyt', dialCode: '+965', flag: '🇰🇼', format: '#### ####' },
  { code: 'KG', name: 'Kırgızistan', dialCode: '+996', flag: '🇰🇬', format: '### ### ###' },
  { code: 'LV', name: 'Letonya', dialCode: '+371', flag: '🇱🇻', format: '## ### ###' },
  { code: 'LB', name: 'Lübnan', dialCode: '+961', flag: '🇱🇧', format: '## ### ###' },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾', format: '## ### ####' },
  { code: 'LT', name: 'Litvanya', dialCode: '+370', flag: '🇱🇹', format: '### #####' },
  { code: 'LU', name: 'Lüksemburg', dialCode: '+352', flag: '🇱🇺', format: '### ### ###' },
  { code: 'MY', name: 'Malezya', dialCode: '+60', flag: '🇲🇾', format: '##-### ####' },
  { code: 'MX', name: 'Meksika', dialCode: '+52', flag: '🇲🇽', format: '## #### ####' },
  { code: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩', format: '### ## ###' },
  { code: 'MC', name: 'Monako', dialCode: '+377', flag: '🇲🇨', format: '## ## ## ##' },
  { code: 'MA', name: 'Fas', dialCode: '+212', flag: '🇲🇦', format: '### ######' },
  { code: 'NZ', name: 'Yeni Zelanda', dialCode: '+64', flag: '🇳🇿', format: '## ### ####' },
  { code: 'NG', name: 'Nijerya', dialCode: '+234', flag: '🇳🇬', format: '### ### ####' },
  { code: 'NO', name: 'Norveç', dialCode: '+47', flag: '🇳🇴', format: '### ## ###' },
  { code: 'OM', name: 'Umman', dialCode: '+968', flag: '🇴🇲', format: '#### ####' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', format: '### #######' },
  { code: 'PS', name: 'Filistin', dialCode: '+970', flag: '🇵🇸', format: '### ### ###' },
  { code: 'PH', name: 'Filipinler', dialCode: '+63', flag: '🇵🇭', format: '### ### ####' },
  { code: 'PL', name: 'Polonya', dialCode: '+48', flag: '🇵🇱', format: '### ### ###' },
  { code: 'PT', name: 'Portekiz', dialCode: '+351', flag: '🇵🇹', format: '### ### ###' },
  { code: 'QA', name: 'Katar', dialCode: '+974', flag: '🇶🇦', format: '#### ####' },
  { code: 'RO', name: 'Romanya', dialCode: '+40', flag: '🇷🇴', format: '### ### ###' },
  { code: 'RU', name: 'Rusya', dialCode: '+7', flag: '🇷🇺', format: '### ###-##-##' },
  { code: 'SA', name: 'Suudi Arabistan', dialCode: '+966', flag: '🇸🇦', format: '## ### ####' },
  { code: 'RS', name: 'Sırbistan', dialCode: '+381', flag: '🇷🇸', format: '## ### ####' },
  { code: 'SG', name: 'Singapur', dialCode: '+65', flag: '🇸🇬', format: '#### ####' },
  { code: 'SK', name: 'Slovakya', dialCode: '+421', flag: '🇸🇰', format: '### ### ###' },
  { code: 'SI', name: 'Slovenya', dialCode: '+386', flag: '🇸🇮', format: '## ### ###' },
  { code: 'ZA', name: 'Güney Afrika', dialCode: '+27', flag: '🇿🇦', format: '## ### ####' },
  { code: 'KR', name: 'Güney Kore', dialCode: '+82', flag: '🇰🇷', format: '##-####-####' },
  { code: 'SE', name: 'İsveç', dialCode: '+46', flag: '🇸🇪', format: '##-### ## ##' },
  { code: 'CH', name: 'İsviçre', dialCode: '+41', flag: '🇨🇭', format: '## ### ## ##' },
  { code: 'SY', name: 'Suriye', dialCode: '+963', flag: '🇸🇾', format: '### ### ###' },
  { code: 'TW', name: 'Tayvan', dialCode: '+886', flag: '🇹🇼', format: '### ### ###' },
  { code: 'TH', name: 'Tayland', dialCode: '+66', flag: '🇹🇭', format: '## ### ####' },
  { code: 'TN', name: 'Tunus', dialCode: '+216', flag: '🇹🇳', format: '## ### ###' },
  { code: 'UA', name: 'Ukrayna', dialCode: '+380', flag: '🇺🇦', format: '## ### ## ##' },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri', dialCode: '+971', flag: '🇦🇪', format: '## ### ####' },
  { code: 'UZ', name: 'Özbekistan', dialCode: '+998', flag: '🇺🇿', format: '## ### ## ##' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', format: '### ### ###' },
  { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', format: '### ### ###' },
];

// Sort countries: priority first, then alphabetically by name
const sortedCountries = [...COUNTRIES].sort((a, b) => {
  if (a.priority && b.priority) return a.priority - b.priority;
  if (a.priority) return -1;
  if (b.priority) return 1;
  return a.name.localeCompare(b.name, 'tr');
});

// ═══════════════════════════════════════════════════════════════
// PHONE INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface PhoneValue {
  countryCode: string;
  dialCode: string;
  number: string;
  fullNumber: string;
}

export interface InternationalPhoneInputProps {
  value?: string | PhoneValue;
  onChange?: (value: PhoneValue) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'large';
  error?: boolean;
}

export function InternationalPhoneInput({
  value,
  onChange,
  defaultCountry = 'TR',
  placeholder,
  disabled = false,
  className = '',
  size = 'default',
  error = false,
}: InternationalPhoneInputProps) {
  // Find default country
  const getDefaultCountry = useCallback(() => {
    return sortedCountries.find(c => c.code === defaultCountry) || sortedCountries[0];
  }, [defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        // Try to parse string value
        const cleanNumber = value.replace(/\D/g, '');
        // Try to match dial code
        const matchedCountry = sortedCountries.find(c =>
          cleanNumber.startsWith(c.dialCode.replace('+', ''))
        );
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          const numberWithoutDialCode = cleanNumber.slice(matchedCountry.dialCode.replace('+', '').length);
          setPhoneNumber(formatPhoneNumber(numberWithoutDialCode, matchedCountry.format));
        } else {
          setPhoneNumber(cleanNumber);
        }
      } else if (typeof value === 'object') {
        const country = sortedCountries.find(c => c.code === value.countryCode);
        if (country) {
          setSelectedCountry(country);
          setPhoneNumber(formatPhoneNumber(value.number.replace(/\D/g, ''), country.format));
        }
      }
    }
  }, []);

  // Format phone number according to country format
  const formatPhoneNumber = useCallback((input: string, format: string): string => {
    const digits = input.replace(/\D/g, '');
    let result = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === '#') {
        result += digits[digitIndex];
        digitIndex++;
      } else {
        result += format[i];
      }
    }

    return result;
  }, []);

  // Get placeholder from format
  const getPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    return selectedCountry.format.replace(/#/g, '_');
  }, [placeholder, selectedCountry.format]);

  // Handle phone number input
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input, selectedCountry.format);
    setPhoneNumber(formatted);

    // Notify parent
    const cleanNumber = formatted.replace(/\D/g, '');
    onChange?.({
      countryCode: selectedCountry.code,
      dialCode: selectedCountry.dialCode,
      number: formatted,
      fullNumber: `${selectedCountry.dialCode}${cleanNumber}`,
    });
  }, [selectedCountry, formatPhoneNumber, onChange]);

  // Handle country selection
  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(0);

    // Reformat existing number with new country format
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formatted = formatPhoneNumber(cleanNumber, country.format);
    setPhoneNumber(formatted);

    // Notify parent
    onChange?.({
      countryCode: country.code,
      dialCode: country.dialCode,
      number: formatted,
      fullNumber: `${country.dialCode}${cleanNumber}`,
    });

    // Focus phone input after selection
    setTimeout(() => phoneInputRef.current?.focus(), 0);
  }, [phoneNumber, formatPhoneNumber, onChange]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return sortedCountries;
    const query = searchQuery.toLowerCase();
    return sortedCountries.filter(
      c => c.name.toLowerCase().includes(query) ||
           c.dialCode.includes(query) ||
           c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          handleCountrySelect(filteredCountries[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  }, [isOpen, filteredCountries, highlightedIndex, handleCountrySelect]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedEl = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      highlightedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const sizeClasses = size === 'large' ? 'h-11' : 'h-10';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Input Container */}
      <div
        className={`
          flex items-stretch overflow-hidden rounded-lg border transition-all
          ${error
            ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent'
            : 'border-slate-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'bg-white'}
          ${sizeClasses}
        `}
      >
        {/* Country Picker Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 bg-slate-100 border-r border-slate-200
            hover:bg-slate-200 transition-colors cursor-pointer
            focus:outline-none focus:bg-slate-200
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        >
          <span className="text-xl leading-none">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Phone Number Input */}
        <input
          ref={phoneInputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={getPlaceholder}
          disabled={disabled}
          className={`
            flex-1 px-3 bg-slate-50 text-slate-900 placeholder-slate-400
            focus:outline-none focus:bg-white transition-colors
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        />
      </div>

      {/* Country Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200
            shadow-lg shadow-slate-200/50 overflow-hidden
          "
        >
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ülke ara..."
                className="
                  w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md
                  placeholder-slate-400 text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white
                "
              />
            </div>
          </div>

          {/* Country List */}
          <div ref={dropdownRef} className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                Sonuç bulunamadı
              </div>
            ) : (
              filteredCountries.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  data-index={index}
                  onClick={() => handleCountrySelect(country)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${index === highlightedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'}
                    ${selectedCountry.code === country.code ? 'bg-slate-50' : ''}
                  `}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="flex-1 text-sm text-slate-900 truncate">{country.name}</span>
                  <span className="text-sm text-slate-500 font-medium">{country.dialCode}</span>
                  {selectedCountry.code === country.code && (
                    <Check className="w-4 h-4 text-slate-900" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANT DESIGN FORM WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Wrapper for use with Ant Design Form
 * Handles value/onChange pattern for Form.Item
 */
export interface FormPhoneInputProps extends Omit<InternationalPhoneInputProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

export function FormPhoneInput({ value, onChange, ...props }: FormPhoneInputProps) {
  const handleChange = useCallback((phoneValue: PhoneValue) => {
    // Return full international number for form submission
    onChange?.(phoneValue.fullNumber);
  }, [onChange]);

  return (
    <InternationalPhoneInput
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}

export default InternationalPhoneInput;
