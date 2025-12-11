using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Commands;

/// <summary>
/// Command to approve an inventory adjustment
/// </summary>
public class ApproveInventoryAdjustmentCommand : IRequest<Result<InventoryAdjustmentDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string ApprovedBy { get; set; } = null!;
}

/// <summary>
/// Validator for ApproveInventoryAdjustmentCommand
/// </summary>
public class ApproveInventoryAdjustmentCommandValidator : AbstractValidator<ApproveInventoryAdjustmentCommand>
{
    public ApproveInventoryAdjustmentCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.ApprovedBy).NotEmpty().MaximumLength(100);
    }
}

/// <summary>
/// Handler for ApproveInventoryAdjustmentCommand
/// </summary>
public class ApproveInventoryAdjustmentCommandHandler : IRequestHandler<ApproveInventoryAdjustmentCommand, Result<InventoryAdjustmentDto>>
{
    private readonly IInventoryAdjustmentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveInventoryAdjustmentCommandHandler(IInventoryAdjustmentRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryAdjustmentDto>> Handle(ApproveInventoryAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.NotFound", $"Inventory adjustment with ID {request.Id} not found", ErrorType.NotFound));
        }

        try
        {
            entity.Approve(request.ApprovedBy);
        }
        catch (InvalidOperationException ex)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _repository.UpdateAsync(entity, cancellationToken);
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
