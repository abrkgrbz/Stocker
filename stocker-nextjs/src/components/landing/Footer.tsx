'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TwitterOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  GithubOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Özellikler', href: '#features' },
      { name: 'Fiyatlandırma', href: '#pricing' },
      { name: 'Demo', href: '/demo' },
      { name: 'Güncellemeler', href: '/updates' },
    ],
    company: [
      { name: 'Hakkımızda', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Kariyer', href: '/careers' },
      { name: 'İletişim', href: '/contact' },
    ],
    resources: [
      { name: 'Dökümantasyon', href: '/docs' },
      { name: 'API', href: '/api' },
      { name: 'Destek', href: '/support' },
      { name: 'SSS', href: '/faq' },
    ],
    legal: [
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
      { name: 'Çerez Politikası', href: '/cookies' },
      { name: 'KVKK', href: '/kvkk' },
    ],
  };

  const socialLinks = [
    { icon: <TwitterOutlined />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FacebookOutlined />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <LinkedinOutlined />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <InstagramOutlined />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <GithubOutlined />, href: 'https://github.com', label: 'GitHub' },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.svg"
                alt="Stocker Logo"
                width={60}
                height={75}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Modern işletmeler için tasarlanmış akıllı stok yönetim sistemi.
              İşinizi kolaylaştırıyoruz, siz büyümeye odaklanın.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <MailOutlined />
                <a href="mailto:info@stocker.com">info@stocker.com</a>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <PhoneOutlined />
                <a href="tel:+908501234567">+90 (850) 123 45 67</a>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <EnvironmentOutlined className="mt-1" />
                <span>Maslak, Sarıyer<br />İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ürün</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Şirket</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kaynaklar</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Yasal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-12 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-4">Haberdar Olun</h3>
            <p className="text-gray-400 mb-4">
              Yeni özellikler ve güncellemelerden haberdar olmak için abone olun.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email adresiniz"
                autoComplete="email"
                suppressHydrationWarning
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105">
                Abone Ol
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} Stocker. Tüm hakları saklıdır.
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Made with Love */}
            <div className="text-gray-400 text-sm flex items-center gap-2">
              Made with
              <span className="text-red-500 animate-pulse">❤</span>
              in Turkey
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
