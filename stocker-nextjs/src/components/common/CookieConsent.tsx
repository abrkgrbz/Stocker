'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'stocker_cookie_consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[9999]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">🍪</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Çerez Kullanımı
                </h3>
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                  Deneyiminizi iyileştirmek için çerez kullanıyoruz.{' '}
                  <Link
                    href="/cookies"
                    className="text-purple-600 hover:underline"
                  >
                    Daha fazla
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Kabul Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
