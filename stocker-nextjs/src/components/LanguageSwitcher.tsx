'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Locale, localeNames } from '@/lib/i18n/config';
import { getCurrentLocale, setLocale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

export default function LanguageSwitcher({ isScrolled = false }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>('tr');

  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setLocale(locale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Language Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isScrolled
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-white hover:bg-white/10'
        }`}
      >
        <GlobeAltIcon className="w-5 h-5" />
        <span className="text-sm font-medium uppercase">{currentLocale}</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
            >
              {Object.entries(localeNames).map(([locale, name]) => (
                <motion.button
                  key={locale}
                  onClick={() => handleLocaleChange(locale as Locale)}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    currentLocale === locale
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {locale === 'tr' ? '🇹🇷' : '🇬🇧'}
                    </span>
                    <span className="font-medium">{name}</span>
                  </div>
                  {currentLocale === locale && (
                    <CheckIcon className="w-4 h-4 text-purple-600" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
