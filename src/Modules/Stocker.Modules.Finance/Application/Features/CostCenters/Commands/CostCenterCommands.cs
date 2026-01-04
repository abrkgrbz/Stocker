using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.CostCenters.Commands;

#region Create Command

/// <summary>
/// Command to create a new cost center
/// </summary>
public class CreateCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCostCenterDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateCostCenterCommand
/// </summary>
public class CreateCostCenterCommandHandler : IRequestHandler<CreateCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(CreateCostCenterCommand request, CancellationToken cancellationToken)
    {
        // Check if code already exists
        var existingCostCenter = await _unitOfWork.CostCenters.GetByCodeAsync(request.Data.Code, cancellationToken);
        if (existingCostCenter != null)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Code", $"'{request.Data.Code}' kodlu masraf merkezi zaten mevcut"));
        }

        // Create cost center entity
        var costCenter = new CostCenter(
            request.Data.Code,
            request.Data.Name,
            request.Data.Type,
            request.Data.Category,
            request.Data.BudgetCurrency);

        // Set description if provided
        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            costCenter.UpdateBasicInfo(request.Data.Name, request.Data.Description);
        }

        // Set parent hierarchy if provided
        if (request.Data.ParentId.HasValue)
        {
            var parent = await _unitOfWork.CostCenters.GetByIdAsync(request.Data.ParentId.Value, cancellationToken);
            if (parent == null)
            {
                return Result<CostCenterDto>.Failure(
                    Error.NotFound("CostCenter.Parent", $"ID {request.Data.ParentId} ile üst masraf merkezi bulunamadı"));
            }

            var level = parent.Level + 1;
            var fullPath = string.IsNullOrEmpty(parent.FullPath)
                ? $"{parent.Code}/{request.Data.Code}"
                : $"{parent.FullPath}/{request.Data.Code}";

            costCenter.SetParent(parent.Id, level, fullPath);
        }
        else
        {
            costCenter.SetParent(null, 0, request.Data.Code);
        }

        // Set sort order
        costCenter.SetSortOrder(request.Data.SortOrder);

        // Set responsibility information
        if (request.Data.ResponsibleUserId.HasValue && !string.IsNullOrEmpty(request.Data.ResponsibleUserName))
        {
            costCenter.SetResponsible(request.Data.ResponsibleUserId.Value, request.Data.ResponsibleUserName);
        }

        if (request.Data.DepartmentId.HasValue)
        {
            costCenter.SetDepartment(request.Data.DepartmentId.Value);
        }

        if (request.Data.BranchId.HasValue)
        {
            costCenter.SetBranch(request.Data.BranchId.Value);
        }

        // Set budget information
        if (request.Data.AnnualBudgetAmount.HasValue && request.Data.AnnualBudgetAmount.Value > 0)
        {
            var budget = Money.Create(request.Data.AnnualBudgetAmount.Value, request.Data.BudgetCurrency);
            costCenter.SetAnnualBudget(budget);
        }

        costCenter.SetBudgetWarningThreshold(request.Data.BudgetWarningThreshold);
        costCenter.SetBudgetOverrunPolicy(request.Data.AllowBudgetOverrun, request.Data.RequireApprovalForOverrun);

        // Set allocation information
        if (!string.IsNullOrEmpty(request.Data.AllocationKey) || request.Data.AllocationRate.HasValue)
        {
            costCenter.SetAllocation(
                request.Data.AllocationKey,
                request.Data.AllocationRate,
                request.Data.IsAutoAllocationEnabled,
                request.Data.AllocationPeriod);
        }

        // Set accounting information
        if (request.Data.AccountingAccountId.HasValue && !string.IsNullOrEmpty(request.Data.AccountingAccountCode))
        {
            costCenter.LinkToAccountingAccount(request.Data.AccountingAccountId.Value, request.Data.AccountingAccountCode);
        }

        if (request.Data.DefaultExpenseAccountId.HasValue)
        {
            costCenter.SetDefaultExpenseAccount(request.Data.DefaultExpenseAccountId.Value);
        }

        // Set dates and notes
        if (request.Data.StartDate.HasValue || request.Data.EndDate.HasValue)
        {
            costCenter.SetDates(request.Data.StartDate, request.Data.EndDate);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            costCenter.SetNotes(request.Data.Notes);
        }

        // Save cost center
        await _unitOfWork.CostCenters.AddAsync(costCenter, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }

    internal static CostCenterDto MapToDto(CostCenter costCenter, CostCenter? parent = null)
    {
        return new CostCenterDto
        {
            Id = costCenter.Id,
            Code = costCenter.Code,
            Name = costCenter.Name,
            Description = costCenter.Description,
            Type = costCenter.Type,
            TypeName = GetTypeName(costCenter.Type),
            Category = costCenter.Category,
            CategoryName = GetCategoryName(costCenter.Category),
            ParentId = costCenter.ParentId,
            ParentName = parent?.Name,
            Level = costCenter.Level,
            FullPath = costCenter.FullPath,
            SortOrder = costCenter.SortOrder,
            ResponsibleUserId = costCenter.ResponsibleUserId,
            ResponsibleUserName = costCenter.ResponsibleUserName,
            DepartmentId = costCenter.DepartmentId,
            BranchId = costCenter.BranchId,
            AnnualBudgetAmount = costCenter.AnnualBudget?.Amount,
            MonthlyBudgetAmount = costCenter.MonthlyBudget?.Amount,
            BudgetCurrency = costCenter.AnnualBudget?.Currency ?? costCenter.SpentAmount.Currency,
            SpentAmount = costCenter.SpentAmount.Amount,
            RemainingBudgetAmount = costCenter.RemainingBudget.Amount,
            BudgetUsagePercentage = costCenter.GetBudgetUsagePercentage(),
            BudgetWarningThreshold = costCenter.BudgetWarningThreshold,
            AllowBudgetOverrun = costCenter.AllowBudgetOverrun,
            RequireApprovalForOverrun = costCenter.RequireApprovalForOverrun,
            IsBudgetWarning = costCenter.IsBudgetWarning(),
            IsOverBudget = costCenter.IsOverBudget(),
            AllocationKey = costCenter.AllocationKey,
            AllocationRate = costCenter.AllocationRate,
            IsAutoAllocationEnabled = costCenter.IsAutoAllocationEnabled,
            AllocationPeriod = costCenter.AllocationPeriod,
            AccountingAccountId = costCenter.AccountingAccountId,
            AccountingAccountCode = costCenter.AccountingAccountCode,
            DefaultExpenseAccountId = costCenter.DefaultExpenseAccountId,
            TotalTransactionCount = costCenter.TotalTransactionCount,
            MonthlyAverageSpending = costCenter.MonthlyAverageSpending?.Amount,
            LastTransactionDate = costCenter.LastTransactionDate,
            LastBudgetUpdateDate = costCenter.LastBudgetUpdateDate,
            IsActive = costCenter.IsActive,
            IsDefault = costCenter.IsDefault,
            IsFrozen = costCenter.IsFrozen,
            StartDate = costCenter.StartDate,
            EndDate = costCenter.EndDate,
            Notes = costCenter.Notes,
            CreatedAt = costCenter.CreatedDate,
            UpdatedAt = costCenter.UpdatedDate
        };
    }

    internal static CostCenterSummaryDto MapToSummaryDto(CostCenter costCenter, CostCenter? parent = null)
    {
        return new CostCenterSummaryDto
        {
            Id = costCenter.Id,
            Code = costCenter.Code,
            Name = costCenter.Name,
            Type = costCenter.Type,
            TypeName = GetTypeName(costCenter.Type),
            Category = costCenter.Category,
            CategoryName = GetCategoryName(costCenter.Category),
            ParentId = costCenter.ParentId,
            ParentName = parent?.Name,
            Level = costCenter.Level,
            FullPath = costCenter.FullPath,
            AnnualBudgetAmount = costCenter.AnnualBudget?.Amount,
            SpentAmount = costCenter.SpentAmount.Amount,
            BudgetUsagePercentage = costCenter.GetBudgetUsagePercentage(),
            IsActive = costCenter.IsActive,
            IsFrozen = costCenter.IsFrozen,
            IsBudgetWarning = costCenter.IsBudgetWarning(),
            IsOverBudget = costCenter.IsOverBudget()
        };
    }

    private static string GetTypeName(CostCenterType type)
    {
        return type switch
        {
            CostCenterType.Main => "Ana Merkez",
            CostCenterType.Department => "Departman",
            CostCenterType.Branch => "Şube",
            CostCenterType.Project => "Proje",
            CostCenterType.Production => "Üretim",
            CostCenterType.Service => "Hizmet",
            CostCenterType.Auxiliary => "Yardımcı",
            CostCenterType.Temporary => "Geçici",
            _ => type.ToString()
        };
    }

    private static string GetCategoryName(CostCenterCategory category)
    {
        return category switch
        {
            CostCenterCategory.Production => "Üretim",
            CostCenterCategory.Administrative => "Yönetim",
            CostCenterCategory.Sales => "Satış",
            CostCenterCategory.Marketing => "Pazarlama",
            CostCenterCategory.Distribution => "Dağıtım",
            CostCenterCategory.RnD => "Ar-Ge",
            CostCenterCategory.Support => "Destek",
            CostCenterCategory.Other => "Diğer",
            _ => category.ToString()
        };
    }
}

#endregion

#region Update Command

/// <summary>
/// Command to update a cost center
/// </summary>
public class UpdateCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateCostCenterDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateCostCenterCommand
/// </summary>
public class UpdateCostCenterCommandHandler : IRequestHandler<UpdateCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(UpdateCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        // Update basic info
        if (!string.IsNullOrEmpty(request.Data.Name) || request.Data.Description != null)
        {
            costCenter.UpdateBasicInfo(
                request.Data.Name ?? costCenter.Name,
                request.Data.Description ?? costCenter.Description);
        }

        // Update parent hierarchy if changed
        if (request.Data.ParentId.HasValue && request.Data.ParentId.Value != costCenter.ParentId)
        {
            if (request.Data.ParentId.Value == costCenter.Id)
            {
                return Result<CostCenterDto>.Failure(
                    Error.Validation("CostCenter.Parent", "Masraf merkezi kendisini üst masraf merkezi olarak seçemez"));
            }

            var parent = await _unitOfWork.CostCenters.GetByIdAsync(request.Data.ParentId.Value, cancellationToken);
            if (parent == null)
            {
                return Result<CostCenterDto>.Failure(
                    Error.NotFound("CostCenter.Parent", $"ID {request.Data.ParentId} ile üst masraf merkezi bulunamadı"));
            }

            var level = parent.Level + 1;
            var fullPath = string.IsNullOrEmpty(parent.FullPath)
                ? $"{parent.Code}/{costCenter.Code}"
                : $"{parent.FullPath}/{costCenter.Code}";

            costCenter.SetParent(parent.Id, level, fullPath);
        }

        // Update sort order
        if (request.Data.SortOrder.HasValue)
        {
            costCenter.SetSortOrder(request.Data.SortOrder.Value);
        }

        // Update responsibility information
        if (request.Data.ResponsibleUserId.HasValue && !string.IsNullOrEmpty(request.Data.ResponsibleUserName))
        {
            costCenter.SetResponsible(request.Data.ResponsibleUserId.Value, request.Data.ResponsibleUserName);
        }

        if (request.Data.DepartmentId.HasValue)
        {
            costCenter.SetDepartment(request.Data.DepartmentId.Value);
        }

        if (request.Data.BranchId.HasValue)
        {
            costCenter.SetBranch(request.Data.BranchId.Value);
        }

        // Update budget information
        if (request.Data.AnnualBudgetAmount.HasValue)
        {
            var currency = request.Data.BudgetCurrency ?? costCenter.AnnualBudget?.Currency ?? "TRY";
            var budget = Money.Create(request.Data.AnnualBudgetAmount.Value, currency);
            costCenter.SetAnnualBudget(budget);
        }

        if (request.Data.BudgetWarningThreshold.HasValue)
        {
            costCenter.SetBudgetWarningThreshold(request.Data.BudgetWarningThreshold.Value);
        }

        if (request.Data.AllowBudgetOverrun.HasValue || request.Data.RequireApprovalForOverrun.HasValue)
        {
            costCenter.SetBudgetOverrunPolicy(
                request.Data.AllowBudgetOverrun ?? costCenter.AllowBudgetOverrun,
                request.Data.RequireApprovalForOverrun ?? costCenter.RequireApprovalForOverrun);
        }

        // Update allocation information
        if (request.Data.AllocationKey != null || request.Data.AllocationRate.HasValue ||
            request.Data.IsAutoAllocationEnabled.HasValue || request.Data.AllocationPeriod.HasValue)
        {
            costCenter.SetAllocation(
                request.Data.AllocationKey ?? costCenter.AllocationKey,
                request.Data.AllocationRate ?? costCenter.AllocationRate,
                request.Data.IsAutoAllocationEnabled ?? costCenter.IsAutoAllocationEnabled,
                request.Data.AllocationPeriod ?? costCenter.AllocationPeriod);
        }

        // Update accounting information
        if (request.Data.AccountingAccountId.HasValue && !string.IsNullOrEmpty(request.Data.AccountingAccountCode))
        {
            costCenter.LinkToAccountingAccount(request.Data.AccountingAccountId.Value, request.Data.AccountingAccountCode);
        }

        if (request.Data.DefaultExpenseAccountId.HasValue)
        {
            costCenter.SetDefaultExpenseAccount(request.Data.DefaultExpenseAccountId.Value);
        }

        // Update dates and notes
        if (request.Data.StartDate.HasValue || request.Data.EndDate.HasValue)
        {
            costCenter.SetDates(
                request.Data.StartDate ?? costCenter.StartDate,
                request.Data.EndDate ?? costCenter.EndDate);
        }

        if (request.Data.Notes != null)
        {
            costCenter.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Delete Command

/// <summary>
/// Command to delete a cost center
/// </summary>
public class DeleteCostCenterCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteCostCenterCommand
/// </summary>
public class DeleteCostCenterCommandHandler : IRequestHandler<DeleteCostCenterCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetWithChildrenAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        // Check if cost center has children
        if (costCenter.Children.Any())
        {
            return Result<bool>.Failure(
                Error.Validation("CostCenter.Children", "Alt masraf merkezleri bulunan masraf merkezi silinemez"));
        }

        // Check if cost center has transactions
        if (costCenter.TotalTransactionCount > 0)
        {
            return Result<bool>.Failure(
                Error.Validation("CostCenter.Transactions", "İşlem kaydı bulunan masraf merkezi silinemez"));
        }

        // Check if cost center is default
        if (costCenter.IsDefault)
        {
            return Result<bool>.Failure(
                Error.Validation("CostCenter.Default", "Varsayılan masraf merkezi silinemez"));
        }

        _unitOfWork.CostCenters.Remove(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

#endregion

#region Activate Command

/// <summary>
/// Command to activate a cost center
/// </summary>
public class ActivateCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ActivateCostCenterCommand
/// </summary>
public class ActivateCostCenterCommandHandler : IRequestHandler<ActivateCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ActivateCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(ActivateCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        if (costCenter.IsActive)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Status", "Masraf merkezi zaten aktif"));
        }

        costCenter.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Deactivate Command

/// <summary>
/// Command to deactivate a cost center
/// </summary>
public class DeactivateCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeactivateCostCenterCommand
/// </summary>
public class DeactivateCostCenterCommandHandler : IRequestHandler<DeactivateCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeactivateCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(DeactivateCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        if (!costCenter.IsActive)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Status", "Masraf merkezi zaten pasif"));
        }

        if (costCenter.IsDefault)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Default", "Varsayılan masraf merkezi pasife alınamaz"));
        }

        costCenter.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Freeze Command

/// <summary>
/// Command to freeze a cost center
/// </summary>
public class FreezeCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for FreezeCostCenterCommand
/// </summary>
public class FreezeCostCenterCommandHandler : IRequestHandler<FreezeCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public FreezeCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(FreezeCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        if (costCenter.IsFrozen)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Status", "Masraf merkezi zaten dondurulmuş"));
        }

        costCenter.Freeze(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Unfreeze Command

/// <summary>
/// Command to unfreeze a cost center
/// </summary>
public class UnfreezeCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for UnfreezeCostCenterCommand
/// </summary>
public class UnfreezeCostCenterCommandHandler : IRequestHandler<UnfreezeCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UnfreezeCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(UnfreezeCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        if (!costCenter.IsFrozen)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Status", "Masraf merkezi dondurulmamış"));
        }

        costCenter.Unfreeze();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Set Default Command

/// <summary>
/// Command to set a cost center as default
/// </summary>
public class SetDefaultCostCenterCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SetDefaultCostCenterCommand
/// </summary>
public class SetDefaultCostCenterCommandHandler : IRequestHandler<SetDefaultCostCenterCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SetDefaultCostCenterCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(SetDefaultCostCenterCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        if (!costCenter.IsActive)
        {
            return Result<CostCenterDto>.Failure(
                Error.Validation("CostCenter.Status", "Pasif masraf merkezi varsayılan olarak ayarlanamaz"));
        }

        // Remove default from current default cost center
        var currentDefault = await _unitOfWork.CostCenters.GetDefaultAsync(cancellationToken);
        if (currentDefault != null && currentDefault.Id != costCenter.Id)
        {
            currentDefault.RemoveDefault();
        }

        costCenter.SetAsDefault();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Reset Yearly Spending Command

/// <summary>
/// Command to reset yearly spending for a cost center
/// </summary>
public class ResetYearlySpendingCommand : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ResetYearlySpendingCommand
/// </summary>
public class ResetYearlySpendingCommandHandler : IRequestHandler<ResetYearlySpendingCommand, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ResetYearlySpendingCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(ResetYearlySpendingCommand request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        costCenter.ResetYearlySpending();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion
