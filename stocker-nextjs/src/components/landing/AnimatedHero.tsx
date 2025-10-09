'use client';

import React from 'react';
import { Button } from 'antd';
import { RocketOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] },
  },
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1],
  },
};

export default function AnimatedHero() {
  const { t } = useTranslations();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-3xl"
        />

        {/* Floating Shapes */}
        {[
          { left: 20, top: 15, x: 10 },
          { left: 70, top: 25, x: -5 },
          { left: 85, top: 65, x: 8 },
          { left: 15, top: 75, x: -12 },
          { left: 50, top: 45, x: 6 },
        ].map((shape, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, shape.x, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute w-24 h-24 bg-white/5 rounded-2xl"
            style={{
              left: `${shape.left}%`,
              top: `${shape.top}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              {t('landing.hero.badge')}
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
          >
            {t('landing.hero.title1')}
            <br />
            <motion.span
              className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent inline-block"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {t('landing.hero.title2')}
            </motion.span>
          </motion.h1>

          {/* Value Proposition */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            {t('landing.hero.subtitle')}
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-6 justify-center items-center text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>14 gün ücretsiz</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>5 dakikada kurulum</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  className="h-14 px-8 text-lg font-semibold bg-purple-600 hover:bg-purple-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {t('landing.hero.cta')}
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="large"
                icon={<PlayCircleOutlined />}
                className="h-14 px-8 text-lg font-semibold border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {t('landing.hero.watchDemo')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="pt-12 flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80"
          >
            {[
              { icon: '⭐', text: '5.0 Puan' },
              { icon: '👥', text: '10,000+ Kullanıcı' },
              { icon: '🛡️', text: 'Güvenli ve Şifreli' },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            animate={floatingAnimation}
            className="pt-16"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-2 md:p-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="text-white/20 text-9xl"
                    >
                      S
                    </motion.div>
                  </div>
                </div>
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 -z-10"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
