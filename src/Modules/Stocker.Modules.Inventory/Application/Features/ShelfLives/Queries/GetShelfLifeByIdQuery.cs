using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ShelfLives.Queries;

/// <summary>
/// Query to get a shelf life configuration by ID
/// </summary>
public class GetShelfLifeByIdQuery : IRequest<Result<ShelfLifeDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetShelfLifeByIdQuery
/// </summary>
public class GetShelfLifeByIdQueryHandler : IRequestHandler<GetShelfLifeByIdQuery, Result<ShelfLifeDto>>
{
    private readonly IShelfLifeRepository _repository;

    public GetShelfLifeByIdQueryHandler(IShelfLifeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ShelfLifeDto>> Handle(GetShelfLifeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<ShelfLifeDto>.Failure(new Error("ShelfLife.NotFound", $"Raf ömrü yapılandırması bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        var dto = new ShelfLifeDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId,
            ProductName = entity.Product?.Name,
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
