using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Queries;

/// <summary>
/// Query to get all reorder rules
/// </summary>
public class GetReorderRulesQuery : IRequest<Result<List<ReorderRuleDto>>>
{
    public Guid TenantId { get; set; }
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public int? SupplierId { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// Handler for GetReorderRulesQuery
/// </summary>
public class GetReorderRulesQueryHandler : IRequestHandler<GetReorderRulesQuery, Result<List<ReorderRuleDto>>>
{
    private readonly IReorderRuleRepository _repository;

    public GetReorderRulesQueryHandler(IReorderRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ReorderRuleDto>>> Handle(GetReorderRulesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);

        // Apply filters
        if (request.ProductId.HasValue)
            entities = entities.Where(e => e.ProductId == request.ProductId.Value).ToList();

        if (request.CategoryId.HasValue)
            entities = entities.Where(e => e.CategoryId == request.CategoryId.Value).ToList();

        if (request.WarehouseId.HasValue)
            entities = entities.Where(e => e.WarehouseId == request.WarehouseId.Value).ToList();

        if (request.SupplierId.HasValue)
            entities = entities.Where(e => e.SupplierId == request.SupplierId.Value).ToList();

        if (request.IsActive.HasValue)
        {
            entities = request.IsActive.Value
                ? entities.Where(e => e.Status == Domain.Enums.ReorderRuleStatus.Active).ToList()
                : entities.Where(e => e.Status != Domain.Enums.ReorderRuleStatus.Active).ToList();
        }

        var dtos = entities.Select(e => new ReorderRuleDto
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            ProductId = e.ProductId,
            ProductCode = e.Product?.Code,
            ProductName = e.Product?.Name,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            SupplierId = e.SupplierId,
            SupplierName = e.Supplier?.Name,
            TriggerBelowQuantity = e.TriggerBelowQuantity,
            TriggerBelowDaysOfStock = e.TriggerBelowDaysOfStock,
            TriggerOnForecast = e.TriggerOnForecast,
            ForecastLeadTimeDays = e.ForecastLeadTimeDays,
            FixedReorderQuantity = e.FixedReorderQuantity,
            ReorderUpToQuantity = e.ReorderUpToQuantity,
            UseEconomicOrderQuantity = e.UseEconomicOrderQuantity,
            MinimumOrderQuantity = e.MinimumOrderQuantity,
            MaximumOrderQuantity = e.MaximumOrderQuantity,
            RoundToPackSize = e.RoundToPackSize,
            PackSize = e.PackSize,
            IsScheduled = e.IsScheduled,
            CronExpression = e.CronExpression,
            NextScheduledRun = e.NextScheduledRun,
            Status = e.Status,
            RequiresApproval = e.RequiresApproval,
            ApproverUserId = e.ApproverUserId,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate,
            LastExecutedAt = e.LastExecutedAt,
            ExecutionCount = e.ExecutionCount
        }).ToList();

        return Result<List<ReorderRuleDto>>.Success(dtos);
    }
}
