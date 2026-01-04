using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.Expenses.Commands;

/// <summary>
/// Command to create a new expense
/// </summary>
public class CreateExpenseCommand : IRequest<Result<ExpenseDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateExpenseDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateExpenseCommand
/// </summary>
public class CreateExpenseCommandHandler : IRequestHandler<CreateExpenseCommand, Result<ExpenseDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateExpenseCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        // Generate expense number
        var year = request.Data.ExpenseDate.Year;
        var expenseNumber = await _unitOfWork.Expenses.GetNextExpenseNumberAsync(year, cancellationToken);

        // Create expense entity
        var grossAmount = Money.Create(request.Data.Amount, request.Data.Currency);

        // Map ExpenseCategoryType to ExpenseMainCategory
        var category = MapCategoryTypeToMainCategory(request.Data.Category);

        var expense = new Expense(
            expenseNumber,
            request.Data.ExpenseDate,
            category,
            request.Data.Description,
            grossAmount,
            request.Data.VatRate,
            ExpenseDocumentType.Invoice,
            request.Data.Currency);

        // Set VAT deductible
        expense.SetVatDeductible(request.Data.IsVatDeductible);

        // Set exchange rate
        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            expense.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Set document info
        if (!string.IsNullOrEmpty(request.Data.DocumentNumber) || request.Data.DocumentDate.HasValue)
        {
            expense.SetDocument(request.Data.DocumentNumber, request.Data.DocumentDate);
        }

        // Link to supplier (current account)
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount != null)
            {
                expense.LinkToSupplier(currentAccount.Id, currentAccount.Name, currentAccount.TaxNumber);
            }
        }

        // Set cost center
        if (request.Data.CostCenterId.HasValue)
        {
            expense.SetCostCenter(request.Data.CostCenterId.Value);
        }

        // Set project
        if (request.Data.ProjectId.HasValue)
        {
            expense.SetProject(request.Data.ProjectId.Value);
        }

        // Set payment method
        if (request.Data.PaymentMethod.HasValue)
        {
            expense.SetPaymentMethod(request.Data.PaymentMethod.Value);
        }

        // Mark as paid if payment date is provided
        if (request.Data.PaymentDate.HasValue)
        {
            expense.MarkAsPaid(request.Data.PaymentDate.Value);
        }

        // Set expense account
        if (request.Data.AccountId.HasValue)
        {
            expense.SetExpenseAccount(request.Data.AccountId.Value, string.Empty);
        }

        // Set receipt path
        if (!string.IsNullOrEmpty(request.Data.ReceiptPath))
        {
            expense.SetAttachment(request.Data.ReceiptPath);
        }

        // Set notes
        expense.SetNotes(request.Data.Notes);

        // Apply withholding if needed
        if (request.Data.ApplyWithholding)
        {
            var withholdingRate = MapWithholdingRate(request.Data.WithholdingRate);
            if (withholdingRate > 0)
            {
                expense.SetVatWithholding(grossAmount.Amount * withholdingRate / 100);
            }
        }

        // Save
        await _unitOfWork.Expenses.AddAsync(expense, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }

    private static ExpenseMainCategory MapCategoryTypeToMainCategory(ExpenseCategoryType categoryType)
    {
        return categoryType switch
        {
            ExpenseCategoryType.ResearchAndDevelopment => ExpenseMainCategory.ResearchDevelopment,
            ExpenseCategoryType.MarketingSalesDistribution => ExpenseMainCategory.MarketingSalesDistribution,
            ExpenseCategoryType.GeneralAdministrative => ExpenseMainCategory.GeneralAdministrative,
            ExpenseCategoryType.Personnel => ExpenseMainCategory.Personnel,
            ExpenseCategoryType.Rent => ExpenseMainCategory.Office,
            ExpenseCategoryType.Utilities => ExpenseMainCategory.Office,
            ExpenseCategoryType.Communication => ExpenseMainCategory.Office,
            ExpenseCategoryType.Transportation => ExpenseMainCategory.Vehicle,
            ExpenseCategoryType.TravelAccommodation => ExpenseMainCategory.Travel,
            _ => ExpenseMainCategory.Other
        };
    }

    private static decimal MapWithholdingRate(VatWithholdingRate rate)
    {
        // VatWithholdingRate enum values represent percentages directly
        // TwoTenths = 20, ThreeTenths = 30, etc.
        return rate switch
        {
            VatWithholdingRate.TwoTenths => 20m,
            VatWithholdingRate.ThreeTenths => 30m,
            VatWithholdingRate.FourTenths => 40m,
            VatWithholdingRate.FiveTenths => 50m,
            VatWithholdingRate.SevenTenths => 70m,
            VatWithholdingRate.NineTenths => 90m,
            VatWithholdingRate.Full => 100m,
            _ => 0m
        };
    }

    internal static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            ExpenseNumber = expense.ExpenseNumber,
            ExpenseDate = expense.ExpenseDate,
            Category = MapMainCategoryToCategoryType(expense.Category),
            CategoryName = expense.Category.ToString(),
            Description = expense.Description,
            CurrentAccountId = expense.CurrentAccountId,
            CurrentAccountName = expense.SupplierName,
            Amount = expense.NetAmount.Amount,
            Currency = expense.Currency,
            ExchangeRate = expense.ExchangeRate,
            AmountTRY = expense.AmountTRY.Amount,
            VatRate = expense.VatRate,
            VatAmount = expense.VatAmount.Amount,
            GrossAmount = expense.GrossAmount.Amount,
            IsVatDeductible = expense.IsVatDeductible,
            ApplyWithholding = expense.HasVatWithholding,
            WithholdingRate = VatWithholdingRate.None,
            WithholdingAmount = expense.VatWithholdingAmount?.Amount ?? 0,
            CostCenterId = expense.CostCenterId,
            CostCenterName = expense.CostCenter?.Name,
            DocumentNumber = expense.DocumentNumber,
            DocumentDate = expense.DocumentDate,
            ReceiptPath = expense.AttachmentPath,
            Status = expense.Status,
            ApprovedByUserId = expense.ApprovedByUserId,
            ApprovalDate = expense.ApprovalDate,
            ApprovalNotes = expense.ApprovalNote,
            PaymentMethod = expense.PaymentMethod,
            PaymentDate = expense.PaymentDate,
            PaymentId = expense.PaymentId,
            IsPaid = expense.IsPaid,
            ProjectId = expense.ProjectId,
            ProjectName = null,
            InvoiceId = expense.InvoiceId,
            AccountId = expense.ExpenseAccountId,
            AccountCode = expense.ExpenseAccountCode,
            JournalEntryId = expense.JournalEntryId,
            Notes = expense.Notes,
            InternalNotes = expense.DetailedDescription,
            CreatedByUserId = null,
            CreatedAt = expense.CreatedDate,
            UpdatedAt = expense.UpdatedDate
        };
    }

    private static ExpenseCategoryType MapMainCategoryToCategoryType(ExpenseMainCategory category)
    {
        return category switch
        {
            ExpenseMainCategory.ResearchDevelopment => ExpenseCategoryType.ResearchAndDevelopment,
            ExpenseMainCategory.MarketingSalesDistribution => ExpenseCategoryType.MarketingSalesDistribution,
            ExpenseMainCategory.GeneralAdministrative => ExpenseCategoryType.GeneralAdministrative,
            ExpenseMainCategory.Personnel => ExpenseCategoryType.Personnel,
            ExpenseMainCategory.Vehicle => ExpenseCategoryType.Transportation,
            ExpenseMainCategory.Office => ExpenseCategoryType.Rent,
            ExpenseMainCategory.Travel => ExpenseCategoryType.TravelAccommodation,
            _ => ExpenseCategoryType.Other
        };
    }
}

/// <summary>
/// Command to update an expense
/// </summary>
public class UpdateExpenseCommand : IRequest<Result<ExpenseDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateExpenseDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateExpenseCommand
/// </summary>
public class UpdateExpenseCommandHandler : IRequestHandler<UpdateExpenseCommand, Result<ExpenseDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateExpenseCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(UpdateExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.Id, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense", $"ID {request.Id} ile gider bulunamadı"));
        }

        if (expense.Status != ExpenseStatus.Draft)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.Status", "Sadece taslak durumundaki giderler güncellenebilir"));
        }

        // Update document info
        if (!string.IsNullOrEmpty(request.Data.DocumentNumber) || request.Data.DocumentDate.HasValue)
        {
            expense.SetDocument(request.Data.DocumentNumber, request.Data.DocumentDate);
        }

        // Update cost center
        if (request.Data.CostCenterId.HasValue)
        {
            expense.SetCostCenter(request.Data.CostCenterId.Value);
        }

        // Update project
        if (request.Data.ProjectId.HasValue)
        {
            expense.SetProject(request.Data.ProjectId.Value);
        }

        // Update exchange rate
        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            expense.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Update VAT deductible
        if (request.Data.IsVatDeductible.HasValue)
        {
            expense.SetVatDeductible(request.Data.IsVatDeductible.Value);
        }

        // Update receipt path
        if (!string.IsNullOrEmpty(request.Data.ReceiptPath))
        {
            expense.SetAttachment(request.Data.ReceiptPath);
        }

        // Update notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            expense.SetNotes(request.Data.Notes);
        }

        // Update expense account
        if (request.Data.AccountId.HasValue)
        {
            expense.SetExpenseAccount(request.Data.AccountId.Value, string.Empty);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateExpenseCommandHandler.MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete an expense
/// </summary>
public class DeleteExpenseCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteExpenseCommand
/// </summary>
public class DeleteExpenseCommandHandler : IRequestHandler<DeleteExpenseCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteExpenseCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.Id, cancellationToken);
        if (expense == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Expense", $"ID {request.Id} ile gider bulunamadı"));
        }

        if (expense.Status == ExpenseStatus.Completed || expense.IsPostedToAccounting)
        {
            return Result<bool>.Failure(
                Error.Validation("Expense.Status", "Tamamlanmış veya muhasebeye aktarılmış giderler silinemez"));
        }

        _unitOfWork.Expenses.Remove(expense);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

/// <summary>
/// Command to submit an expense for approval
/// </summary>
public class SubmitExpenseCommand : IRequest<Result<ExpenseDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SubmitExpenseCommand
/// </summary>
public class SubmitExpenseCommandHandler : IRequestHandler<SubmitExpenseCommand, Result<ExpenseDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SubmitExpenseCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(SubmitExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.Id, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense", $"ID {request.Id} ile gider bulunamadı"));
        }

        try
        {
            expense.Submit();
        }
        catch (InvalidOperationException ex)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.Submit", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateExpenseCommandHandler.MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }
}

/// <summary>
/// Command to approve an expense
/// </summary>
public class ApproveExpenseCommand : IRequest<Result<ExpenseDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public Guid ApprovedByUserId { get; set; }
    public string? Note { get; set; }
}

/// <summary>
/// Handler for ApproveExpenseCommand
/// </summary>
public class ApproveExpenseCommandHandler : IRequestHandler<ApproveExpenseCommand, Result<ExpenseDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveExpenseCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(ApproveExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.Id, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense", $"ID {request.Id} ile gider bulunamadı"));
        }

        try
        {
            // Convert Guid to int for user ID
            var userIdInt = (int)(request.ApprovedByUserId.GetHashCode() & 0x7FFFFFFF);
            expense.Approve(userIdInt, request.Note);
        }
        catch (InvalidOperationException ex)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.Approve", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateExpenseCommandHandler.MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }
}

/// <summary>
/// Command to reject an expense
/// </summary>
public class RejectExpenseCommand : IRequest<Result<ExpenseDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public Guid RejectedByUserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for RejectExpenseCommand
/// </summary>
public class RejectExpenseCommandHandler : IRequestHandler<RejectExpenseCommand, Result<ExpenseDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RejectExpenseCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(RejectExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.Id, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense", $"ID {request.Id} ile gider bulunamadı"));
        }

        try
        {
            // Convert Guid to int for user ID
            var userIdInt = (int)(request.RejectedByUserId.GetHashCode() & 0x7FFFFFFF);
            expense.Reject(userIdInt, request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.Reject", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateExpenseCommandHandler.MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }
}
