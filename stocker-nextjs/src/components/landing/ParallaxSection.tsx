'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RocketLaunchIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';

const values = [
  {
    icon: <RocketLaunchIcon className="w-8 h-8" />,
    title: 'Hızlı Kurulum',
    description: '5 dakikada başlayın, kredi kartı gerektirmez',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    title: '%100 Güvenli',
    description: 'Verileriniz bankacılık seviyesinde şifreleme ile korunur',
    color: 'from-purple-600 to-pink-600',
  },
  {
    icon: <BoltIcon className="w-8 h-8" />,
    title: '7/24 Destek',
    description: 'Her zaman yanınızdayız, anında yardım alın',
    color: 'from-orange-600 to-red-600',
  },
];

export default function ParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          style={{ opacity }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Neden{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stocker
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Binlerce işletme bizi tercih ediyor. Siz de aramıza katılın.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const cardY = useTransform(
              scrollYProgress,
              [0, 0.5, 1],
              [100, 0, -100]
            );

            return (
              <motion.div
                key={index}
                style={{ y: index % 2 === 0 ? cardY : y2 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center text-3xl text-white mb-6`}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
