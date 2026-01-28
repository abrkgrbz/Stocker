import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { migrationService } from '@/services/migrationService';
import { toast } from '@/components/ui/Toast';
import { Copy, Loader2, FileCode } from 'lucide-react';

interface MigrationPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    moduleName: string;
    migrationName: string;
}

export const MigrationPreviewModal: React.FC<MigrationPreviewModalProps> = ({
    isOpen,
    onClose,
    tenantId,
    moduleName,
    migrationName
}) => {
    const [script, setScript] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && tenantId && moduleName && migrationName) {
            loadPreview();
        }
    }, [isOpen, tenantId, moduleName, migrationName]);

    const loadPreview = async () => {
        try {
            setLoading(true);
            const data = await migrationService.getMigrationScriptPreview(tenantId, moduleName, migrationName);
            setScript(data.sql);
        } catch (error) {
            toast.error('Önizleme yüklenemedi.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(script);
        toast.success('SQL kopyalandı');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Migration Önizleme"
            maxWidth="max-w-4xl"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <FileCode className="w-4 h-4" />
                    <span className="font-mono text-indigo-400">{moduleName}</span>
                    <span>/</span>
                    <span className="font-mono text-indigo-400">{migrationName}</span>
                </div>

                <div className="relative">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 bg-black/50 rounded-xl border border-border-subtle">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="relative group">
                            <pre className="bg-[#1e1e1e] p-4 rounded-xl border border-border-subtle overflow-auto max-h-[60vh] custom-scrollbar text-xs font-mono text-gray-300">
                                {script}
                            </pre>
                            <button
                                onClick={copyToClipboard}
                                className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                                title="Kopyala"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                    >
                        Kapat
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
