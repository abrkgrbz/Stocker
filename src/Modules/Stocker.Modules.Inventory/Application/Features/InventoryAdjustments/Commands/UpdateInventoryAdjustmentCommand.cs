using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Commands;

/// <summary>
/// Command to update an existing inventory adjustment
/// </summary>
public class UpdateInventoryAdjustmentCommand : IRequest<Result<InventoryAdjustmentDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateInventoryAdjustmentDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateInventoryAdjustmentCommand
/// </summary>
public class UpdateInventoryAdjustmentCommandValidator : AbstractValidator<UpdateInventoryAdjustmentCommand>
{
    public UpdateInventoryAdjustmentCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.ReferenceNumber).MaximumLength(50);
        RuleFor(x => x.Data.ReferenceType).MaximumLength(50);
    }
}

/// <summary>
/// Handler for UpdateInventoryAdjustmentCommand
/// </summary>
public class UpdateInventoryAdjustmentCommandHandler : IRequestHandler<UpdateInventoryAdjustmentCommand, Result<InventoryAdjustmentDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateInventoryAdjustmentCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryAdjustmentDto>> Handle(UpdateInventoryAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.InventoryAdjustments.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.NotFound", $"Inventory adjustment with ID {request.Id} not found", ErrorType.NotFound));
        }

        if (entity.Status != AdjustmentStatus.Draft)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.CannotUpdate", "Only draft adjustments can be updated", ErrorType.Validation));
        }

        var data = request.Data;

        entity.SetDescription(data.Description);
        entity.SetLocation(data.LocationId);
        entity.SetReferenceDocument(data.ReferenceNumber, data.ReferenceType);
        entity.SetInternalNotes(data.InternalNotes);
        entity.SetAccountingNotes(data.AccountingNotes);

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
