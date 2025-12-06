using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Commands;

/// <summary>
/// Command to approve an expense
/// </summary>
public class ApproveExpenseCommand : IRequest<Result<ExpenseDto>>
{
    public Guid TenantId { get; set; }
    public int ExpenseId { get; set; }
    public int ApprovedById { get; set; }
    public ApproveExpenseDto ApprovalData { get; set; } = null!;
}

/// <summary>
/// Validator for ApproveExpenseCommand
/// </summary>
public class ApproveExpenseCommandValidator : AbstractValidator<ApproveExpenseCommand>
{
    public ApproveExpenseCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ExpenseId)
            .GreaterThan(0).WithMessage("Valid expense ID is required");

        RuleFor(x => x.ApprovedById)
            .GreaterThan(0).WithMessage("Valid approver ID is required");

        RuleFor(x => x.ApprovalData)
            .NotNull().WithMessage("Approval data is required");

        When(x => x.ApprovalData != null, () =>
        {
            RuleFor(x => x.ApprovalData.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for ApproveExpenseCommand
/// </summary>
public class ApproveExpenseCommandHandler : IRequestHandler<ApproveExpenseCommand, Result<ExpenseDto>>
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveExpenseCommandHandler(
        IExpenseRepository expenseRepository,
        IUnitOfWork unitOfWork)
    {
        _expenseRepository = expenseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(ApproveExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _expenseRepository.GetByIdAsync(request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense.NotFound", $"Expense with ID {request.ExpenseId} not found"));
        }

        if (expense.Status != ExpenseStatus.Pending)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.InvalidStatus", "Only pending expenses can be approved"));
        }

        expense.Approve(request.ApprovedById, request.ApprovalData?.Notes);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ExpenseDto
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

        return Result<ExpenseDto>.Success(dto);
    }
}
