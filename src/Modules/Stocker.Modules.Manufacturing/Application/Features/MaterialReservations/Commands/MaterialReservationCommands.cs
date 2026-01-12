using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MaterialReservations.Commands;

#region Create Material Reservation

public record CreateMaterialReservationCommand(CreateMaterialReservationRequest Request) : IRequest<MaterialReservationListDto>;

public class CreateMaterialReservationCommandValidator : AbstractValidator<CreateMaterialReservationCommand>
{
    public CreateMaterialReservationCommandValidator()
    {
        RuleFor(x => x.Request.ProductId)
            .GreaterThan(0).WithMessage("Ürün seçimi zorunludur.");

        RuleFor(x => x.Request.RequiredQuantity)
            .GreaterThan(0).WithMessage("İhtiyaç miktarı sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.Unit)
            .NotEmpty().WithMessage("Birim zorunludur.");

        RuleFor(x => x.Request.RequiredDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("İhtiyaç tarihi bugün veya sonrası olmalıdır.");

        RuleFor(x => x.Request.Type)
            .IsInEnum().WithMessage("Geçerli bir rezervasyon tipi seçiniz.");
    }
}

public class CreateMaterialReservationCommandHandler : IRequestHandler<CreateMaterialReservationCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateMaterialReservationCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<MaterialReservationListDto> Handle(CreateMaterialReservationCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var reservationNumber = await _unitOfWork.MaterialReservations.GenerateReservationNumberAsync(cancellationToken);

        var reservation = new MaterialReservation(
            reservationNumber,
            request.ProductId,
            request.RequiredQuantity,
            request.Unit,
            request.RequiredDate,
            request.Type);

        reservation.SetTenantId(tenantId);
        reservation.SetProductInfo(request.ProductCode, request.ProductName);

        if (request.ProductionOrderId.HasValue)
            reservation.SetProductionOrderReference(request.ProductionOrderId.Value, request.ProductionOrderLineId, request.BomLineId);

        if (request.SalesOrderId.HasValue)
            reservation.SetSalesOrderReference(request.SalesOrderId.Value);

        if (request.ProjectId.HasValue)
            reservation.SetProjectReference(request.ProjectId.Value);

        if (request.SubcontractOrderId.HasValue)
            reservation.SetSubcontractOrderReference(request.SubcontractOrderId.Value);

        if (request.MrpPlanId.HasValue)
            reservation.SetMrpPlanReference(request.MrpPlanId.Value);

        if (request.WarehouseId.HasValue)
            reservation.SetWarehouse(request.WarehouseId.Value, request.WarehouseCode, request.LocationId, request.LocationCode);

        reservation.SetLotSerialControl(request.IsLotControlled, request.IsSerialControlled);
        reservation.SetLotSerial(request.LotNumber, request.SerialNumber);
        reservation.SetPriority(request.Priority, request.IsUrgent);
        reservation.SetAutoAllocate(request.AutoAllocate);
        reservation.SetApprovalRequired(request.RequiresApproval);

        if (request.ExpiryDate.HasValue)
            reservation.SetExpiryDate(request.ExpiryDate.Value);

        reservation.SetRequestedBy(_currentUser.UserName ?? "Sistem", _currentUser.UserId.HasValue ? (int?)int.Parse(_currentUser.UserId.Value.ToString()) : null);
        reservation.SetNotes(request.Notes);

        await _unitOfWork.MaterialReservations.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Update Material Reservation

public record UpdateMaterialReservationCommand(int Id, UpdateMaterialReservationRequest Request) : IRequest<MaterialReservationListDto>;

public class UpdateMaterialReservationCommandHandler : IRequestHandler<UpdateMaterialReservationCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMaterialReservationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaterialReservationListDto> Handle(UpdateMaterialReservationCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.Id}");

        if (reservation.Status == MaterialReservationStatus.Tamamlandı || reservation.Status == MaterialReservationStatus.İptal)
            throw new InvalidOperationException("Tamamlanmış veya iptal edilmiş rezervasyon güncellenemez.");

        // Note: Would need to add SetRequiredQuantity, SetRequiredDate methods to entity
        if (command.Request.WarehouseId.HasValue)
            reservation.SetWarehouse(command.Request.WarehouseId.Value, command.Request.WarehouseCode, command.Request.LocationId, command.Request.LocationCode);

        reservation.SetPriority(command.Request.Priority, command.Request.IsUrgent);

        if (command.Request.ExpiryDate.HasValue)
            reservation.SetExpiryDate(command.Request.ExpiryDate.Value);

        reservation.SetNotes(command.Request.Notes);

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Approve Reservation

public record ApproveMaterialReservationCommand(int Id, ApproveMaterialReservationRequest Request) : IRequest<MaterialReservationListDto>;

public class ApproveMaterialReservationCommandHandler : IRequestHandler<ApproveMaterialReservationCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ApproveMaterialReservationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaterialReservationListDto> Handle(ApproveMaterialReservationCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.Id}");

        reservation.Approve(command.Request.ApprovedBy);

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Allocate Material

public record AllocateMaterialCommand(int ReservationId, AllocateMaterialRequest Request) : IRequest<MaterialReservationAllocationDto>;

public class AllocateMaterialCommandValidator : AbstractValidator<AllocateMaterialCommand>
{
    public AllocateMaterialCommandValidator()
    {
        RuleFor(x => x.Request.Quantity)
            .GreaterThan(0).WithMessage("Tahsis miktarı sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.WarehouseId)
            .GreaterThan(0).WithMessage("Depo seçimi zorunludur.");
    }
}

public class AllocateMaterialCommandHandler : IRequestHandler<AllocateMaterialCommand, MaterialReservationAllocationDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public AllocateMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<MaterialReservationAllocationDto> Handle(AllocateMaterialCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdWithDetailsAsync(command.ReservationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.ReservationId}");

        var allocation = reservation.Allocate(
            command.Request.Quantity,
            command.Request.WarehouseId,
            command.Request.WarehouseCode,
            command.Request.LocationId,
            command.Request.LocationCode,
            command.Request.LotNumber,
            command.Request.SerialNumber,
            _currentUser.UserName ?? "Sistem");

        if (command.Request.StockId.HasValue)
            allocation.SetStockId(command.Request.StockId.Value);

        allocation.SetNotes(command.Request.Notes);

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToAllocationDto(allocation);
    }
}

#endregion

#region Issue Material

public record IssueMaterialCommand(int ReservationId, IssueMaterialRequest Request) : IRequest<MaterialReservationIssueDto>;

public class IssueMaterialCommandValidator : AbstractValidator<IssueMaterialCommand>
{
    public IssueMaterialCommandValidator()
    {
        RuleFor(x => x.Request.Quantity)
            .GreaterThan(0).WithMessage("Çıkış miktarı sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.WarehouseId)
            .GreaterThan(0).WithMessage("Depo seçimi zorunludur.");
    }
}

public class IssueMaterialCommandHandler : IRequestHandler<IssueMaterialCommand, MaterialReservationIssueDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public IssueMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<MaterialReservationIssueDto> Handle(IssueMaterialCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdWithDetailsAsync(command.ReservationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.ReservationId}");

        var issue = reservation.Issue(
            command.Request.Quantity,
            command.Request.WarehouseId,
            command.Request.StockMovementId,
            command.Request.LotNumber,
            command.Request.SerialNumber,
            _currentUser.UserName ?? "Sistem");

        issue.SetNotes(command.Request.Notes);

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToIssueDto(issue);
    }
}

#endregion

#region Return Material

public record ReturnMaterialCommand(int ReservationId, ReturnMaterialRequest Request) : IRequest<MaterialReservationListDto>;

public class ReturnMaterialCommandHandler : IRequestHandler<ReturnMaterialCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ReturnMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<MaterialReservationListDto> Handle(ReturnMaterialCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdWithDetailsAsync(command.ReservationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.ReservationId}");

        reservation.RecordReturn(command.Request.Quantity, command.Request.Reason, _currentUser.UserName ?? "Sistem");

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Cancel Allocation

public record CancelAllocationCommand(int ReservationId, CancelAllocationRequest Request) : IRequest<MaterialReservationListDto>;

public class CancelAllocationCommandHandler : IRequestHandler<CancelAllocationCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CancelAllocationCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<MaterialReservationListDto> Handle(CancelAllocationCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdWithDetailsAsync(command.ReservationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.ReservationId}");

        reservation.CancelAllocation(command.Request.AllocationId, command.Request.Reason, _currentUser.UserName ?? "Sistem");

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Complete Reservation

public record CompleteMaterialReservationCommand(int Id) : IRequest<MaterialReservationListDto>;

public class CompleteMaterialReservationCommandHandler : IRequestHandler<CompleteMaterialReservationCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteMaterialReservationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaterialReservationListDto> Handle(CompleteMaterialReservationCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.Id}");

        reservation.Complete();

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Cancel Reservation

public record CancelMaterialReservationCommand(int Id, CancelMaterialReservationRequest Request) : IRequest<MaterialReservationListDto>;

public class CancelMaterialReservationCommandHandler : IRequestHandler<CancelMaterialReservationCommand, MaterialReservationListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelMaterialReservationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaterialReservationListDto> Handle(CancelMaterialReservationCommand command, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Rezervasyon bulunamadı: {command.Id}");

        reservation.Cancel(command.Request.Reason);

        _unitOfWork.MaterialReservations.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToListDto(reservation);
    }
}

#endregion

#region Mapper

internal static class ReservationMapper
{
    public static MaterialReservationListDto ToListDto(MaterialReservation r) => new(
        r.Id,
        r.ReservationNumber,
        r.Status,
        GetStatusText(r.Status),
        r.Type,
        GetTypeText(r.Type),
        r.ProductId,
        r.ProductCode,
        r.ProductName,
        r.RequiredQuantity,
        r.AllocatedQuantity,
        r.IssuedQuantity,
        r.Unit,
        r.RequiredDate,
        r.WarehouseId,
        r.WarehouseCode,
        r.LotNumber,
        r.Priority,
        r.IsUrgent,
        r.RequestedBy,
        r.RequestedDate,
        r.RequiresApproval,
        r.ApprovedDate.HasValue,
        r.IsActive);

    public static MaterialReservationDto ToDto(MaterialReservation r) => new(
        r.Id,
        r.ReservationNumber,
        r.Status,
        GetStatusText(r.Status),
        r.Type,
        GetTypeText(r.Type),
        r.ProductionOrderId,
        null, // ProductionOrderNumber
        r.ProductionOrderLineId,
        r.SalesOrderId,
        null, // SalesOrderNumber
        r.ProjectId,
        null, // ProjectCode
        r.SubcontractOrderId,
        null, // SubcontractOrderNumber
        r.MrpPlanId,
        r.ReferenceType,
        r.ReferenceId,
        r.ProductId,
        r.ProductCode,
        r.ProductName,
        r.BomLineId,
        r.RequiredQuantity,
        r.AllocatedQuantity,
        r.IssuedQuantity,
        r.ReturnedQuantity,
        r.GetRemainingToAllocate(),
        r.GetRemainingToIssue(),
        r.GetRemainingRequirement(),
        r.Unit,
        r.RequiredDate,
        r.AllocationDate,
        r.ExpiryDate,
        r.WarehouseId,
        r.WarehouseCode,
        r.LocationId,
        r.LocationCode,
        r.LotNumber,
        r.SerialNumber,
        r.IsLotControlled,
        r.IsSerialControlled,
        r.Priority,
        r.IsUrgent,
        r.AutoAllocate,
        r.RequestedBy,
        r.RequestedByUserId,
        r.RequestedDate,
        r.RequiresApproval,
        r.ApprovedBy,
        r.ApprovedDate,
        r.Notes,
        r.IsActive,
        r.Allocations?.Select(ToAllocationDto).ToList(),
        r.Issues?.Select(ToIssueDto).ToList());

    public static MaterialReservationAllocationDto ToAllocationDto(MaterialReservationAllocation a) => new(
        a.Id,
        a.MaterialReservationId,
        a.Quantity,
        a.WarehouseId,
        a.WarehouseCode,
        a.LocationId,
        a.LocationCode,
        a.LotNumber,
        a.SerialNumber,
        a.StockId,
        a.AllocationDate,
        a.AllocatedBy,
        a.IsCancelled,
        a.CancelReason,
        a.CancelledBy,
        a.CancelledDate,
        a.Notes);

    public static MaterialReservationIssueDto ToIssueDto(MaterialReservationIssue i) => new(
        i.Id,
        i.MaterialReservationId,
        i.Quantity,
        i.WarehouseId,
        i.WarehouseCode,
        i.LocationId,
        i.LocationCode,
        i.LotNumber,
        i.SerialNumber,
        i.StockMovementId,
        i.IssueDate,
        i.IssuedBy,
        i.ReturnedQuantity,
        i.ReturnReason,
        i.ReturnedBy,
        i.ReturnDate,
        i.GetNetQuantity(),
        i.Notes);

    private static string GetStatusText(MaterialReservationStatus status) => status switch
    {
        MaterialReservationStatus.Aktif => "Aktif",
        MaterialReservationStatus.KısmenTahsis => "Kısmen Tahsis",
        MaterialReservationStatus.TamTahsis => "Tam Tahsis",
        MaterialReservationStatus.KısmenTüketildi => "Kısmen Tüketildi",
        MaterialReservationStatus.Tamamlandı => "Tamamlandı",
        MaterialReservationStatus.İptal => "İptal",
        MaterialReservationStatus.Süresi_Doldu => "Süresi Doldu",
        _ => status.ToString()
    };

    private static string GetTypeText(MaterialReservationType type) => type switch
    {
        MaterialReservationType.Üretim_Emri => "Üretim Emri",
        MaterialReservationType.Satış_Siparişi => "Satış Siparişi",
        MaterialReservationType.Proje => "Proje",
        MaterialReservationType.Fason => "Fason",
        MaterialReservationType.Transfer => "Transfer",
        MaterialReservationType.Manuel => "Manuel",
        _ => type.ToString()
    };
}

#endregion
