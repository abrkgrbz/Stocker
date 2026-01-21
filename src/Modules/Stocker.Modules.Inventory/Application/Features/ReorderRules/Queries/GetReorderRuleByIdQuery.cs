using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Queries;

/// <summary>
/// Query to get a reorder rule by ID
/// </summary>
public class GetReorderRuleByIdQuery : IRequest<Result<ReorderRuleDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetReorderRuleByIdQuery
/// </summary>
public class GetReorderRuleByIdQueryHandler : IRequestHandler<GetReorderRuleByIdQuery, Result<ReorderRuleDto>>
{
    private readonly IReorderRuleRepository _repository;

    public GetReorderRuleByIdQueryHandler(IReorderRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ReorderRuleDto>> Handle(GetReorderRuleByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<ReorderRuleDto>.Failure(new Error(
                "ReorderRule.NotFound",
                $"Yeniden sipariş kuralı bulunamadı (ID: {request.Id})",
                ErrorType.NotFound));
        }

        var dto = new ReorderRuleDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            ProductId = entity.ProductId,
            ProductCode = entity.Product?.Code,
            ProductName = entity.Product?.Name,
            CategoryId = entity.CategoryId,
            CategoryName = entity.Category?.Name,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.Warehouse?.Name,
            SupplierId = entity.SupplierId,
            SupplierName = entity.Supplier?.Name,
            TriggerBelowQuantity = entity.TriggerBelowQuantity,
            TriggerBelowDaysOfStock = entity.TriggerBelowDaysOfStock,
            TriggerOnForecast = entity.TriggerOnForecast,
            ForecastLeadTimeDays = entity.ForecastLeadTimeDays,
            FixedReorderQuantity = entity.FixedReorderQuantity,
            ReorderUpToQuantity = entity.ReorderUpToQuantity,
            UseEconomicOrderQuantity = entity.UseEconomicOrderQuantity,
            MinimumOrderQuantity = entity.MinimumOrderQuantity,
            MaximumOrderQuantity = entity.MaximumOrderQuantity,
            RoundToPackSize = entity.RoundToPackSize,
            PackSize = entity.PackSize,
            IsScheduled = entity.IsScheduled,
            CronExpression = entity.CronExpression,
            NextScheduledRun = entity.NextScheduledRun,
            Status = entity.Status,
            RequiresApproval = entity.RequiresApproval,
            ApproverUserId = entity.ApproverUserId,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate,
            LastExecutedAt = entity.LastExecutedAt,
            ExecutionCount = entity.ExecutionCount
        };

        return Result<ReorderRuleDto>.Success(dto);
    }
}
