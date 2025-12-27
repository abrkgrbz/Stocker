'use client';

import React, { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from '@/lib/i18n';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslations();

  // Auth URLs are handled by middleware - no client-side computation needed
  // Middleware redirects /login and /register to auth subdomain in production
  const loginUrl = '/login';
  const registerUrl = '/register';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: t('landing.navbar.features'), href: '#features' },
    { name: t('landing.navbar.industries'), href: '#industries' },
    { name: t('landing.navbar.integrations'), href: '#integrations' },
    { name: t('landing.navbar.pricing'), href: '#pricing' },
    { name: t('landing.navbar.faq'), href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Image
                src={isScrolled ? '/stoocker_black.png' : '/stoocker_white.png'}
                alt="Stoocker Logo"
                width={120}
                height={40}
                className="transition-all object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Menu - Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-gray-900 hover:text-black'
                    : 'text-white hover:text-gray-200'
                }`}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA Buttons - Proper Button Styling */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher isScrolled={isScrolled} />

            {/* Sign In - Secondary/Ghost Button */}
            <Link href={loginUrl}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
                  isScrolled
                    ? 'text-gray-700 hover:text-black hover:bg-gray-100'
                    : 'text-white hover:text-white hover:bg-white/10'
                }`}
              >
                {t('landing.navbar.signIn')}
              </motion.button>
            </Link>

            {/* Get Started - Primary Button (High Contrast) */}
            <Link href={registerUrl}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
              >
                {t('landing.navbar.getStarted')}
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-900 font-medium hover:text-black transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <div className="flex justify-center pb-3">
                  <LanguageSwitcher isScrolled={true} />
                </div>

                {/* Mobile Sign In - Secondary/Ghost Button */}
                <Link href={loginUrl} onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 px-4 py-3 rounded-md transition-all border border-gray-300">
                    {t('landing.navbar.signIn')}
                  </button>
                </Link>

                {/* Mobile Get Started - Primary Button (High Contrast) */}
                <Link href={registerUrl} onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full text-sm font-medium bg-black text-white px-5 py-3 rounded-full hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all">
                    {t('landing.navbar.getStarted')}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
