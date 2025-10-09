'use client';

import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { MenuOutlined, CloseOutlined, RocketOutlined, LoginOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    { name: 'Özellikler', href: '#features' },
    { name: 'Sektörler', href: '#industries' },
    { name: 'Entegrasyonlar', href: '#integrations' },
    { name: 'Fiyatlandırma', href: '#pricing' },
    { name: 'SSS', href: '#faq' },
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
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Image
                src="/logo.svg"
                alt="Stocker Logo"
                width={50}
                height={62}
                className={`transition-all ${isScrolled ? 'brightness-100' : 'brightness-0 invert'}`}
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`font-medium transition-colors hover:text-purple-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href={loginUrl}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  icon={<LoginOutlined />}
                  className={`h-10 px-6 font-medium border-2 transition-all ${
                    isScrolled
                      ? 'border-purple-600 text-purple-600 hover:bg-purple-50'
                      : 'border-white text-white hover:bg-white/10'
                  }`}
                >
                  Giriş Yap
                </Button>
              </motion.div>
            </Link>
            <Link href={registerUrl}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  className="h-10 px-6 bg-purple-600 hover:bg-purple-700 border-0 font-medium shadow-md"
                >
                  Ücretsiz Başla
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
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
                  className="block py-2 text-gray-700 font-medium hover:text-purple-600 transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <Link href={loginUrl} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    icon={<LoginOutlined />}
                    block
                    size="large"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link href={registerUrl} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    type="primary"
                    icon={<RocketOutlined />}
                    block
                    size="large"
                    className="bg-purple-600 hover:bg-purple-700 border-0"
                  >
                    Ücretsiz Başla
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
