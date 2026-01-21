using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Commands;

/// <summary>
/// Command to create a new reorder rule
/// </summary>
public class CreateReorderRuleCommand : IRequest<Result<ReorderRuleDto>>
{
    public Guid TenantId { get; set; }
    public CreateReorderRuleDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateReorderRuleCommand
/// </summary>
public class CreateReorderRuleCommandValidator : AbstractValidator<CreateReorderRuleCommand>
{
    public CreateReorderRuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Yeniden sipariş kuralı verileri gereklidir");
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200).WithMessage("Kural adı gereklidir ve en fazla 200 karakter olabilir");
        RuleFor(x => x.Data.Description).MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir");
    }
}

/// <summary>
/// Handler for CreateReorderRuleCommand
/// </summary>
public class CreateReorderRuleCommandHandler : IRequestHandler<CreateReorderRuleCommand, Result<ReorderRuleDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateReorderRuleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ReorderRuleDto>> Handle(CreateReorderRuleCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var entity = new ReorderRule(
            data.Name,
            data.Description,
            data.ProductId,
            data.CategoryId,
            data.WarehouseId,
            data.SupplierId);

        entity.SetTenantId(request.TenantId);

        entity.SetTriggerConditions(
            data.TriggerBelowQuantity,
            data.TriggerBelowDaysOfStock,
            data.TriggerOnForecast,
            data.ForecastLeadTimeDays);

        entity.SetReorderSettings(
            data.FixedReorderQuantity,
            data.ReorderUpToQuantity,
            data.UseEconomicOrderQuantity,
            data.MinimumOrderQuantity,
            data.MaximumOrderQuantity,
            data.RoundToPackSize,
            data.PackSize);

        entity.SetSchedule(data.IsScheduled, data.CronExpression);
        entity.SetApprovalSettings(data.RequiresApproval, data.ApproverUserId);

        await _unitOfWork.ReorderRules.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(entity);
        return Result<ReorderRuleDto>.Success(dto);
    }

    private static ReorderRuleDto MapToDto(ReorderRule entity)
    {
        return new ReorderRuleDto
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
    }
}
