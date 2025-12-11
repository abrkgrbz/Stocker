'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type CookiePreferences = {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = 'stocker_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'stocker_cookie_preferences';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    performance: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const saveConsent = (allAccepted: boolean) => {
    const finalPreferences = allAccepted
      ? { essential: true, performance: true, functional: true, marketing: true }
      : preferences;

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences));
    setPreferences(finalPreferences);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true);
  };

  const handleAcceptSelected = () => {
    saveConsent(false);
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      essential: true,
      performance: false,
      functional: false,
      marketing: false,
    };
    setPreferences(minimalPreferences);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(minimalPreferences));
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cookieTypes = [
    {
      key: 'essential' as const,
      title: 'Zorunlu Çerezler',
      description: 'Web sitesinin temel işlevleri için gereklidir. Devre dışı bırakılamaz.',
      required: true,
    },
    {
      key: 'performance' as const,
      title: 'Performans Çerezleri',
      description: 'Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur.',
      required: false,
    },
    {
      key: 'functional' as const,
      title: 'İşlevsel Çerezler',
      description: 'Dil tercihi gibi kişiselleştirme özelliklerini sağlar.',
      required: false,
    },
    {
      key: 'marketing' as const,
      title: 'Pazarlama Çerezleri',
      description: 'Kişiselleştirilmiş reklamlar göstermek için kullanılır.',
      required: false,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for settings modal */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setShowSettings(false)}
            />
          )}

          {/* Main Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
          >
            <div className="max-w-6xl mx-auto">
              <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

                {/* Decorative blur elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />

                <div className="relative p-6 sm:p-8">
                  {!showSettings ? (
                    /* Simple Banner View */
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      {/* Cookie Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          🍪 Çerez Kullanımı
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          Size en iyi deneyimi sunmak için çerezleri kullanıyoruz. Çerezler, sitemizi nasıl kullandığınızı
                          anlamamıza ve deneyiminizi kişiselleştirmemize yardımcı olur.{' '}
                          <Link
                            href="/cookies"
                            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                          >
                            Çerez Politikamız
                          </Link>
                          {' '}hakkında daha fazla bilgi edinin.
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <button
                          onClick={() => setShowSettings(true)}
                          className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
                        >
                          Ayarlar
                        </button>
                        <button
                          onClick={handleRejectAll}
                          className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
                        >
                          Sadece Zorunlu
                        </button>
                        <button
                          onClick={handleAcceptAll}
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-500/40"
                        >
                          Tümünü Kabul Et
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Settings View */
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Çerez Tercihleri</h3>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-gray-400 text-sm mb-6">
                        Aşağıdan hangi çerezlerin kullanılmasına izin vereceğinizi seçebilirsiniz.
                      </p>

                      {/* Cookie Types */}
                      <div className="space-y-4 mb-8">
                        {cookieTypes.map((cookie) => (
                          <div
                            key={cookie.key}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                              preferences[cookie.key]
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : 'bg-gray-800/50 border-gray-700/50'
                            }`}
                          >
                            {/* Toggle */}
                            <button
                              onClick={() => togglePreference(cookie.key)}
                              disabled={cookie.required}
                              className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
                                preferences[cookie.key]
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                  : 'bg-gray-600'
                              } ${cookie.required ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                  preferences[cookie.key] ? 'translate-x-6' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{cookie.title}</h4>
                                {cookie.required && (
                                  <span className="px-2 py-0.5 text-xs font-medium text-amber-400 bg-amber-500/20 rounded-full">
                                    Zorunlu
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{cookie.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                          onClick={handleRejectAll}
                          className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
                        >
                          Sadece Zorunlu
                        </button>
                        <button
                          onClick={handleAcceptSelected}
                          className="px-5 py-2.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200"
                        >
                          Seçilenleri Kaydet
                        </button>
                        <button
                          onClick={handleAcceptAll}
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-500/40"
                        >
                          Tümünü Kabul Et
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to check cookie preferences
export function useCookiePreferences(): CookiePreferences {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    performance: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  return preferences;
}
