import React from 'react';
import { Sidebar } from './Sidebar';
import { GradientMesh } from '@/components/ui/GradientMesh';
import { Search, Bell, Grid, Command, Sun, Moon } from 'lucide-react';
import { ToastContainer } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen font-sans flex relative overflow-x-hidden bg-brand-950 text-text-main transition-colors duration-300">
            {/* Background Mesh - Lower Opacity to be safe */}
            <GradientMesh />
            <ToastContainer />

            {/* Sidebar - Fixed width */}
            <div className="w-80 flex-shrink-0 relative z-50">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen relative z-10 flex flex-col min-w-0">
                {/* Top Navigation */}
                <header className="flex items-center justify-between px-8 py-4 m-8 glass-card mx-8 mt-8 mb-4 border-border-subtle">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Her şeyi ara..."
                                className="bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-6 text-sm placeholder:text-text-muted focus:outline-none focus:border-indigo-500/30 w-80 transition-all text-text-main"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 text-text-muted">
                                <Command className="w-3 h-3" />
                                <span className="text-[10px] font-bold">K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-text-muted hover:text-text-main transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-brand-950 transition-colors duration-300" />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-text-muted hover:text-text-main transition-colors">
                            <Grid className="w-5 h-5" />
                        </button>
                        <div className="h-4 w-[1px] bg-border-subtle" />
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-text-main tracking-wide transition-colors duration-300">26 Ocak 2026</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold transition-colors duration-300">Mali Dönem: Q1</p>
                        </div>
                    </div>
                </header>

                {/* Content View */}
                <div className="p-10 pt-4 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
};
