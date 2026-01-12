using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Commands;

public record CreateProductionOrderCommand(CreateProductionOrderRequest Request) : IRequest<ProductionOrderListDto>;

public class CreateProductionOrderCommandValidator : AbstractValidator<CreateProductionOrderCommand>
{
    public CreateProductionOrderCommandValidator()
    {
        RuleFor(x => x.Request.Type)
            .NotEmpty().WithMessage("Üretim emri tipi zorunludur.");

        RuleFor(x => x.Request.ProductId)
            .GreaterThan(0).WithMessage("Ürün seçimi zorunludur.");

        RuleFor(x => x.Request.PlannedQuantity)
            .GreaterThan(0).WithMessage("Planlanan miktar sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.Unit)
            .NotEmpty().WithMessage("Birim zorunludur.");

        RuleFor(x => x.Request.PlannedStartDate)
            .NotEmpty().WithMessage("Planlanan başlangıç tarihi zorunludur.");

        RuleFor(x => x.Request.PlannedEndDate)
            .NotEmpty().WithMessage("Planlanan bitiş tarihi zorunludur.")
            .GreaterThan(x => x.Request.PlannedStartDate)
            .WithMessage("Planlanan bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
    }
}

public class CreateProductionOrderCommandHandler : IRequestHandler<CreateProductionOrderCommand, ProductionOrderListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateProductionOrderCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<ProductionOrderListDto> Handle(CreateProductionOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");
        var request = command.Request;

        // Parse type enum
        if (!Enum.TryParse<ProductionOrderType>(request.Type, out var orderType))
            throw new ArgumentException("Geçersiz üretim emri tipi.");

        // Validate BOM if provided
        if (request.BomId.HasValue)
        {
            var bom = await _unitOfWork.BillOfMaterials.GetByIdAsync(request.BomId.Value, cancellationToken)
                ?? throw new KeyNotFoundException("Ürün reçetesi bulunamadı.");

            if (bom.Status != BomStatus.Aktif)
                throw new InvalidOperationException("Sadece aktif ürün reçeteleri kullanılabilir.");
        }

        // Validate Routing if provided
        if (request.RoutingId.HasValue)
        {
            var routing = await _unitOfWork.Routings.GetByIdAsync(request.RoutingId.Value, cancellationToken)
                ?? throw new KeyNotFoundException("Rota bulunamadı.");

            if (routing.Status != RoutingStatus.Aktif)
                throw new InvalidOperationException("Sadece aktif rotalar kullanılabilir.");
        }

        // Generate order number
        var orderNumber = await _unitOfWork.ProductionOrders.GenerateOrderNumberAsync(tenantId, cancellationToken);

        // Create production order using the entity constructor
        var productionOrder = new ProductionOrder(
            orderNumber,
            request.ProductId,
            request.PlannedQuantity,
            request.Unit,
            orderType);

        // Set tenant
        productionOrder.SetTenantId(tenantId);

        // Set BOM and Routing if provided
        if (request.BomId.HasValue)
            productionOrder.SetBom(request.BomId.Value);

        if (request.RoutingId.HasValue)
            productionOrder.SetRouting(request.RoutingId.Value);

        // Set dates
        productionOrder.SetDates(request.PlannedStartDate, request.PlannedEndDate, request.DueDate);

        // Set warehouses
        productionOrder.SetWarehouses(request.SourceWarehouseId, request.TargetWarehouseId, null);

        // Set sales order reference
        if (request.SalesOrderId.HasValue)
            productionOrder.SetSalesOrderReference(request.SalesOrderId, request.SalesOrderLineId);

        // Set parent order
        if (request.ParentProductionOrderId.HasValue)
            productionOrder.SetParentOrder(request.ParentProductionOrderId);

        // Set project
        if (request.ProjectId.HasValue)
            productionOrder.SetProject(request.ProjectId);

        // Set lot tracking
        if (!string.IsNullOrEmpty(request.LotNumber))
            productionOrder.SetLotTracking(request.LotNumber, false, false);

        // Set notes
        if (!string.IsNullOrEmpty(request.Notes))
            productionOrder.SetNotes(request.Notes);

        // Set planned by
        productionOrder.SetPlannedBy(userId.ToString());

        await _unitOfWork.ProductionOrders.AddAsync(productionOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProductionOrderListDto(
            productionOrder.Id,
            productionOrder.OrderNumber,
            productionOrder.Type.ToString(),
            productionOrder.Status.ToString(),
            productionOrder.Priority.ToString(),
            productionOrder.ProductId,
            null, // ProductCode
            null, // ProductName
            productionOrder.PlannedQuantity,
            productionOrder.CompletedQuantity,
            productionOrder.CompletionPercent,
            productionOrder.PlannedStartDate,
            productionOrder.PlannedEndDate,
            productionOrder.ActualStartDate,
            productionOrder.DueDate);
    }
}
