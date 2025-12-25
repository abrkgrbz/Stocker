using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.ValueObjects;
using Stocker.Modules.Sales.Interfaces;
using Stocker.Shared.Contracts.Inventory;
using Stocker.Shared.Events.Sales;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

/// <summary>
/// Handler for CreateSalesOrderCommand - The Order Creation Orchestrator.
/// Workflow:
/// 1. Validation and Loading: Load customer contract, territory
/// 2. Contract Validation: Check blocked status, expiry, credit limit
/// 3. Order Creation: Create order with items
/// 4. Territory Assignment: Assign to sales territory
/// 5. Stock Management: Reserve stock or create back orders
/// 6. Payment Setup: Set payment due date from contract terms
/// 7. Persistence: Save and publish event
/// </summary>
public class CreateSalesOrderHandler : IRequestHandler<CreateSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IInventoryService _inventoryService;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<CreateSalesOrderHandler> _logger;

    public CreateSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        IInventoryService inventoryService,
        IPublishEndpoint publishEndpoint,
        ILogger<CreateSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _inventoryService = inventoryService;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CreateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        _logger.LogInformation("Creating sales order for tenant {TenantId}, customer {CustomerId}",
            tenantId, request.CustomerId);

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 1: Load Customer Contract (if specified or customer has one)
        // ═══════════════════════════════════════════════════════════════════════════
        CustomerContract? contract = null;

        if (request.CustomerContractId.HasValue)
        {
            contract = await _unitOfWork.CustomerContracts.GetByIdAsync(
                request.CustomerContractId.Value, cancellationToken);

            if (contract == null)
            {
                _logger.LogWarning("Contract {ContractId} not found", request.CustomerContractId);
                return Result<SalesOrderDto>.Failure(
                    Error.NotFound("Contract.NotFound", "Specified customer contract not found."));
            }
        }
        else if (request.CustomerId.HasValue && request.ValidateCreditLimit)
        {
            // Try to find active contract for customer
            contract = await _unitOfWork.CustomerContracts.GetActiveContractByCustomerIdAsync(
                request.CustomerId.Value, cancellationToken);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 2: Validate Customer Contract (if exists)
        // ═══════════════════════════════════════════════════════════════════════════
        if (contract != null && request.ValidateCreditLimit)
        {
            // Calculate order total for credit check
            var orderTotal = request.Items.Sum(i =>
                i.Quantity * i.UnitPrice * (1 - i.DiscountRate / 100) * (1 + i.VatRate / 100));

            // Get outstanding balance
            var outstandingBalance = request.CurrentOutstandingBalance ??
                await CalculateOutstandingBalanceAsync(request.CustomerId!.Value, cancellationToken);

            // Validate contract for new order
            var validationResult = contract.ValidateForNewOrder(
                orderTotal,
                outstandingBalance,
                request.AllowGracePeriod);

            if (!validationResult.IsSuccess)
            {
                _logger.LogWarning(
                    "Contract validation failed for customer {CustomerId}: {Error}",
                    request.CustomerId, validationResult.Error?.Description);
                return Result<SalesOrderDto>.Failure(validationResult.Error!);
            }

            _logger.LogDebug("Contract validation passed for customer {CustomerId}", request.CustomerId);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 3: Load Sales Territory
        // ═══════════════════════════════════════════════════════════════════════════
        SalesTerritory? territory = null;

        if (request.TerritoryId.HasValue)
        {
            territory = await _unitOfWork.SalesTerritories.GetByIdAsync(
                request.TerritoryId.Value, cancellationToken);
        }
        else if (request.CustomerId.HasValue)
        {
            // Try to find territory by customer assignment or address
            territory = await _unitOfWork.SalesTerritories.GetByCustomerAssignmentAsync(
                request.CustomerId.Value, cancellationToken);

            if (territory == null && request.ShippingAddressSnapshot != null)
            {
                territory = await _unitOfWork.SalesTerritories.GetTerritoryForCustomerAsync(
                    request.CustomerId.Value,
                    request.ShippingAddressSnapshot.PostalCode,
                    request.ShippingAddressSnapshot.City,
                    request.ShippingAddressSnapshot.State,
                    cancellationToken);
            }
        }

        // Validate sales person has access to territory (if territory and sales person specified)
        if (territory != null && request.SalesPersonId.HasValue)
        {
            var accessResult = territory.ValidateSalesAccess(request.SalesPersonId.Value);
            if (!accessResult.IsSuccess)
            {
                _logger.LogWarning(
                    "Sales person {SalesPersonId} does not have access to territory {TerritoryId}",
                    request.SalesPersonId, territory.Id);
                // This is a warning, not a failure - proceed without territory assignment
                territory = null;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 4: Check Stock Availability (if ReserveStock is enabled)
        // ═══════════════════════════════════════════════════════════════════════════
        var stockCheckResults = new List<(CreateSalesOrderItemCommand Item, decimal AvailableStock, bool HasSufficientStock)>();

        if (request.ReserveStock)
        {
            foreach (var item in request.Items)
            {
                if (item.ProductId.HasValue)
                {
                    var availableStock = await _inventoryService.GetAvailableStockAsync(
                        item.ProductId.Value, tenantId, cancellationToken);

                    var hasSufficientStock = availableStock >= item.Quantity;
                    stockCheckResults.Add((item, availableStock, hasSufficientStock));

                    if (!hasSufficientStock && !request.AllowBackOrders)
                    {
                        _logger.LogWarning(
                            "Insufficient stock for product {ProductCode}. Required: {Required}, Available: {Available}",
                            item.ProductCode, item.Quantity, availableStock);

                        return Result<SalesOrderDto>.Failure(
                            Error.Validation("Stock.Insufficient",
                                $"Insufficient stock for {item.ProductCode}. Required: {item.Quantity}, Available: {availableStock}"));
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 5: Create Sales Order
        // ═══════════════════════════════════════════════════════════════════════════
        var orderNumber = await _unitOfWork.SalesOrders.GenerateOrderNumberAsync(cancellationToken);

        var orderResult = SalesOrder.Create(
            tenantId,
            orderNumber,
            request.OrderDate,
            request.CustomerId,
            request.CustomerName,
            request.CustomerEmail,
            request.Currency);

        if (!orderResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(orderResult.Error!);

        var order = orderResult.Value!;

        // Set additional properties
        if (request.ShippingAddress != null || request.BillingAddress != null)
            order.SetAddresses(request.ShippingAddress, request.BillingAddress);

        if (!string.IsNullOrEmpty(request.Notes))
            order.SetNotes(request.Notes);

        if (request.SalesPersonId.HasValue)
            order.SetSalesPerson(request.SalesPersonId, request.SalesPersonName);

        // Create and set address snapshots
        if (request.ShippingAddressSnapshot != null)
        {
            var shippingSnapshot = ShippingAddressSnapshot.Create(
                request.ShippingAddressSnapshot.RecipientName,
                request.ShippingAddressSnapshot.AddressLine1,
                request.ShippingAddressSnapshot.City,
                request.ShippingAddressSnapshot.Country,
                request.ShippingAddressSnapshot.RecipientPhone,
                request.ShippingAddressSnapshot.CompanyName,
                request.ShippingAddressSnapshot.AddressLine2,
                request.ShippingAddressSnapshot.District,
                request.ShippingAddressSnapshot.Town,
                request.ShippingAddressSnapshot.State,
                request.ShippingAddressSnapshot.PostalCode,
                request.ShippingAddressSnapshot.TaxId,
                request.ShippingAddressSnapshot.TaxOffice);

            ShippingAddressSnapshot? billingSnapshot = null;
            if (request.BillingAddressSnapshot != null)
            {
                billingSnapshot = ShippingAddressSnapshot.Create(
                    request.BillingAddressSnapshot.RecipientName,
                    request.BillingAddressSnapshot.AddressLine1,
                    request.BillingAddressSnapshot.City,
                    request.BillingAddressSnapshot.Country,
                    request.BillingAddressSnapshot.RecipientPhone,
                    request.BillingAddressSnapshot.CompanyName,
                    request.BillingAddressSnapshot.AddressLine2,
                    request.BillingAddressSnapshot.District,
                    request.BillingAddressSnapshot.Town,
                    request.BillingAddressSnapshot.State,
                    request.BillingAddressSnapshot.PostalCode,
                    request.BillingAddressSnapshot.TaxId,
                    request.BillingAddressSnapshot.TaxOffice);
            }

            order.SetAddressSnapshots(shippingSnapshot, billingSnapshot);
        }

        // Set source document relations
        if (request.QuotationId.HasValue)
            order.SetSourceQuotation(request.QuotationId.Value, request.QuotationNumber);

        if (request.OpportunityId.HasValue)
            order.SetOpportunity(request.OpportunityId.Value);

        if (request.CustomerContractId.HasValue)
            order.SetCustomerContract(request.CustomerContractId.Value);

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 6: Set Territory (Phase 3)
        // ═══════════════════════════════════════════════════════════════════════════
        if (territory != null)
        {
            order.SetTerritory(territory.Id, territory.Name);
            _logger.LogDebug("Assigned order to territory {TerritoryName}", territory.Name);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 7: Add Order Items
        // ═══════════════════════════════════════════════════════════════════════════
        var lineNumber = 1;
        var backOrderItems = new List<(SalesOrderItem Item, decimal ShortQuantity)>();

        foreach (var itemCmd in request.Items)
        {
            var itemResult = SalesOrderItem.Create(
                tenantId,
                order.Id,
                lineNumber++,
                itemCmd.ProductId,
                itemCmd.ProductCode,
                itemCmd.ProductName,
                itemCmd.Unit,
                itemCmd.Quantity,
                itemCmd.UnitPrice,
                itemCmd.VatRate,
                itemCmd.Description);

            if (!itemResult.IsSuccess)
                return Result<SalesOrderDto>.Failure(itemResult.Error!);

            var item = itemResult.Value!;

            if (itemCmd.DiscountRate > 0)
                item.ApplyDiscount(itemCmd.DiscountRate);

            order.AddItem(item);

            // Track items that need back orders
            if (request.AllowBackOrders && itemCmd.ProductId.HasValue)
            {
                var stockResult = stockCheckResults.FirstOrDefault(s => s.Item == itemCmd);
                if (!stockResult.HasSufficientStock)
                {
                    var shortQuantity = itemCmd.Quantity - stockResult.AvailableStock;
                    backOrderItems.Add((item, shortQuantity));
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 8: Set Payment Due Date (Phase 3)
        // ═══════════════════════════════════════════════════════════════════════════
        var paymentDueDays = request.PaymentDueDays ?? contract?.DefaultPaymentDueDays ?? 30;
        var paymentDueDate = request.OrderDate.AddDays(paymentDueDays);
        order.SetPaymentDueDate(paymentDueDate);

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 9: Save Order
        // ═══════════════════════════════════════════════════════════════════════════
        await _unitOfWork.SalesOrders.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderNumber} created for tenant {TenantId}", orderNumber, tenantId);

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 10: Reserve Stock (Phase 3)
        // ═══════════════════════════════════════════════════════════════════════════
        if (request.ReserveStock)
        {
            var reservations = request.Items
                .Where(i => i.ProductId.HasValue)
                .Select(i =>
                {
                    var stockResult = stockCheckResults.FirstOrDefault(s => s.Item == i);
                    var quantityToReserve = request.AllowBackOrders && !stockResult.HasSufficientStock
                        ? stockResult.AvailableStock
                        : i.Quantity;

                    return new StockReservationDto
                    {
                        ProductId = i.ProductId!.Value,
                        Quantity = quantityToReserve,
                        Unit = i.Unit
                    };
                })
                .Where(r => r.Quantity > 0)
                .ToList();

            if (reservations.Any())
            {
                var reservationSuccess = await _inventoryService.ReserveStockAsync(
                    order.Id, tenantId, reservations, cancellationToken);

                if (reservationSuccess)
                {
                    var totalReserved = reservations.Sum(r => r.Quantity);
                    var expiryDate = DateTime.UtcNow.AddHours(request.ReservationExpiryHours);
                    order.RecordStockReservation(totalReserved, expiryDate);

                    await _unitOfWork.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation(
                        "Reserved {TotalQuantity} units for order {OrderNumber}",
                        totalReserved, orderNumber);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to reserve stock for order {OrderNumber}. Proceeding without reservation.",
                        orderNumber);
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 11: Record Back Orders (Phase 3)
        // ═══════════════════════════════════════════════════════════════════════════
        if (backOrderItems.Any())
        {
            foreach (var (item, shortQuantity) in backOrderItems)
            {
                order.RecordBackOrderCreated();
                _logger.LogInformation(
                    "Back order recorded for {ProductCode}: {ShortQuantity} units",
                    item.ProductCode, shortQuantity);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 12: Update Contract Credit Usage (Phase 3)
        // ═══════════════════════════════════════════════════════════════════════════
        if (contract != null)
        {
            var orderTotal = order.TotalAmount;
            contract.RecordCreditUsage(orderTotal);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogDebug(
                "Recorded credit usage of {Amount} for contract {ContractNumber}",
                orderTotal, contract.ContractNumber);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 13: Reload and Publish Event
        // ═══════════════════════════════════════════════════════════════════════════
        var savedOrder = await _unitOfWork.SalesOrders.GetWithItemsAsync(order.Id, cancellationToken);

        var integrationEvent = new SalesOrderCreatedEvent(
            OrderId: savedOrder!.Id,
            OrderNumber: savedOrder.OrderNumber,
            CustomerId: savedOrder.CustomerId,
            CustomerName: savedOrder.CustomerName ?? string.Empty,
            TenantId: tenantId,
            TotalAmount: savedOrder.TotalAmount,
            Currency: savedOrder.Currency,
            Items: savedOrder.Items.Select(i => new SalesOrderEventItemDto(
                ItemId: i.Id,
                ProductId: i.ProductId,
                ProductCode: i.ProductCode,
                ProductName: i.ProductName,
                Unit: i.Unit,
                Quantity: i.Quantity,
                UnitPrice: i.UnitPrice,
                DiscountAmount: i.DiscountAmount
            )).ToList(),
            OrderDate: savedOrder.OrderDate,
            CreatedBy: null // TODO: Get from current user context
        );

        await _publishEndpoint.Publish(integrationEvent, cancellationToken);

        _logger.LogInformation(
            "Published SalesOrderCreatedEvent for order {OrderNumber} with {ItemCount} items. " +
            "Territory: {TerritoryName}, PaymentDue: {PaymentDueDate}, StockReserved: {IsStockReserved}",
            orderNumber,
            savedOrder.Items.Count,
            savedOrder.TerritoryName ?? "N/A",
            savedOrder.PaymentDueDate?.ToString("yyyy-MM-dd") ?? "N/A",
            savedOrder.IsStockReserved);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(savedOrder));
    }

    /// <summary>
    /// Calculates the outstanding balance for a customer from unpaid orders
    /// </summary>
    private async Task<decimal> CalculateOutstandingBalanceAsync(
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var orders = await _unitOfWork.SalesOrders.GetByCustomerIdAsync(customerId, cancellationToken);

        return orders
            .Where(o => o.PaymentStatus != OrderPaymentStatus.Paid &&
                        o.Status != SalesOrderStatus.Cancelled)
            .Sum(o => o.RemainingBalance);
    }
}
