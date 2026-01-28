import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // Assuming Input exists and matches usage
import { useMigrations } from '@/hooks/useMigrations';
import { toast } from '@/components/ui/Toast';
import { Calendar, Save } from 'lucide-react';

interface ScheduleMigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenants: any[];
}

export const ScheduleMigrationModal: React.FC<ScheduleMigrationModalProps> = ({
    isOpen,
    onClose,
    tenants
}) => {
    const { scheduleMigration, isScheduling } = useMigrations();

    const [formData, setFormData] = useState({
        tenantId: '',
        scheduledTime: '',
        migrationName: '',
        moduleName: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tenantId || !formData.scheduledTime) {
            toast.error('Lütfen zorunlu alanları doldurun.');
            return;
        }

        try {
            await scheduleMigration({
                tenantId: formData.tenantId,
                scheduledTime: new Date(formData.scheduledTime),
                migrationName: formData.migrationName || '',
                moduleName: formData.moduleName || ''
            });
            toast.success('Migration başarıyla zamanlandı.');
            onClose();
            setFormData({
                tenantId: '',
                scheduledTime: '',
                migrationName: '',
                moduleName: ''
            });
        } catch (error) {
            toast.error('Migration zamanlanırken bir hata oluştu.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Migration Zamanla"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Tenant</label>
                    <select
                        name="tenantId"
                        value={formData.tenantId}
                        onChange={handleChange}
                        className="w-full bg-brand-950/20 border border-border-subtle rounded-xl p-3 text-text-main focus:border-indigo-500 focus:outline-none transition-colors"
                        required
                    >
                        <option value="">Tenant Seçin</option>
                        {tenants?.map((tenant: any) => (
                            <option key={tenant.tenantId} value={tenant.tenantId}>
                                {tenant.tenantName} ({tenant.tenantCode})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Zaman</label>
                    <div className="relative">
                        <Input
                            type="datetime-local"
                            name="scheduledTime"
                            value={formData.scheduledTime}
                            onChange={handleChange}
                            required
                            className="pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Modül (Opsiyonel)</label>
                    <Input
                        name="moduleName"
                        value={formData.moduleName}
                        onChange={handleChange}
                        placeholder="Örn: Auth"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Migration Adı (Opsiyonel)</label>
                    <Input
                        name="migrationName"
                        value={formData.migrationName}
                        onChange={handleChange}
                        placeholder="Örn: 20240101_InitialCreate"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        variant="primary"
                        icon={Save}
                        disabled={isScheduling}
                        type="submit"
                    >
                        {isScheduling ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
