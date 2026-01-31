import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Layout, LifeBuoy, ArrowRight, Zap } from 'lucide-react';
import { GradientMesh } from '@/components/ui/GradientMesh';
import { motion } from 'framer-motion';

export const NavigatorPage: React.FC = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const systems = [
        {
            id: 'master',
            title: 'Master Yönetimi',
            description: 'Tenantlar, abonelikler ve sistem yapılandırması.',
            icon: Shield,
            path: '/dashboard',
            color: 'from-indigo-500 to-indigo-600',
            bgGlow: 'bg-indigo-500/20'
        },
        {
            id: 'cms',
            title: 'CMS Sistemi',
            description: 'Frontend içerik yönetimi ve sayfa tasarımları.',
            icon: Layout,
            path: '/cms',
            color: 'from-fuchsia-500 to-fuchsia-600',
            bgGlow: 'bg-fuchsia-500/20'
        },
        {
            id: 'help',
            title: 'Destek Merkezi',
            description: 'Destek kayıtları ve müşteri yardım masası.',
            icon: LifeBuoy,
            path: '/help',
            color: 'from-emerald-500 to-emerald-600',
            bgGlow: 'bg-emerald-500/20'
        }
    ];

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-brand-950 text-text-main font-sans selection:bg-indigo-500/30">
            <GradientMesh />

            <div className="relative z-10 w-full max-w-7xl px-6">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Stocker Suite
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-lg text-text-muted max-w-2xl mx-auto font-light"
                    >
                        Lütfen yönetmek istediğiniz sistemi seçin. Her modül kendi özel yönetim araçlarına sahiptir.
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {systems.map((system, index) => (
                        <motion.div
                            key={system.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                            onMouseEnter={() => setHoveredCard(system.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => navigate(system.path)}
                            className="group relative cursor-pointer"
                        >
                            <div className={`
                                absolute inset-0 rounded-3xl transition-all duration-500 blur-xl opacity-0 
                                ${hoveredCard === system.id ? 'opacity-100' : ''} 
                                ${system.bgGlow}
                            `} />

                            <div className="relative h-full glass-card p-8 rounded-3xl border border-border-subtle group-hover:border-white/10 transition-all duration-300 flex flex-col">
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
                                    bg-gradient-to-br ${system.color} shadow-lg 
                                    group-hover:scale-110 transition-transform duration-300
                                `}>
                                    <system.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-200 transition-colors">
                                    {system.title}
                                </h3>

                                <p className="text-text-muted mb-8 leading-relaxed">
                                    {system.description}
                                </p>

                                <div className="mt-auto flex items-center text-sm font-semibold text-text-muted group-hover:text-white transition-colors">
                                    <span>Sisteme Git</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <p className="text-sm text-text-muted opacity-50">
                        &copy; 2026 Stocker Inc. Tüm hakları saklıdır. v2.0.0
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
