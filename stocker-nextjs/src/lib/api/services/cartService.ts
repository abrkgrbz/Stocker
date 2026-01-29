
import axios from 'axios';
import {
    CartDto,
    CreateCartRequest,
    AddModuleRequest,
    AddBundleRequest,
    AddAddOnRequest,
    UpdateQuantityRequest,
    CheckoutRequest,
    CheckoutResponse
} from '@/lib/api/types/cartIds';

class CartService {
    private baseUrl = '/api/tenant/cart';

    async getCart(): Promise<CartDto> {
        const response = await axios.get<{ success: boolean; data: CartDto }>(this.baseUrl);
        return response.data.data;
    }

    async createCart(request: CreateCartRequest): Promise<CartDto> {
        const response = await axios.post<{ success: boolean; data: CartDto }>(this.baseUrl, request);
        return response.data.data;
    }

    async addModule(request: AddModuleRequest): Promise<CartDto> {
        const response = await axios.post<{ success: boolean; data: CartDto }>(`${this.baseUrl}/modules`, request);
        return response.data.data;
    }

    async addBundle(request: AddBundleRequest): Promise<CartDto> {
        const response = await axios.post<{ success: boolean; data: CartDto }>(`${this.baseUrl}/bundles`, request);
        return response.data.data;
    }

    async addAddOn(request: AddAddOnRequest): Promise<CartDto> {
        const response = await axios.post<{ success: boolean; data: CartDto }>(`${this.baseUrl}/addons`, request);
        return response.data.data;
    }

    async updateQuantity(itemId: string, request: UpdateQuantityRequest): Promise<void> {
        await axios.put(`${this.baseUrl}/items/${itemId}/quantity`, request);
    }

    async removeItem(itemId: string): Promise<CartDto> {
        const response = await axios.delete<{ success: boolean; data: CartDto }>(`${this.baseUrl}/items/${itemId}`);
        return response.data.data;
    }

    async clearCart(): Promise<void> {
        await axios.delete(this.baseUrl);
    }

    async initiateCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        const response = await axios.post<{ success: boolean; data: CheckoutResponse }>(`${this.baseUrl}/checkout`, request);
        return response.data.data;
    }
}

export const cartService = new CartService();
