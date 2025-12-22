/**
 * SalesOrder Service
 *
 * Ported from C# Stocker.Modules.Sales.Domain.Entities.SalesOrder
 * Contains all business logic for sales order operations
 */

import { PrismaClient, SalesOrder, SalesOrderItem, SalesOrderStatus } from '@prisma/client';
import { Result, AppError } from '../../domain/common/result';

// ============================================
// DTOs
// ============================================

export interface CreateSalesOrderDto {
  orderNumber: string;
  orderDate: Date | string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  currency?: string;
  warehouseId?: number;
  notes?: string;
}

export interface CreateSalesOrderItemDto {
  productId?: number;
  productCode: string;
  productName: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  discountRate?: number;
}

export interface UpdateSalesOrderDto {
  deliveryDate?: Date | string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  salesPersonId?: string;
  salesPersonName?: string;
}

export interface ApplyDiscountDto {
  discountAmount?: number;
  discountRate?: number;
}

// ============================================
// Service Response Types
// ============================================

export type SalesOrderWithItems = SalesOrder & {
  items: SalesOrderItem[];
};

// ============================================
// Service Class
// ============================================

export class SalesOrderService {
  constructor(private readonly prisma: PrismaClient) {}

  // ============================================
  // Query Methods
  // ============================================

  async findById(id: string): Promise<Result<SalesOrderWithItems>> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id, isDeleted: false },
      include: { items: true },
    });

    if (!order) {
      return Result.failure<SalesOrderWithItems>(AppError.notFound('SalesOrder', 'Order not found'));
    }

    return Result.success(order);
  }

  async findByOrderNumber(orderNumber: string): Promise<Result<SalesOrderWithItems>> {
    const order = await this.prisma.salesOrder.findFirst({
      where: { orderNumber, isDeleted: false },
      include: { items: true },
    });

    if (!order) {
      return Result.failure<SalesOrderWithItems>(AppError.notFound('SalesOrder', 'Order not found'));
    }

    return Result.success(order);
  }

  async list(params: {
    pageNumber?: number;
    pageSize?: number;
    status?: SalesOrderStatus;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<Result<{ items: SalesOrderWithItems[]; totalCount: number }>> {
    const { pageNumber = 1, pageSize = 20, status, customerId, startDate, endDate, search } = params;

    const where: any = { isDeleted: false };

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate) where.orderDate = { ...where.orderDate, gte: startDate };
    if (endDate) where.orderDate = { ...where.orderDate, lte: endDate };
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: { items: true },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: { orderDate: 'desc' },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return Result.success({ items, totalCount });
  }

  // ============================================
  // Command Methods (Business Logic)
  // ============================================

  /**
   * Create a new sales order
   * Ported from: SalesOrder.Create()
   */
  async create(dto: CreateSalesOrderDto, userId: string): Promise<Result<SalesOrder>> {
    // Validation (from SalesOrder.Create)
    if (!dto.orderNumber?.trim()) {
      return Result.failure(
        AppError.validation('SalesOrder.OrderNumber', 'Order number is required')
      );
    }

    // Check for duplicate order number
    const existing = await this.prisma.salesOrder.findUnique({
      where: { orderNumber: dto.orderNumber },
    });

    if (existing) {
      return Result.failure(
        AppError.conflict('SalesOrder.OrderNumber', 'Order number already exists')
      );
    }

    // Create order (matching C# factory method)
    const order = await this.prisma.salesOrder.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber: dto.orderNumber,
        orderDate: new Date(dto.orderDate),
        customerId: dto.customerId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        currency: dto.currency || 'TRY',
        exchangeRate: 1,
        warehouseId: dto.warehouseId,
        notes: dto.notes,
        status: SalesOrderStatus.DRAFT,
        subTotal: 0,
        discountAmount: 0,
        discountRate: 0,
        vatAmount: 0,
        totalAmount: 0,
        isApproved: false,
        isCancelled: false,
        createdAt: new Date(),
        createdBy: userId,
      },
    });

    return Result.success(order);
  }

  /**
   * Add item to order
   * Ported from: SalesOrder.AddItem()
   */
  async addItem(orderId: string, dto: CreateSalesOrderItemDto): Promise<Result<SalesOrderItem>> {
    // Get order with items
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    // Business rule: Cannot add items to non-draft order
    if (order.status !== SalesOrderStatus.DRAFT) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Cannot add items to a non-draft order')
      );
    }

    // Validate item
    if (!dto.productCode?.trim()) {
      return Result.failure(
        AppError.validation('SalesOrderItem.ProductCode', 'Product code is required')
      );
    }

    if (!dto.productName?.trim()) {
      return Result.failure(
        AppError.validation('SalesOrderItem.ProductName', 'Product name is required')
      );
    }

    if (dto.quantity <= 0) {
      return Result.failure(
        AppError.validation('SalesOrderItem.Quantity', 'Quantity must be greater than zero')
      );
    }

    if (dto.unitPrice < 0) {
      return Result.failure(
        AppError.validation('SalesOrderItem.UnitPrice', 'Unit price cannot be negative')
      );
    }

    const vatRate = dto.vatRate ?? 18;
    if (vatRate < 0 || vatRate > 100) {
      return Result.failure(
        AppError.validation('SalesOrderItem.VatRate', 'VAT rate must be between 0 and 100')
      );
    }

    // Calculate line amounts
    const discountRate = dto.discountRate ?? 0;
    const subtotal = dto.unitPrice * dto.quantity;
    const discountAmount = subtotal * discountRate / 100;
    const discountedAmount = subtotal - discountAmount;
    const vatAmount = discountedAmount * vatRate / 100;
    const lineTotal = discountedAmount + vatAmount;

    // Determine line number
    const lineNumber = order.items.length + 1;

    // Create item in transaction with totals recalculation
    const item = await this.prisma.$transaction(async (tx) => {
      const newItem = await tx.salesOrderItem.create({
        data: {
          id: crypto.randomUUID(),
          salesOrderId: orderId,
          productId: dto.productId,
          productCode: dto.productCode,
          productName: dto.productName,
          description: dto.description,
          unit: dto.unit || 'Adet',
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
          discountRate,
          discountAmount,
          vatRate,
          vatAmount,
          lineTotal,
          lineNumber,
          deliveredQuantity: 0,
          isDelivered: false,
          createdAt: new Date(),
        },
      });

      // Recalculate order totals
      await this.recalculateTotals(tx, orderId);

      return newItem;
    });

    return Result.success(item);
  }

  /**
   * Remove item from order
   * Ported from: SalesOrder.RemoveItem()
   */
  async removeItem(orderId: string, itemId: string): Promise<Result<void>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    // Business rule: Cannot remove items from non-draft order
    if (order.status !== SalesOrderStatus.DRAFT) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Cannot remove items from a non-draft order')
      );
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      return Result.failure(AppError.notFound('SalesOrder.Item', 'Item not found'));
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.salesOrderItem.delete({ where: { id: itemId } });
      await this.recalculateTotals(tx, orderId);
    });

    return Result.success();
  }

  /**
   * Approve order
   * Ported from: SalesOrder.Approve()
   */
  async approve(orderId: string, userId: string): Promise<Result<SalesOrder>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    // Business rules from C#
    if (order.isApproved) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order is already approved')
      );
    }

    if (order.isCancelled) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Cannot approve a cancelled order')
      );
    }

    if (order.items.length === 0) {
      return Result.failure(
        AppError.validation('SalesOrder.Items', 'Cannot approve an order without items')
      );
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        isApproved: true,
        approvedBy: userId,
        approvedDate: new Date(),
        status: SalesOrderStatus.APPROVED,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return Result.success(updated);
  }

  /**
   * Confirm order
   * Ported from: SalesOrder.Confirm()
   */
  async confirm(orderId: string, userId: string): Promise<Result<SalesOrder>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    if (!order.isApproved) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order must be approved before confirming')
      );
    }

    if (order.status !== SalesOrderStatus.APPROVED) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order must be in approved status')
      );
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        status: SalesOrderStatus.CONFIRMED,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return Result.success(updated);
  }

  /**
   * Ship order
   * Ported from: SalesOrder.Ship()
   */
  async ship(orderId: string, userId: string): Promise<Result<SalesOrder>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    if (order.status !== SalesOrderStatus.CONFIRMED) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order must be confirmed before shipping')
      );
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        status: SalesOrderStatus.SHIPPED,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return Result.success(updated);
  }

  /**
   * Deliver order
   * Ported from: SalesOrder.Deliver()
   */
  async deliver(orderId: string, userId: string): Promise<Result<SalesOrder>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    if (order.status !== SalesOrderStatus.SHIPPED) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order must be shipped before delivering')
      );
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        status: SalesOrderStatus.DELIVERED,
        deliveryDate: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return Result.success(updated);
  }

  /**
   * Complete order
   * Ported from: SalesOrder.Complete()
   */
  async complete(orderId: string, userId: string): Promise<Result<SalesOrder>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    if (order.status !== SalesOrderStatus.DELIVERED) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order must be delivered before completing')
      );
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        status: SalesOrderStatus.COMPLETED,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return Result.success(updated);
  }

  /**
   * Cancel order
   * Ported from: SalesOrder.Cancel()
   */
  async cancel(orderId: string, reason: string, userId: string): Promise<Result<SalesOrder>> {
    const orderResult = await this.findById(orderId);
    if (orderResult.isFailure) {
      return Result.failure(orderResult.error);
    }

    const order = orderResult.value;

    if (order.isCancelled) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Order is already cancelled')
      );
    }

    if (order.status === SalesOrderStatus.COMPLETED) {
      return Result.failure(
        AppError.conflict('SalesOrder.Status', 'Cannot cancel a completed order')
      );
    }

    if (!reason?.trim()) {
      return Result.failure(
        AppError.validation('SalesOrder.CancellationReason', 'Cancellation reason is required')
      );
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        isCancelled: true,
        cancellationReason: reason,
        status: SalesOrderStatus.CANCELLED,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return Result.success(updated);
  }

  /**
   * Apply discount
   * Ported from: SalesOrder.ApplyDiscount()
   */
  async applyDiscount(orderId: string, dto: ApplyDiscountDto, userId: string): Promise<Result<SalesOrder>> {
    const discountAmount = dto.discountAmount ?? 0;
    const discountRate = dto.discountRate ?? 0;

    if (discountAmount < 0) {
      return Result.failure(
        AppError.validation('SalesOrder.DiscountAmount', 'Discount amount cannot be negative')
      );
    }

    if (discountRate < 0 || discountRate > 100) {
      return Result.failure(
        AppError.validation('SalesOrder.DiscountRate', 'Discount rate must be between 0 and 100')
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          discountAmount,
          discountRate,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      await this.recalculateTotals(tx, orderId);

      return tx.salesOrder.findUnique({ where: { id: orderId } });
    });

    return Result.success(updated!);
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Recalculate order totals
   * Ported from: SalesOrder.RecalculateTotals()
   */
  private async recalculateTotals(
    tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
    orderId: string
  ): Promise<void> {
    const items = await tx.salesOrderItem.findMany({
      where: { salesOrderId: orderId },
    });

    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    const subTotal = items.reduce((sum, item) => sum + Number(item.lineTotal) - Number(item.vatAmount), 0);
    const vatAmount = items.reduce((sum, item) => sum + Number(item.vatAmount), 0);

    let totalDiscount = Number(order.discountAmount);
    if (Number(order.discountRate) > 0) {
      totalDiscount += subTotal * Number(order.discountRate) / 100;
    }

    const totalAmount = subTotal + vatAmount - totalDiscount;

    await tx.salesOrder.update({
      where: { id: orderId },
      data: {
        subTotal,
        vatAmount,
        totalAmount,
        updatedAt: new Date(),
      },
    });
  }
}
