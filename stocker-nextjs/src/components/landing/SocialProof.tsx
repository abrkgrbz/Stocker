'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from '@/lib/i18n';
import type { Stat, Partner } from '@/lib/api/services/cms.types';

// Default fallback data - matches Stat type structure
const defaultStats: Stat[] = [
  { id: '1', value: '2,500+', label: 'Aktif Isletme', order: 1, isActive: true },
  { id: '2', value: '₺50M+', label: 'Aylik Islem Hacmi', order: 2, isActive: true },
  { id: '3', value: '99.9%', label: 'Uptime Garantisi', order: 3, isActive: true },
  { id: '4', value: '4.9/5', label: 'Ortalama Puan', order: 4, isActive: true },
];

const defaultPartners: Partner[] = [
  { id: '1', name: 'TechCorp', logo: '', order: 1, isActive: true, isFeatured: true },
  { id: '2', name: 'InnovateTR', logo: '', order: 2, isActive: true, isFeatured: true },
  { id: '3', name: 'GrowthCo', logo: '', order: 3, isActive: true, isFeatured: true },
  { id: '4', name: 'ScaleUp', logo: '', order: 4, isActive: true, isFeatured: true },
  { id: '5', name: 'ModernBiz', logo: '', order: 5, isActive: true, isFeatured: true },
];

interface SocialProofProps {
  stats?: Stat[];
  partners?: Partner[];
}

export default function SocialProof({ stats, partners }: SocialProofProps) {
  const { t } = useTranslations();

  // Use CMS data or fallback to defaults
  const displayStats = stats && stats.length > 0 ? stats : defaultStats;
  const displayPartners = partners && partners.length > 0 ? partners : defaultPartners;

  // Format stat display value
  const formatStatValue = (stat: Stat) => {
    const prefix = stat.prefix || '';
    const suffix = stat.suffix || '';
    return `${prefix}${stat.value}${suffix}`;
  };

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[12px] uppercase tracking-wider text-slate-400 font-medium mb-8">
            {t('landing.socialProof.trustedBy')}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {displayPartners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-2"
              >
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={100}
                    height={32}
                    className="h-8 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="text-[15px] font-semibold text-slate-300 hover:text-slate-400 transition-colors">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {displayStats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-[28px] font-semibold text-slate-900 tracking-tight mb-1">
                {formatStatValue(stat)}
              </div>
              <div className="text-[13px] text-slate-500">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-[11px] text-slate-400 mt-1">
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
