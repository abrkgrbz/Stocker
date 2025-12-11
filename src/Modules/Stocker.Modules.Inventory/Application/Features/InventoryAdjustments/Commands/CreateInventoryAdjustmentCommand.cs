using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Commands;

/// <summary>
/// Command to create a new inventory adjustment
/// </summary>
public class CreateInventoryAdjustmentCommand : IRequest<Result<InventoryAdjustmentDto>>
{
    public Guid TenantId { get; set; }
    public CreateInventoryAdjustmentDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateInventoryAdjustmentCommand
/// </summary>
public class CreateInventoryAdjustmentCommandValidator : AbstractValidator<CreateInventoryAdjustmentCommand>
{
    public CreateInventoryAdjustmentCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.AdjustmentNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.AdjustmentType).NotEmpty();
        RuleFor(x => x.Data.Reason).NotEmpty();
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.ReferenceNumber).MaximumLength(50);
        RuleFor(x => x.Data.ReferenceType).MaximumLength(50);
        RuleFor(x => x.Data.Currency).MaximumLength(3);
    }
}

/// <summary>
/// Handler for CreateInventoryAdjustmentCommand
/// </summary>
public class CreateInventoryAdjustmentCommandHandler : IRequestHandler<CreateInventoryAdjustmentCommand, Result<InventoryAdjustmentDto>>
{
    private readonly IInventoryAdjustmentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateInventoryAdjustmentCommandHandler(IInventoryAdjustmentRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryAdjustmentDto>> Handle(CreateInventoryAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check if adjustment number already exists
        var existingAdjustment = await _repository.GetByNumberAsync(data.AdjustmentNumber, cancellationToken);
        if (existingAdjustment != null)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.DuplicateNumber", $"Adjustment with number '{data.AdjustmentNumber}' already exists", ErrorType.Conflict));
        }

        var adjustmentType = Enum.Parse<AdjustmentType>(data.AdjustmentType);
        var reason = Enum.Parse<AdjustmentReason>(data.Reason);
        var entity = new InventoryAdjustment(data.AdjustmentNumber, data.WarehouseId, adjustmentType, reason, data.AdjustmentDate);

        entity.SetDescription(data.Description);
        entity.SetLocation(data.LocationId);
        entity.SetReferenceDocument(data.ReferenceNumber, data.ReferenceType);
        entity.SetInternalNotes(data.InternalNotes);
        entity.SetAccountingNotes(data.AccountingNotes);

        await _repository.AddAsync(entity, cancellationToken);
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
            InternalNotes = entity.InternalNotes,
            AccountingNotes = entity.AccountingNotes,
            CreatedAt = entity.CreatedDate
        };

        return Result<InventoryAdjustmentDto>.Success(dto);
    }
}
