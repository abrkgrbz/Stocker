using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.SubcontractOrders.Commands;

public record CreateSubcontractOrderCommand(CreateSubcontractOrderRequest Request) : IRequest<SubcontractOrderDto>;

public class CreateSubcontractOrderCommandHandler : IRequestHandler<CreateSubcontractOrderCommand, SubcontractOrderDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateSubcontractOrderCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<SubcontractOrderDto> Handle(CreateSubcontractOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var orderNumber = $"FSN-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        var order = new SubcontractOrder(
            orderNumber,
            request.SubcontractorId,
            request.SubcontractorName,
            request.ProductId,
            request.OrderQuantity,
            request.ExpectedDeliveryDate);

        order.SetProductInfo(request.ProductCode, request.ProductName, request.Unit);
        order.SetCost(request.UnitCost);

        if (request.ProductionOrderId.HasValue)
            order.SetProductionOrderLink(request.ProductionOrderId, request.OperationId);

        if (!string.IsNullOrEmpty(request.CostCenterId))
            order.SetCostCenter(request.CostCenterId);

        order.SetQualityRequirements(request.RequiresInspection, request.QualityPlanId);

        if (!string.IsNullOrEmpty(userName))
            order.SetCreatedBy(userName);

        if (!string.IsNullOrEmpty(request.Notes))
            order.SetNotes(request.Notes);

        _unitOfWork.SubcontractOrders.Add(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(order);
    }

    private static SubcontractOrderDto MapToDto(SubcontractOrder entity) => new(
        entity.Id,
        entity.OrderNumber,
        entity.SubcontractorId,
        entity.SubcontractorName,
        entity.ProductionOrderId,
        null,
        entity.OperationId,
        null,
        entity.Status.ToString(),
        entity.ProductId,
        entity.ProductCode,
        entity.ProductName,
        entity.OrderQuantity,
        entity.Unit,
        entity.OrderDate,
        entity.ExpectedDeliveryDate,
        entity.ActualDeliveryDate,
        entity.LeadTimeDays,
        entity.UnitCost,
        entity.TotalCost,
        entity.ActualCost,
        entity.CostCenterId,
        entity.ShippedQuantity,
        entity.ReceivedQuantity,
        entity.RejectedQuantity,
        entity.ScrapQuantity,
        entity.RequiresInspection,
        entity.QualityPlanId,
        entity.Notes,
        entity.CreatedBy,
        entity.ApprovedBy,
        entity.ApprovedDate,
        entity.IsActive,
        entity.CreatedDate,
        entity.GetCompletionPercent(),
        null, null);
}

public record ApproveSubcontractOrderCommand(int Id) : IRequest;

public class ApproveSubcontractOrderCommandHandler : IRequestHandler<ApproveSubcontractOrderCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveSubcontractOrderCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveSubcontractOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var order = await _unitOfWork.SubcontractOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok.");

        order.Approve(userName);

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ShipMaterialCommand(int Id, ShipMaterialRequest Request) : IRequest<SubcontractShipmentDto>;

public class ShipMaterialCommandHandler : IRequestHandler<ShipMaterialCommand, SubcontractShipmentDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ShipMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SubcontractShipmentDto> Handle(ShipMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetWithShipmentsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok.");

        var shipment = order.ShipMaterial(
            command.Request.Quantity,
            command.Request.BatchNumber,
            command.Request.Notes);

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SubcontractShipmentDto(
            shipment.Id,
            shipment.SubcontractOrderId,
            shipment.Type.ToString(),
            shipment.Quantity,
            shipment.RejectedQuantity,
            shipment.ShipmentDate,
            shipment.BatchNumber,
            shipment.LotNumber,
            shipment.InvoiceNumber,
            shipment.DeliveryNoteNumber,
            shipment.Notes);
    }
}

public record ReceiveProductCommand(int Id, ReceiveProductRequest Request) : IRequest<SubcontractShipmentDto>;

public class ReceiveProductCommandHandler : IRequestHandler<ReceiveProductCommand, SubcontractShipmentDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ReceiveProductCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SubcontractShipmentDto> Handle(ReceiveProductCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetWithShipmentsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok.");

        var shipment = order.ReceiveProduct(
            command.Request.Quantity,
            command.Request.RejectedQuantity,
            command.Request.BatchNumber,
            command.Request.Notes);

        if (!string.IsNullOrEmpty(command.Request.InvoiceNumber) || !string.IsNullOrEmpty(command.Request.DeliveryNoteNumber))
            shipment.SetDocumentNumbers(command.Request.InvoiceNumber, command.Request.DeliveryNoteNumber);

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SubcontractShipmentDto(
            shipment.Id,
            shipment.SubcontractOrderId,
            shipment.Type.ToString(),
            shipment.Quantity,
            shipment.RejectedQuantity,
            shipment.ShipmentDate,
            shipment.BatchNumber,
            shipment.LotNumber,
            shipment.InvoiceNumber,
            shipment.DeliveryNoteNumber,
            shipment.Notes);
    }
}

public record CompleteSubcontractOrderCommand(int Id) : IRequest;

public class CompleteSubcontractOrderCommandHandler : IRequestHandler<CompleteSubcontractOrderCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteSubcontractOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CompleteSubcontractOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok.");

        order.Complete();

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record CloseSubcontractOrderCommand(int Id) : IRequest;

public class CloseSubcontractOrderCommandHandler : IRequestHandler<CloseSubcontractOrderCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CloseSubcontractOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CloseSubcontractOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok.");

        order.Close();

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record CancelSubcontractOrderCommand(int Id) : IRequest;

public class CancelSubcontractOrderCommandHandler : IRequestHandler<CancelSubcontractOrderCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelSubcontractOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelSubcontractOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişi iptal etme yetkiniz yok.");

        order.Cancel();

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record AddSubcontractMaterialCommand(int OrderId, AddSubcontractMaterialRequest Request) : IRequest<SubcontractMaterialDto>;

public class AddSubcontractMaterialCommandHandler : IRequestHandler<AddSubcontractMaterialCommand, SubcontractMaterialDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public AddSubcontractMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SubcontractMaterialDto> Handle(AddSubcontractMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetWithMaterialsAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.OrderId}' olan fason sipariş bulunamadı.");

        if (order.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok.");

        var material = order.AddMaterial(
            command.Request.MaterialId,
            command.Request.MaterialCode,
            command.Request.MaterialName,
            command.Request.RequiredQuantity,
            command.Request.Unit);

        _unitOfWork.SubcontractOrders.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SubcontractMaterialDto(
            material.Id,
            material.SubcontractOrderId,
            material.MaterialId,
            material.MaterialCode,
            material.MaterialName,
            material.RequiredQuantity,
            material.ShippedQuantity,
            material.ReturnedQuantity,
            material.ConsumedQuantity,
            material.Unit);
    }
}
