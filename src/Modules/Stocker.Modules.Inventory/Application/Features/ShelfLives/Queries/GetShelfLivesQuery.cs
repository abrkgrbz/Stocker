using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ShelfLives.Queries;

/// <summary>
/// Query to get all shelf life configurations
/// </summary>
public class GetShelfLivesQuery : IRequest<Result<List<ShelfLifeDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetShelfLivesQuery
/// </summary>
public class GetShelfLivesQueryHandler : IRequestHandler<GetShelfLivesQuery, Result<List<ShelfLifeDto>>>
{
    private readonly IShelfLifeRepository _repository;

    public GetShelfLivesQueryHandler(IShelfLifeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ShelfLifeDto>>> Handle(GetShelfLivesQuery request, CancellationToken cancellationToken)
    {
        var entities = request.IncludeInactive
            ? await _repository.GetAllAsync(cancellationToken)
            : await _repository.GetActiveAsync(cancellationToken);

        var dtos = entities.Select(e => new ShelfLifeDto
        {
            Id = e.Id,
            ProductId = e.ProductId,
            ProductName = e.Product?.Name,
            ShelfLifeType = e.ShelfLifeType.ToString(),
            TotalShelfLifeDays = e.TotalShelfLifeDays,
            IsActive = e.IsActive,
            MinReceivingShelfLifeDays = e.MinReceivingShelfLifeDays,
            MinReceivingShelfLifePercent = e.MinReceivingShelfLifePercent,
            ReceivingRuleType = e.ReceivingRuleType.ToString(),
            MinSalesShelfLifeDays = e.MinSalesShelfLifeDays,
            MinSalesShelfLifePercent = e.MinSalesShelfLifePercent,
            SalesRuleType = e.SalesRuleType.ToString(),
            AlertThresholdDays = e.AlertThresholdDays,
            AlertThresholdPercent = e.AlertThresholdPercent,
            CriticalThresholdDays = e.CriticalThresholdDays,
            CriticalThresholdPercent = e.CriticalThresholdPercent,
            HasCustomerSpecificRules = e.HasCustomerSpecificRules,
            DefaultCustomerMinShelfLifeDays = e.DefaultCustomerMinShelfLifeDays,
            ExpiryAction = e.ExpiryAction.ToString(),
            AutoQuarantineOnExpiry = e.AutoQuarantineOnExpiry,
            AutoScrapOnExpiry = e.AutoScrapOnExpiry,
            DaysBeforeQuarantineAlert = e.DaysBeforeQuarantineAlert,
            RequiresSpecialStorage = e.RequiresSpecialStorage,
            StorageConditions = e.StorageConditions,
            RequiredZoneType = e.RequiredZoneType?.ToString(),
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<ShelfLifeDto>>.Success(dtos);
    }
}
