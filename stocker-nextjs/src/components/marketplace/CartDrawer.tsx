
import React, { useState, useEffect } from 'react';
import { Drawer, Button, List, Divider, message, Spin } from 'antd';
import { ShoppingCart, Trash2, CreditCard, Package, Layers, Plus } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { cartService } from '@/lib/api/services/cartService';

export const CartDrawer: React.FC = () => {
    const { cart, isOpen, isLoading, toggleCart, removeItem, fetchCart } = useCartStore();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState<string | null>(null);

    // Initial fetch
    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen]);

    // If checkout form exists, render it
    useEffect(() => {
        if (checkoutForm) {
            const container = document.getElementById('iyzico-checkout-container');
            if (container) {
                container.innerHTML = checkoutForm;
                // Execute any scripts in the form content if necessary, 
                // though Iyzico usually caches script execution. 
                // React dangerouslySetInnerHTML might be safer for structure but scripts needs care.
                // For now assuming the content is sufficient.
            }
        }
    }, [checkoutForm]);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            const response = await cartService.initiateCheckout({
                billingAddress: {
                    name: 'Demo Tenant', // Should be dynamic from User/Tenant context
                    address: 'Teknopark Istanbul',
                    city: 'Istanbul',
                    country: 'Turkey',
                    zipCode: '34906',
                    taxId: '1234567890'
                },
                callbackUrl: window.location.origin + '/billing/callback'
            });

            setCheckoutForm(response.checkoutFormContent);

        } catch (error) {
            message.error('Ödeme başlatılamadı.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Module': return <Package className="w-4 h-4 text-indigo-500" />;
            case 'Bundle': return <Layers className="w-4 h-4 text-emerald-500" />;
            case 'AddOn': return <Plus className="w-4 h-4 text-amber-500" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Sepetim ({cart?.itemCount || 0})</span>
                </div>
            }
            placement="right"
            onClose={() => {
                toggleCart(false);
                setCheckoutForm(null); // Reset checkout flow on close
            }}
            open={isOpen}
            width={480}
        >
            {checkoutForm ? (
                <div className="h-full flex flex-col">
                    <div className="mb-4">
                        <h3 className="font-bold text-lg mb-2">Ödeme Ekranı</h3>
                        <p className="text-sm text-slate-500">Lütfen ödeme işlemini tamamlayınız.</p>
                    </div>
                    <div id="iyzico-checkout-container" className="flex-1 overflow-y-auto"></div>
                    <Button onClick={() => setCheckoutForm(null)} className="mt-4">Geri Dön</Button>
                </div>
            ) : (
                <>
                    {isLoading && !cart ? (
                        <div className="flex justify-center p-10"><Spin /></div>
                    ) : (!cart || cart.items.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Sepetiniz boş</p>
                            <p className="text-sm">Hadi alışverişe başlayalım!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto -mx-6 px-6">
                                <ul className="space-y-4">
                                    {cart.items.map((item) => (
                                        <li key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                {getIcon(item.itemType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-slate-900 text-sm">{item.itemName}</h4>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-slate-400 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 capitalize">{item.itemTypeDisplay}</p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                                        {cart.billingCycleDisplay}
                                                    </span>
                                                    <span className="font-semibold text-slate-900">₺{item.lineTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-100 bg-white">
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>Ara Toplam</span>
                                        <span>₺{cart.subTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>İndirim</span>
                                        <span className={cart.discountTotal > 0 ? 'text-emerald-600' : ''}>
                                            -₺{cart.discountTotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100">
                                        <span>Toplam</span>
                                        <span>₺{cart.total.toLocaleString()} {cart.currency}</span>
                                    </div>
                                </div>

                                <Button
                                    type="primary"
                                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 text-base"
                                    onClick={handleCheckout}
                                    loading={isCheckingOut}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Ödemeye Geç
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Drawer>
    );
};
