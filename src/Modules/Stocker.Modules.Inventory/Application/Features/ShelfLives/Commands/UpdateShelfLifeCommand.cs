using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ShelfLives.Commands;

/// <summary>
/// Command to update an existing shelf life configuration
/// </summary>
public class UpdateShelfLifeCommand : IRequest<Result<ShelfLifeDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateShelfLifeDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateShelfLifeCommand
/// </summary>
public class UpdateShelfLifeCommandValidator : AbstractValidator<UpdateShelfLifeCommand>
{
    public UpdateShelfLifeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.TotalShelfLifeDays).GreaterThan(0);
        RuleFor(x => x.Data.StorageConditions).MaximumLength(500);
    }
}

/// <summary>
/// Handler for UpdateShelfLifeCommand
/// </summary>
public class UpdateShelfLifeCommandHandler : IRequestHandler<UpdateShelfLifeCommand, Result<ShelfLifeDto>>
{
    private readonly IShelfLifeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateShelfLifeCommandHandler(IShelfLifeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShelfLifeDto>> Handle(UpdateShelfLifeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<ShelfLifeDto>.Failure(new Error("ShelfLife.NotFound", $"Shelf life configuration with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

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

        if (data.IsActive)
            entity.Activate();
        else
            entity.Deactivate();

        await _repository.UpdateAsync(entity, cancellationToken);
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
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<ShelfLifeDto>.Success(dto);
    }
}
