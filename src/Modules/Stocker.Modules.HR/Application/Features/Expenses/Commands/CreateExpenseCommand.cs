using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Commands;

/// <summary>
/// Command to create a new expense
/// </summary>
public class CreateExpenseCommand : IRequest<Result<ExpenseDto>>
{
    public Guid TenantId { get; set; }
    public CreateExpenseDto ExpenseData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateExpenseCommand
/// </summary>
public class CreateExpenseCommandValidator : AbstractValidator<CreateExpenseCommand>
{
    public CreateExpenseCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ExpenseData)
            .NotNull().WithMessage("Expense data is required");

        When(x => x.ExpenseData != null, () =>
        {
            RuleFor(x => x.ExpenseData.EmployeeId)
                .GreaterThan(0).WithMessage("Valid employee ID is required");

            RuleFor(x => x.ExpenseData.ExpenseType)
                .IsInEnum().WithMessage("Invalid expense type");

            RuleFor(x => x.ExpenseData.Description)
                .NotEmpty().WithMessage("Description is required")
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.ExpenseData.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than 0");

            RuleFor(x => x.ExpenseData.Currency)
                .NotEmpty().WithMessage("Currency is required")
                .MaximumLength(3).WithMessage("Currency must be a valid 3-letter code");

            RuleFor(x => x.ExpenseData.ExpenseDate)
                .NotEmpty().WithMessage("Expense date is required")
                .LessThanOrEqualTo(DateTime.UtcNow.Date.AddDays(1)).WithMessage("Expense date cannot be in the future");
        });
    }
}

/// <summary>
/// Handler for CreateExpenseCommand
/// </summary>
public class CreateExpenseCommandHandler : IRequestHandler<CreateExpenseCommand, Result<ExpenseDto>>
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateExpenseCommandHandler(
        IExpenseRepository expenseRepository,
        IUnitOfWork unitOfWork)
    {
        _expenseRepository = expenseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        var data = request.ExpenseData;

        // Generate expense number
        var expenseNumber = $"EXP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var expense = new Expense(
            data.EmployeeId,
            expenseNumber,
            data.ExpenseType,
            data.Description,
            data.Amount,
            data.ExpenseDate,
            data.Currency);

        if (!string.IsNullOrEmpty(data.MerchantName) || !string.IsNullOrEmpty(data.ReceiptNumber))
        {
            expense.Update(data.ExpenseType, data.Description, data.Amount, data.ExpenseDate,
                data.MerchantName, data.ReceiptNumber);
        }

        if (!string.IsNullOrEmpty(data.Notes))
        {
            expense.SetNotes(data.Notes);
        }

        expense.SetTenantId(request.TenantId);

        await _expenseRepository.AddAsync(expense, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }

    private static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            EmployeeId = expense.EmployeeId,
            ExpenseNumber = expense.ExpenseNumber,
            ExpenseType = expense.ExpenseType,
            Description = expense.Description,
            Amount = expense.Amount,
            Currency = expense.Currency,
            ExpenseDate = expense.ExpenseDate,
            MerchantName = expense.MerchantName,
            ReceiptNumber = expense.ReceiptNumber,
            ReceiptUrl = expense.ReceiptUrl,
            Status = expense.Status,
            ApprovedById = expense.ApprovedById,
            ApprovedDate = expense.ApprovedDate,
            ApprovalNotes = expense.ApprovalNotes,
            RejectionReason = expense.RejectionReason,
            PaidDate = expense.PaidDate,
            PaymentReference = expense.PaymentReference,
            PayrollId = expense.PayrollId,
            Notes = expense.Notes,
            CreatedAt = expense.CreatedDate
        };
    }
}
