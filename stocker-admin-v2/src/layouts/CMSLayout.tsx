import React from 'react';
import { CMSSidebar } from './CMSSidebar';
import { GradientMesh } from '../components/ui/GradientMesh';
import { ToastContainer } from '../components/ui/Toast';

export const CMSLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen font-sans flex relative overflow-x-hidden bg-brand-950 text-text-main transition-colors duration-300">
            {/* Background Mesh */}
            <GradientMesh />
            <ToastContainer />

            {/* CMS Sidebar */}
            <div className="flex-shrink-0 relative z-50">
                <CMSSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col min-w-0 h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pb-20">
                    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
