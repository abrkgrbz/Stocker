using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ShelfLives.Commands;

/// <summary>
/// Command to create a new shelf life configuration
/// </summary>
public class CreateShelfLifeCommand : IRequest<Result<ShelfLifeDto>>
{
    public Guid TenantId { get; set; }
    public CreateShelfLifeDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateShelfLifeCommand
/// </summary>
public class CreateShelfLifeCommandValidator : AbstractValidator<CreateShelfLifeCommand>
{
    public CreateShelfLifeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
        RuleFor(x => x.Data.TotalShelfLifeDays).GreaterThan(0);
        RuleFor(x => x.Data.ShelfLifeType).NotEmpty();
        RuleFor(x => x.Data.StorageConditions).MaximumLength(500);
    }
}

/// <summary>
/// Handler for CreateShelfLifeCommand
/// </summary>
public class CreateShelfLifeCommandHandler : IRequestHandler<CreateShelfLifeCommand, Result<ShelfLifeDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateShelfLifeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShelfLifeDto>> Handle(CreateShelfLifeCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check if shelf life config already exists for product
        var existingConfig = await _unitOfWork.ShelfLives.GetByProductAsync(data.ProductId, cancellationToken);
        if (existingConfig != null)
        {
            return Result<ShelfLifeDto>.Failure(new Error("ShelfLife.DuplicateProduct", $"Shelf life configuration for product {data.ProductId} already exists", ErrorType.Conflict));
        }

        var shelfLifeType = Enum.Parse<ShelfLifeType>(data.ShelfLifeType);
        var entity = new ShelfLife(data.ProductId, data.TotalShelfLifeDays, shelfLifeType);
        entity.SetTenantId(request.TenantId);

        var receivingRuleType = Enum.Parse<ShelfLifeRuleType>(data.ReceivingRuleType);
        entity.SetReceivingRules(data.MinReceivingShelfLifeDays, data.MinReceivingShelfLifePercent, receivingRuleType);

        var salesRuleType = Enum.Parse<ShelfLifeRuleType>(data.SalesRuleType);
        entity.SetSalesRules(data.MinSalesShelfLifeDays, data.MinSalesShelfLifePercent, salesRuleType);

        entity.SetAlertThresholds(data.AlertThresholdDays, data.CriticalThresholdDays, data.AlertThresholdPercent, data.CriticalThresholdPercent);

        var expiryAction = Enum.Parse<ExpiryAction>(data.ExpiryAction);
        entity.SetExpiryAction(expiryAction, data.AutoQuarantineOnExpiry, data.AutoScrapOnExpiry);

        ZoneType? requiredZoneType = null;
        if (!string.IsNullOrEmpty(data.RequiredZoneType))
            requiredZoneType = Enum.Parse<ZoneType>(data.RequiredZoneType);
        entity.SetStorageRequirements(data.RequiresSpecialStorage, data.StorageConditions, requiredZoneType);

        entity.SetCustomerRules(data.HasCustomerSpecificRules, data.DefaultCustomerMinShelfLifeDays);

        await _unitOfWork.ShelfLives.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ShelfLifeDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId,
            ShelfLifeType = entity.ShelfLifeType.ToString(),
            TotalShelfLifeDays = entity.TotalShelfLifeDays,
            IsActive = entity.IsActive,
            MinReceivingShelfLifeDays = entity.MinReceivingShelfLifeDays,
            MinReceivingShelfLifePercent = entity.MinReceivingShelfLifePercent,
            ReceivingRuleType = entity.ReceivingRuleType.ToString(),
            MinSalesShelfLifeDays = entity.MinSalesShelfLifeDays,
            MinSalesShelfLifePercent = entity.MinSalesShelfLifePercent,
            SalesRuleType = entity.SalesRuleType.ToString(),
            AlertThresholdDays = entity.AlertThresholdDays,
            AlertThresholdPercent = entity.AlertThresholdPercent,
            CriticalThresholdDays = entity.CriticalThresholdDays,
            CriticalThresholdPercent = entity.CriticalThresholdPercent,
            HasCustomerSpecificRules = entity.HasCustomerSpecificRules,
            DefaultCustomerMinShelfLifeDays = entity.DefaultCustomerMinShelfLifeDays,
            ExpiryAction = entity.ExpiryAction.ToString(),
            AutoQuarantineOnExpiry = entity.AutoQuarantineOnExpiry,
            AutoScrapOnExpiry = entity.AutoScrapOnExpiry,
            DaysBeforeQuarantineAlert = entity.DaysBeforeQuarantineAlert,
            RequiresSpecialStorage = entity.RequiresSpecialStorage,
            StorageConditions = entity.StorageConditions,
            RequiredZoneType = entity.RequiredZoneType?.ToString(),
            CreatedAt = entity.CreatedDate
        };

        return Result<ShelfLifeDto>.Success(dto);
    }
}
