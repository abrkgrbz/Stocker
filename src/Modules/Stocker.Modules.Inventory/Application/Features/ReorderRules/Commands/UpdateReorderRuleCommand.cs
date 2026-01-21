using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Commands;

/// <summary>
/// Command to update a reorder rule
/// </summary>
public class UpdateReorderRuleCommand : IRequest<Result<ReorderRuleDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CreateReorderRuleDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateReorderRuleCommand
/// </summary>
public class UpdateReorderRuleCommandValidator : AbstractValidator<UpdateReorderRuleCommand>
{
    public UpdateReorderRuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kural kimliği gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Yeniden sipariş kuralı verileri gereklidir");
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200).WithMessage("Kural adı gereklidir ve en fazla 200 karakter olabilir");
    }
}

/// <summary>
/// Handler for UpdateReorderRuleCommand
/// </summary>
public class UpdateReorderRuleCommandHandler : IRequestHandler<UpdateReorderRuleCommand, Result<ReorderRuleDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateReorderRuleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ReorderRuleDto>> Handle(UpdateReorderRuleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ReorderRules.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<ReorderRuleDto>.Failure(new Error(
                "ReorderRule.NotFound",
                $"Yeniden sipariş kuralı bulunamadı (ID: {request.Id})",
                ErrorType.NotFound));
        }

        var data = request.Data;

        entity.Update(
            data.Name,
            data.Description,
            data.ProductId,
            data.CategoryId,
            data.WarehouseId,
            data.SupplierId);

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

        _unitOfWork.ReorderRules.Update(entity);
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
