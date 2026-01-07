using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Commands;

/// <summary>
/// Command to submit an inventory adjustment for approval
/// </summary>
public class SubmitInventoryAdjustmentCommand : IRequest<Result<InventoryAdjustmentDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for SubmitInventoryAdjustmentCommand
/// </summary>
public class SubmitInventoryAdjustmentCommandValidator : AbstractValidator<SubmitInventoryAdjustmentCommand>
{
    public SubmitInventoryAdjustmentCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for SubmitInventoryAdjustmentCommand
/// </summary>
public class SubmitInventoryAdjustmentCommandHandler : IRequestHandler<SubmitInventoryAdjustmentCommand, Result<InventoryAdjustmentDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public SubmitInventoryAdjustmentCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryAdjustmentDto>> Handle(SubmitInventoryAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.InventoryAdjustments.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.NotFound", $"Inventory adjustment with ID {request.Id} not found", ErrorType.NotFound));
        }

        try
        {
            entity.Submit();
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
