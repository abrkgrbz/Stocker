import { useQuery } from '@tanstack/react-query';
import { crmService } from '../services/crm.service';
import { inventoryService } from '../services/inventory.service';
import { hrService } from '../services/hr.service';
import { salesService } from '../services/sales.service';
import type { Customer, Deal } from '../types/crm.types';
import type { Product } from '../types/inventory.types';
import type { Employee } from '../types/hr.types';
import type { Order, Invoice, Quote } from '../types/sales.types';

// Search result types
export interface SearchResult {
    type: 'customer' | 'deal' | 'product' | 'employee' | 'order' | 'invoice' | 'quote';
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    route: string;
    data: any;
}

export interface GlobalSearchResults {
    customers: SearchResult[];
    products: SearchResult[];
    employees: SearchResult[];
    orders: SearchResult[];
    invoices: SearchResult[];
    quotes: SearchResult[];
    all: SearchResult[];
    totalCount: number;
}

// Map results to unified format
function mapCustomerToResult(customer: Customer): SearchResult {
    return {
        type: 'customer',
        id: customer.id,
        title: customer.name,
        subtitle: customer.email || customer.phone,
        icon: 'Users',
        route: '/(dashboard)/crm/customer/[id]',
        data: customer,
    };
}

function mapProductToResult(product: Product): SearchResult {
    return {
        type: 'product',
        id: product.id,
        title: product.name,
        subtitle: `SKU: ${product.sku} • ${product.price?.toLocaleString('tr-TR')} ₺`,
        icon: 'Package',
        route: '/(dashboard)/inventory/product/[id]',
        data: product,
    };
}

function mapEmployeeToResult(employee: Employee): SearchResult {
    return {
        type: 'employee',
        id: employee.id,
        title: `${employee.firstName} ${employee.lastName}`,
        subtitle: employee.positionName || employee.departmentName,
        icon: 'UserCircle',
        route: '/(dashboard)/hr/employee/[id]',
        data: employee,
    };
}

function mapOrderToResult(order: Order): SearchResult {
    return {
        type: 'order',
        id: order.id,
        title: `Sipariş #${order.orderNumber}`,
        subtitle: `${order.customerName} • ${order.totalAmount?.toLocaleString('tr-TR')} ₺`,
        icon: 'ShoppingCart',
        route: '/(dashboard)/sales/order/[id]',
        data: order,
    };
}

function mapInvoiceToResult(invoice: Invoice): SearchResult {
    return {
        type: 'invoice',
        id: invoice.id,
        title: `Fatura #${invoice.invoiceNumber}`,
        subtitle: `${invoice.customerName} • ${invoice.totalAmount?.toLocaleString('tr-TR')} ₺`,
        icon: 'FileText',
        route: '/(dashboard)/sales/invoice/[id]',
        data: invoice,
    };
}

function mapQuoteToResult(quote: Quote): SearchResult {
    return {
        type: 'quote',
        id: quote.id,
        title: `Teklif #${quote.quoteNumber}`,
        subtitle: `${quote.customerName} • ${quote.totalAmount?.toLocaleString('tr-TR')} ₺`,
        icon: 'FileCheck',
        route: '/(dashboard)/sales/quote/[id]',
        data: quote,
    };
}

// Search configuration
export type SearchCategory = 'all' | 'customers' | 'products' | 'employees' | 'orders' | 'invoices' | 'quotes';

export const SEARCH_CATEGORIES: { key: SearchCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'Tümü', icon: 'Search' },
    { key: 'customers', label: 'Müşteriler', icon: 'Users' },
    { key: 'products', label: 'Ürünler', icon: 'Package' },
    { key: 'employees', label: 'Çalışanlar', icon: 'UserCircle' },
    { key: 'orders', label: 'Siparişler', icon: 'ShoppingCart' },
    { key: 'invoices', label: 'Faturalar', icon: 'FileText' },
    { key: 'quotes', label: 'Teklifler', icon: 'FileCheck' },
];

// Global search hook
export function useGlobalSearch(
    query: string,
    category: SearchCategory = 'all',
    limit: number = 10
) {
    return useQuery({
        queryKey: ['globalSearch', query, category, limit],
        queryFn: async (): Promise<GlobalSearchResults> => {
            if (!query || query.length < 2) {
                return {
                    customers: [],
                    products: [],
                    employees: [],
                    orders: [],
                    invoices: [],
                    quotes: [],
                    all: [],
                    totalCount: 0,
                };
            }

            const results: GlobalSearchResults = {
                customers: [],
                products: [],
                employees: [],
                orders: [],
                invoices: [],
                quotes: [],
                all: [],
                totalCount: 0,
            };

            // Parallel search based on category
            const searchPromises: Promise<void>[] = [];

            if (category === 'all' || category === 'customers') {
                searchPromises.push(
                    crmService.searchCustomers(query)
                        .then(customers => {
                            results.customers = customers.slice(0, limit).map(mapCustomerToResult);
                        })
                        .catch(() => { /* ignore errors */ })
                );
            }

            if (category === 'all' || category === 'products') {
                searchPromises.push(
                    inventoryService.searchProducts(query)
                        .then(products => {
                            results.products = products.slice(0, limit).map(mapProductToResult);
                        })
                        .catch(() => { /* ignore errors */ })
                );
            }

            if (category === 'all' || category === 'employees') {
                searchPromises.push(
                    hrService.searchEmployees(query)
                        .then(employees => {
                            results.employees = employees.slice(0, limit).map(mapEmployeeToResult);
                        })
                        .catch(() => { /* ignore errors */ })
                );
            }

            if (category === 'all' || category === 'orders') {
                searchPromises.push(
                    salesService.searchOrders(query)
                        .then(orders => {
                            results.orders = orders.slice(0, limit).map(mapOrderToResult);
                        })
                        .catch(() => { /* ignore errors */ })
                );
            }

            if (category === 'all' || category === 'invoices') {
                searchPromises.push(
                    salesService.searchInvoices(query)
                        .then(invoices => {
                            results.invoices = invoices.slice(0, limit).map(mapInvoiceToResult);
                        })
                        .catch(() => { /* ignore errors */ })
                );
            }

            // Wait for all searches
            await Promise.all(searchPromises);

            // Combine all results
            results.all = [
                ...results.customers,
                ...results.products,
                ...results.employees,
                ...results.orders,
                ...results.invoices,
                ...results.quotes,
            ];

            results.totalCount = results.all.length;

            return results;
        },
        enabled: query.length >= 2,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Recent searches hook
const RECENT_SEARCHES_KEY = '@stocker/recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
    return useQuery({
        queryKey: ['recentSearches'],
        queryFn: async (): Promise<string[]> => {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            return stored ? JSON.parse(stored) : [];
        },
        staleTime: Infinity,
    });
}

export async function addRecentSearch(query: string): Promise<void> {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    const searches: string[] = stored ? JSON.parse(stored) : [];

    // Remove if exists and add to front
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query);

    // Keep only recent items
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
}

export async function clearRecentSearches(): Promise<void> {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
}
