
import { create } from 'zustand';
import { cartService } from '@/lib/api/services/cartService';
import { CartDto } from '@/lib/api/types/cartIds';
import { message } from 'antd';

interface CartState {
    cart: CartDto | null;
    isOpen: boolean;
    isLoading: boolean;

    // Actions
    fetchCart: () => Promise<void>;

    addModule: (moduleCode: string) => Promise<void>;
    addBundle: (bundleCode: string) => Promise<void>;
    addAddOn: (addOnCode: string) => Promise<void>;

    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;

    toggleCart: (isOpen?: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isOpen: false,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const cart = await cartService.getCart();
            set({ cart, isLoading: false });
        } catch (error) {
            // If 404, it just means no active cart, which is fine
            set({ cart: null, isLoading: false });
        }
    },

    addModule: async (moduleCode: string) => {
        set({ isLoading: true });
        try {
            // If no cart exists, we might need to create one first, 
            // but traditionally the backend 'add' endpoint should handle 
            // "get active cart or create new" logic usually. 
            // If strictly separate, we'd check get().cart here.
            // Assuming the backend endpoint handles "current active cart".

            // If cart is null, we might try to create it, or let the backend handle it.
            // Let's assume we try to add, if 404 (no cart), we create then add.
            // For simplicity in this step, let's assume one-step add or create-then-add logic exists in backend or here.
            // Let's try adding directly.

            let cart: CartDto;
            try {
                cart = await cartService.addModule({ moduleCode });
            } catch (e: any) {
                // If cart not found/active, create one
                if (e.response?.status === 404) {
                    await cartService.createCart({ billingCycle: 'Monthly', currency: 'TRY' });
                    cart = await cartService.addModule({ moduleCode });
                } else {
                    throw e;
                }
            }

            set({ cart, isOpen: true, isLoading: false });
            message.success('Modül sepeta eklendi');
        } catch (error) {
            console.error(error);
            message.error('Sepete eklenirken hata oluştu');
            set({ isLoading: false });
        }
    },

    addBundle: async (bundleCode: string) => {
        set({ isLoading: true });
        try {
            let cart: CartDto;
            try {
                cart = await cartService.addBundle({ bundleCode });
            } catch (e: any) {
                if (e.response?.status === 404) {
                    await cartService.createCart({ billingCycle: 'Monthly', currency: 'TRY' });
                    cart = await cartService.addBundle({ bundleCode });
                } else {
                    throw e;
                }
            }
            set({ cart, isOpen: true, isLoading: false });
            message.success('Paket sepete eklendi');
        } catch (error) {
            console.error(error);
            message.error('Sepete eklenirken hata oluştu');
            set({ isLoading: false });
        }
    },

    addAddOn: async (addOnCode: string) => {
        set({ isLoading: true });
        try {
            let cart: CartDto;
            try {
                cart = await cartService.addAddOn({ addOnCode, quantity: 1 });
            } catch (e: any) {
                if (e.response?.status === 404) {
                    await cartService.createCart({ billingCycle: 'Monthly', currency: 'TRY' });
                    cart = await cartService.addAddOn({ addOnCode, quantity: 1 });
                } else {
                    throw e;
                }
            }
            set({ cart, isOpen: true, isLoading: false });
            message.success('Eklenti sepete eklendi');
        } catch (error) {
            console.error(error);
            message.error('Sepete eklenirken hata oluştu');
            set({ isLoading: false });
        }
    },

    removeItem: async (itemId: string) => {
        set({ isLoading: true });
        try {
            const cart = await cartService.removeItem(itemId);
            set({ cart, isLoading: false });
        } catch (error) {
            message.error('Ürün silinemedi');
            set({ isLoading: false });
        }
    },

    clearCart: async () => {
        set({ isLoading: true });
        try {
            await cartService.clearCart();
            set({ cart: null, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    toggleCart: (isOpen) => set({ isOpen: isOpen ?? !get().isOpen }),
}));
