'use client';

// Maintenance Mode Page
// Used during planned service upgrades or deployments

import React, { Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Settings, Clock, HelpCircle } from 'lucide-react';

const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#0c0f1a]" />,
});

export default function MaintenancePage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0c0f1a] flex flex-col items-center justify-center p-4">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <Suspense fallback={null}>
                    <GradientMesh />
                </Suspense>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Header Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-8 z-10"
            >
                <Image
                    src="/stoocker_white.png"
                    alt="Stoocker"
                    width={140}
                    height={40}
                    className="object-contain"
                    priority
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/50 overflow-hidden text-center relative">
                    {/* Animated Settings Icon */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 mb-8 mx-auto"
                    >
                        <Settings className="w-12 h-12 text-indigo-400" />
                    </motion.div>

                    <h1 style={{ color: 'white' }} className="text-4xl font-bold mb-4 tracking-tight">Kısa Bir Mola</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)' }} className="text-lg leading-relaxed mb-10 max-w-md mx-auto">
                        Sizlere daha iyi bir deneyim sunabilmek için sistemlerimizi modernize ediyoruz. Çok yakında buradayız.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
                            <Clock className="w-6 h-6 text-indigo-400 mb-3" />
                            <div style={{ color: 'white' }} className="text-sm font-bold uppercase tracking-widest mb-1">Tahmini Süre</div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-xs">15 - 30 Dakika</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
                            <HelpCircle className="w-6 h-6 text-emerald-400 mb-3" />
                            <div style={{ color: 'white' }} className="text-sm font-bold uppercase tracking-widest mb-1">Durum</div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-xs">Güncelleme Yapılıyor</div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <p style={{ color: 'rgba(255, 255, 255, 0.3)' }} className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
                            Anlık bilgi için bizi takip edin
                        </p>
                        <div className="flex justify-center gap-6">
                            <a href="#" style={{ color: 'white' }} className="opacity-40 hover:opacity-100 transition-opacity text-sm font-semibold underline underline-offset-4">X (Twitter)</a>
                            <a href="#" style={{ color: 'white' }} className="opacity-40 hover:opacity-100 transition-opacity text-sm font-semibold underline underline-offset-4">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer Decoration */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ color: 'rgba(255, 255, 255, 0.15)' }}
                className="absolute bottom-8 text-[10px] tracking-[0.4em] uppercase font-bold"
            >
                Stoocker Maintenance Protocols
            </motion.div>
        </div>
    );
}
