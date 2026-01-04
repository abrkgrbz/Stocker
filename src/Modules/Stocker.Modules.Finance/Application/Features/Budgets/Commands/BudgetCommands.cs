using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.Budgets.Commands;

/// <summary>
/// Command to create a new budget
/// </summary>
public class CreateBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateBudgetDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateBudgetCommand
/// </summary>
public class CreateBudgetCommandHandler : IRequestHandler<CreateBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(CreateBudgetCommand request, CancellationToken cancellationToken)
    {
        // Check if code already exists
        var codeExists = await _unitOfWork.Budgets.CodeExistsAsync(request.Data.Code, cancellationToken: cancellationToken);
        if (codeExists)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Code", $"'{request.Data.Code}' kodlu butce zaten mevcut"));
        }

        // Validate parent budget if specified
        if (request.Data.ParentBudgetId.HasValue)
        {
            var parentBudget = await _unitOfWork.Budgets.GetByIdAsync(request.Data.ParentBudgetId.Value, cancellationToken);
            if (parentBudget == null)
            {
                return Result<BudgetDto>.Failure(
                    Error.NotFound("ParentBudget", $"ID {request.Data.ParentBudgetId.Value} ile ust butce bulunamadi"));
            }
        }

        // Create budget entity
        var totalBudget = Money.Create(request.Data.TotalBudget, request.Data.Currency);
        var budget = new Budget(
            request.Data.Code,
            request.Data.Name,
            request.Data.Type,
            request.Data.Category,
            request.Data.FiscalYear,
            request.Data.StartDate,
            request.Data.EndDate,
            totalBudget,
            request.Data.PeriodType);

        // Set description
        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            budget.SetDescription(request.Data.Description);
        }

        // Set thresholds
        budget.SetThresholds(request.Data.WarningThreshold, request.Data.CriticalThreshold);

        // Set overrun policy
        budget.SetOverrunPolicy(request.Data.AllowOverrun, request.Data.RequireApprovalForOverrun);

        // Set transfer policy
        budget.SetTransferPolicy(request.Data.AllowTransfer, request.Data.MaxTransferRate);

        // Link to parent budget
        if (request.Data.ParentBudgetId.HasValue)
        {
            budget.LinkToParentBudget(request.Data.ParentBudgetId.Value);
        }

        // Link to cost center
        if (request.Data.CostCenterId.HasValue)
        {
            budget.LinkToCostCenter(request.Data.CostCenterId.Value);
        }

        // Link to department
        if (request.Data.DepartmentId.HasValue)
        {
            budget.LinkToDepartment(request.Data.DepartmentId.Value);
        }

        // Link to project
        if (request.Data.ProjectId.HasValue)
        {
            budget.LinkToProject(request.Data.ProjectId.Value);
        }

        // Link to account
        if (request.Data.AccountId.HasValue && !string.IsNullOrEmpty(request.Data.AccountCode))
        {
            budget.LinkToAccount(request.Data.AccountId.Value, request.Data.AccountCode);
        }

        // Set owner
        if (request.Data.OwnerUserId.HasValue && !string.IsNullOrEmpty(request.Data.OwnerUserName))
        {
            budget.SetOwner(request.Data.OwnerUserId.Value, request.Data.OwnerUserName);
        }

        // Set approver
        if (request.Data.ApproverUserId.HasValue)
        {
            budget.SetApprover(request.Data.ApproverUserId.Value);
        }

        // Set notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            budget.SetNotes(request.Data.Notes);
        }

        // Save budget
        await _unitOfWork.Budgets.AddAsync(budget, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }

    internal static BudgetDto MapToDto(Budget budget)
    {
        return new BudgetDto
        {
            Id = budget.Id,
            Code = budget.Code,
            Name = budget.Name,
            Description = budget.Description,
            Type = budget.Type,
            TypeName = GetBudgetTypeName(budget.Type),
            Category = budget.Category,
            CategoryName = GetBudgetCategoryName(budget.Category),
            FiscalYear = budget.FiscalYear,
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            PeriodType = budget.PeriodType,
            PeriodTypeName = GetPeriodTypeName(budget.PeriodType),
            TotalBudget = budget.TotalBudget.Amount,
            UsedAmount = budget.UsedAmount.Amount,
            RemainingAmount = budget.RemainingAmount.Amount,
            CommittedAmount = budget.CommittedAmount.Amount,
            AvailableAmount = budget.AvailableAmount.Amount,
            Currency = budget.Currency,
            RevisedBudget = budget.RevisedBudget?.Amount,
            OriginalBudget = budget.OriginalBudget.Amount,
            AllowOverrun = budget.AllowOverrun,
            RequireApprovalForOverrun = budget.RequireApprovalForOverrun,
            WarningThreshold = budget.WarningThreshold,
            CriticalThreshold = budget.CriticalThreshold,
            AllowTransfer = budget.AllowTransfer,
            MaxTransferRate = budget.MaxTransferRate,
            ParentBudgetId = budget.ParentBudgetId,
            ParentBudgetName = budget.ParentBudget?.Name,
            CostCenterId = budget.CostCenterId,
            CostCenterName = budget.CostCenter?.Name,
            DepartmentId = budget.DepartmentId,
            ProjectId = budget.ProjectId,
            AccountId = budget.AccountId,
            AccountCode = budget.AccountCode,
            OwnerUserId = budget.OwnerUserId,
            OwnerUserName = budget.OwnerUserName,
            ApproverUserId = budget.ApproverUserId,
            Status = budget.Status,
            StatusName = GetBudgetStatusName(budget.Status),
            IsActive = budget.IsActive,
            IsLocked = budget.IsLocked,
            ApprovalDate = budget.ApprovalDate,
            RevisionCount = budget.RevisionCount,
            LastRevisionDate = budget.LastRevisionDate,
            Notes = budget.Notes,
            UsagePercentage = budget.GetUsagePercentage(),
            CommitmentPercentage = budget.GetCommitmentPercentage(),
            TotalAllocationPercentage = budget.GetTotalAllocationPercentage(),
            HealthStatus = budget.GetHealthStatus(),
            HealthStatusName = GetHealthStatusName(budget.GetHealthStatus()),
            ChildBudgets = budget.ChildBudgets?.Select(MapToSummaryDto).ToList() ?? new List<BudgetSummaryDto>(),
            CreatedAt = budget.CreatedDate,
            UpdatedAt = budget.UpdatedDate
        };
    }

    internal static BudgetSummaryDto MapToSummaryDto(Budget budget)
    {
        return new BudgetSummaryDto
        {
            Id = budget.Id,
            Code = budget.Code,
            Name = budget.Name,
            Type = budget.Type,
            TypeName = GetBudgetTypeName(budget.Type),
            Category = budget.Category,
            FiscalYear = budget.FiscalYear,
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            TotalBudget = budget.TotalBudget.Amount,
            UsedAmount = budget.UsedAmount.Amount,
            RemainingAmount = budget.RemainingAmount.Amount,
            AvailableAmount = budget.AvailableAmount.Amount,
            Currency = budget.Currency,
            Status = budget.Status,
            StatusName = GetBudgetStatusName(budget.Status),
            IsActive = budget.IsActive,
            UsagePercentage = budget.GetUsagePercentage(),
            HealthStatus = budget.GetHealthStatus(),
            HealthStatusName = GetHealthStatusName(budget.GetHealthStatus())
        };
    }

    private static string GetBudgetTypeName(BudgetType type) => type switch
    {
        BudgetType.Corporate => "Kurumsal",
        BudgetType.Department => "Departman",
        BudgetType.CostCenter => "Masraf Merkezi",
        BudgetType.Project => "Proje",
        BudgetType.Account => "Hesap",
        BudgetType.LineItem => "Kalem",
        _ => type.ToString()
    };

    private static string GetBudgetCategoryName(BudgetCategory category) => category switch
    {
        BudgetCategory.Operating => "Operasyonel",
        BudgetCategory.Capital => "Yatirim",
        BudgetCategory.Revenue => "Gelir",
        BudgetCategory.Expense => "Gider",
        BudgetCategory.Mixed => "Karma",
        _ => category.ToString()
    };

    private static string GetPeriodTypeName(BudgetPeriodType periodType) => periodType switch
    {
        BudgetPeriodType.Monthly => "Aylik",
        BudgetPeriodType.Quarterly => "Uc Aylik",
        BudgetPeriodType.Annual => "Yillik",
        BudgetPeriodType.Custom => "Ozel",
        _ => periodType.ToString()
    };

    private static string GetBudgetStatusName(BudgetStatus status) => status switch
    {
        BudgetStatus.Draft => "Taslak",
        BudgetStatus.PendingApproval => "Onay Bekliyor",
        BudgetStatus.Approved => "Onaylandi",
        BudgetStatus.Active => "Aktif",
        BudgetStatus.Inactive => "Pasif",
        BudgetStatus.Rejected => "Reddedildi",
        BudgetStatus.Closed => "Kapatildi",
        _ => status.ToString()
    };

    private static string GetHealthStatusName(BudgetHealthStatus healthStatus) => healthStatus switch
    {
        BudgetHealthStatus.Healthy => "Saglikli",
        BudgetHealthStatus.Warning => "Uyari",
        BudgetHealthStatus.Critical => "Kritik",
        BudgetHealthStatus.Exceeded => "Asildi",
        _ => healthStatus.ToString()
    };
}

/// <summary>
/// Command to update a budget
/// </summary>
public class UpdateBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateBudgetDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateBudgetCommand
/// </summary>
public class UpdateBudgetCommandHandler : IRequestHandler<UpdateBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(UpdateBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        if (budget.IsLocked)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.IsLocked", "Kilitli butceler guncellenemez"));
        }

        // Update description
        if (request.Data.Description != null)
        {
            budget.SetDescription(request.Data.Description);
        }

        // Update thresholds
        if (request.Data.WarningThreshold.HasValue && request.Data.CriticalThreshold.HasValue)
        {
            try
            {
                budget.SetThresholds(request.Data.WarningThreshold.Value, request.Data.CriticalThreshold.Value);
            }
            catch (ArgumentException ex)
            {
                return Result<BudgetDto>.Failure(
                    Error.Validation("Budget.Thresholds", ex.Message));
            }
        }

        // Update overrun policy
        if (request.Data.AllowOverrun.HasValue)
        {
            budget.SetOverrunPolicy(
                request.Data.AllowOverrun.Value,
                request.Data.RequireApprovalForOverrun ?? budget.RequireApprovalForOverrun);
        }

        // Update transfer policy
        if (request.Data.AllowTransfer.HasValue)
        {
            budget.SetTransferPolicy(request.Data.AllowTransfer.Value, request.Data.MaxTransferRate);
        }

        // Update owner
        if (request.Data.OwnerUserId.HasValue && !string.IsNullOrEmpty(request.Data.OwnerUserName))
        {
            budget.SetOwner(request.Data.OwnerUserId.Value, request.Data.OwnerUserName);
        }

        // Update approver
        if (request.Data.ApproverUserId.HasValue)
        {
            budget.SetApprover(request.Data.ApproverUserId.Value);
        }

        // Update notes
        if (request.Data.Notes != null)
        {
            budget.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete a budget
/// </summary>
public class DeleteBudgetCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteBudgetCommand
/// </summary>
public class DeleteBudgetCommandHandler : IRequestHandler<DeleteBudgetCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetWithChildrenAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        if (budget.Status == BudgetStatus.Active)
        {
            return Result<bool>.Failure(
                Error.Validation("Budget.Status", "Aktif butceler silinemez"));
        }

        if (budget.UsedAmount.Amount > 0)
        {
            return Result<bool>.Failure(
                Error.Validation("Budget.UsedAmount", "Kullanimi olan butceler silinemez"));
        }

        if (budget.ChildBudgets != null && budget.ChildBudgets.Any())
        {
            return Result<bool>.Failure(
                Error.Validation("Budget.ChildBudgets", "Alt butceleri olan butceler silinemez"));
        }

        _unitOfWork.Budgets.Remove(budget);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

/// <summary>
/// Command to approve a budget
/// </summary>
public class ApproveBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public int ApproverUserId { get; set; }
    public string? ApproverName { get; set; }
    public string? Note { get; set; }
}

/// <summary>
/// Handler for ApproveBudgetCommand
/// </summary>
public class ApproveBudgetCommandHandler : IRequestHandler<ApproveBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(ApproveBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        try
        {
            budget.Approve(request.ApproverUserId);

            if (!string.IsNullOrEmpty(request.Note))
            {
                budget.SetNotes(string.IsNullOrEmpty(budget.Notes)
                    ? $"Onay notu: {request.Note}"
                    : $"{budget.Notes}\nOnay notu: {request.Note}");
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Approve", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to reject a budget
/// </summary>
public class RejectBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for RejectBudgetCommand
/// </summary>
public class RejectBudgetCommandHandler : IRequestHandler<RejectBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RejectBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(RejectBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Reject", "Red sebebi belirtilmelidir"));
        }

        try
        {
            budget.Reject(request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Reject", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to submit a budget for approval
/// </summary>
public class SubmitBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SubmitBudgetCommand
/// </summary>
public class SubmitBudgetCommandHandler : IRequestHandler<SubmitBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SubmitBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(SubmitBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        try
        {
            budget.Submit();
        }
        catch (InvalidOperationException ex)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Submit", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to activate a budget
/// </summary>
public class ActivateBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ActivateBudgetCommand
/// </summary>
public class ActivateBudgetCommandHandler : IRequestHandler<ActivateBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ActivateBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(ActivateBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        try
        {
            budget.Activate();
        }
        catch (InvalidOperationException ex)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Activate", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to deactivate a budget
/// </summary>
public class DeactivateBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeactivateBudgetCommand
/// </summary>
public class DeactivateBudgetCommandHandler : IRequestHandler<DeactivateBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeactivateBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(DeactivateBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        budget.Deactivate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to revise a budget
/// </summary>
public class ReviseBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public decimal NewBudget { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for ReviseBudgetCommand
/// </summary>
public class ReviseBudgetCommandHandler : IRequestHandler<ReviseBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ReviseBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(ReviseBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        try
        {
            var newBudgetMoney = Money.Create(request.NewBudget, budget.Currency);
            budget.Revise(newBudgetMoney, request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BudgetDto>.Failure(
                Error.Validation("Budget.Revise", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to lock a budget
/// </summary>
public class LockBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for LockBudgetCommand
/// </summary>
public class LockBudgetCommandHandler : IRequestHandler<LockBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public LockBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(LockBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        budget.Lock();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to unlock a budget
/// </summary>
public class UnlockBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for UnlockBudgetCommand
/// </summary>
public class UnlockBudgetCommandHandler : IRequestHandler<UnlockBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UnlockBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(UnlockBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        budget.Unlock();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Command to close a budget
/// </summary>
public class CloseBudgetCommand : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for CloseBudgetCommand
/// </summary>
public class CloseBudgetCommandHandler : IRequestHandler<CloseBudgetCommand, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CloseBudgetCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(CloseBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        budget.Close();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}
