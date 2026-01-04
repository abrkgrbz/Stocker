import { z } from 'zod';
import {
    idSchema,
    optionalString,
    optionalDateSchema,
    quantitySchema,
    percentageSchema,
    dateSchema,
} from './common.schemas';

// Order item schema
export const orderItemSchema = z.object({
    productId: idSchema,
    productName: optionalString, // For display only
    quantity: quantitySchema,
    unitPrice: z.number().min(0, 'Fiyat negatif olamaz'),
    discountPercent: z.number().min(0).max(100).default(0),
    taxPercent: z.number().min(0).max(100).default(18),
});

export type OrderItemFormData = z.infer<typeof orderItemSchema>;

// Create Order schema
export const createOrderSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
    deliveryDate: optionalDateSchema,
    notes: optionalString,
    items: z.array(orderItemSchema).min(1, 'En az bir ürün eklemelisiniz'),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;

// Update Order schema
export const updateOrderSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçimi zorunludur').optional(),
    deliveryDate: optionalDateSchema,
    notes: optionalString,
    items: z.array(orderItemSchema).min(1, 'En az bir ürün eklemelisiniz').optional(),
    status: z.enum(['Draft', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).optional(),
});

export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;

// Invoice item schema
export const invoiceItemSchema = z.object({
    productId: idSchema,
    productName: optionalString,
    description: optionalString,
    quantity: quantitySchema,
    unitPrice: z.number().min(0, 'Fiyat negatif olamaz'),
    discountPercent: z.number().min(0).max(100).default(0),
    taxPercent: z.number().min(0).max(100).default(18),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

// Create Invoice schema
export const createInvoiceSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
    orderId: optionalString, // Can be linked to an order
    dueDate: z.string().min(1, 'Vade tarihi zorunludur'),
    notes: optionalString,
    items: z.array(invoiceItemSchema).min(1, 'En az bir kalem eklemelisiniz'),
});

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

// Update Invoice schema
export const updateInvoiceSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçimi zorunludur').optional(),
    dueDate: dateSchema.optional(),
    notes: optionalString,
    items: z.array(invoiceItemSchema).min(1, 'En az bir kalem eklemelisiniz').optional(),
    status: z.enum(['Draft', 'Sent', 'Paid', 'Partial', 'Overdue', 'Cancelled']).optional(),
});

export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;

// Quote item schema
export const quoteItemSchema = z.object({
    productId: idSchema,
    productName: optionalString,
    quantity: quantitySchema,
    unitPrice: z.number().min(0, 'Fiyat negatif olamaz'),
    discountPercent: z.number().min(0).max(100).default(0),
    taxPercent: z.number().min(0).max(100).default(18),
});

export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;

// Create Quote schema
export const createQuoteSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
    validUntil: z.string().min(1, 'Geçerlilik tarihi zorunludur'),
    notes: optionalString,
    items: z.array(quoteItemSchema).min(1, 'En az bir kalem eklemelisiniz'),
});

export type CreateQuoteFormData = z.infer<typeof createQuoteSchema>;

// Update Quote schema
export const updateQuoteSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçimi zorunludur').optional(),
    validUntil: dateSchema.optional(),
    notes: optionalString,
    items: z.array(quoteItemSchema).min(1, 'En az bir kalem eklemelisiniz').optional(),
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']).optional(),
});

export type UpdateQuoteFormData = z.infer<typeof updateQuoteSchema>;

// Helper type for items (used in ProductSelector)
export type SalesItem = {
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
};

// Calculate item total
export const calculateItemTotal = (item: SalesItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * ((item.discountPercent || 0) / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((item.taxPercent || 0) / 100);
    return afterDiscount + tax;
};

// Calculate order/invoice/quote total
export const calculateTotal = (items: SalesItem[]): number => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
};

// Calculate subtotal (before tax)
export const calculateSubtotal = (items: SalesItem[]): number => {
    return items.reduce((total, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const discount = subtotal * ((item.discountPercent || 0) / 100);
        return total + (subtotal - discount);
    }, 0);
};

// Calculate total tax
export const calculateTotalTax = (items: SalesItem[]): number => {
    return items.reduce((total, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const discount = subtotal * ((item.discountPercent || 0) / 100);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * ((item.taxPercent || 0) / 100);
        return total + tax;
    }, 0);
};

// Calculate total discount
export const calculateTotalDiscount = (items: SalesItem[]): number => {
    return items.reduce((total, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const discount = subtotal * ((item.discountPercent || 0) / 100);
        return total + discount;
    }, 0);
};
