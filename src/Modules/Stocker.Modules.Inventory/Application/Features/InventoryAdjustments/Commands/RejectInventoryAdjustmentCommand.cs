using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Commands;

/// <summary>
/// Command to reject an inventory adjustment
/// </summary>
public class RejectInventoryAdjustmentCommand : IRequest<Result<InventoryAdjustmentDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string RejectedBy { get; set; } = null!;
    public string Reason { get; set; } = null!;
}

/// <summary>
/// Validator for RejectInventoryAdjustmentCommand
/// </summary>
public class RejectInventoryAdjustmentCommandValidator : AbstractValidator<RejectInventoryAdjustmentCommand>
{
    public RejectInventoryAdjustmentCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.RejectedBy).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

/// <summary>
/// Handler for RejectInventoryAdjustmentCommand
/// </summary>
public class RejectInventoryAdjustmentCommandHandler : IRequestHandler<RejectInventoryAdjustmentCommand, Result<InventoryAdjustmentDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public RejectInventoryAdjustmentCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryAdjustmentDto>> Handle(RejectInventoryAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.InventoryAdjustments.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.NotFound", $"Inventory adjustment with ID {request.Id} not found", ErrorType.NotFound));
        }

        try
        {
            entity.Reject(request.RejectedBy, request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _unitOfWork.InventoryAdjustments.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new InventoryAdjustmentDto
        {
            Id = entity.Id,
            AdjustmentNumber = entity.AdjustmentNumber,
            AdjustmentDate = entity.AdjustmentDate,
            AdjustmentType = entity.AdjustmentType.ToString(),
            Reason = entity.Reason.ToString(),
            Description = entity.Description,
            WarehouseId = entity.WarehouseId,
            LocationId = entity.LocationId,
            StockCountId = entity.StockCountId,
            ReferenceNumber = entity.ReferenceNumber,
            ReferenceType = entity.ReferenceType,
            TotalCostImpact = entity.TotalCostImpact,
            Currency = entity.Currency,
            Status = entity.Status.ToString(),
            ApprovedBy = entity.ApprovedBy,
            ApprovedDate = entity.ApprovedDate,
            RejectionReason = entity.RejectionReason,
            InternalNotes = entity.InternalNotes,
            AccountingNotes = entity.AccountingNotes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<InventoryAdjustmentDto>.Success(dto);
    }
}
