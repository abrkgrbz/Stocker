'use client';

import { motion } from 'framer-motion';
import { StarFilled, TrophyOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons';

const companies = [
  'Company A', 'Company B', 'Company C', 'Company D',
  'Company E', 'Company F', 'Company G', 'Company H'
];

const achievements = [
  {
    icon: <StarFilled />,
    value: '4.9/5',
    label: 'Müşteri Memnuniyeti',
    color: 'text-yellow-400',
  },
  {
    icon: <TrophyOutlined />,
    value: '#1',
    label: 'Türkiye\'de Lider',
    color: 'text-purple-400',
  },
  {
    icon: <SafetyOutlined />,
    value: 'ISO 27001',
    label: 'Güvenlik Sertifikası',
    color: 'text-green-400',
  },
  {
    icon: <ThunderboltOutlined />,
    value: '99.9%',
    label: 'Uptime Garantisi',
    color: 'text-blue-400',
  },
];

export default function SocialProof() {
  return (
    <section className="py-16 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gray-400 text-sm font-medium mb-8">
            Binlerce İşletme Tarafından Güvenle Kullanılıyor
          </p>

          {/* Company Logos - Scrolling Animation */}
          <div className="relative overflow-hidden">
            <motion.div
              animate={{
                x: [0, -1920],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex gap-12 items-center"
            >
              {[...companies, ...companies, ...companies].map((company, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 h-20 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-500 font-semibold">{company}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all"
            >
              <div className={`text-4xl mb-3 ${achievement.color}`}>
                {achievement.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {achievement.value}
              </div>
              <div className="text-sm text-gray-400">
                {achievement.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Customer Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 rounded-2xl border border-purple-500/20">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <StarFilled key={i} className="text-yellow-400 text-xl mx-1" />
              ))}
            </div>
            <p className="text-xl text-gray-300 mb-6 italic">
              "Stocker sayesinde stok yönetimimiz %80 daha hızlı ve verimli hale geldi.
              Artık tüm süreçlerimizi tek bir yerden yönetebiliyoruz."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                AY
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Ahmet Yılmaz</div>
                <div className="text-sm text-gray-400">CEO, TechCorp</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
