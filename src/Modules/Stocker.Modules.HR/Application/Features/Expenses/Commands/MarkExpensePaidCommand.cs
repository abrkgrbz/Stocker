using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Commands;

/// <summary>
/// Command to mark an expense as paid
/// </summary>
public record MarkExpensePaidCommand : IRequest<Result<ExpenseDto>>
{
    public int ExpenseId { get; init; }
    public string? PaymentReference { get; init; }
}

/// <summary>
/// Validator for MarkExpensePaidCommand
/// </summary>
public class MarkExpensePaidCommandValidator : AbstractValidator<MarkExpensePaidCommand>
{
    public MarkExpensePaidCommandValidator()
    {
        RuleFor(x => x.ExpenseId)
            .GreaterThan(0).WithMessage("Valid expense ID is required");

        RuleFor(x => x.PaymentReference)
            .MaximumLength(100).WithMessage("Payment reference must not exceed 100 characters");
    }
}

/// <summary>
/// Handler for MarkExpensePaidCommand
/// </summary>
public class MarkExpensePaidCommandHandler : IRequestHandler<MarkExpensePaidCommand, Result<ExpenseDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public MarkExpensePaidCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(MarkExpensePaidCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense.NotFound", $"Expense with ID {request.ExpenseId} not found"));
        }

        if (expense.Status != ExpenseStatus.Approved)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.InvalidStatus", "Only approved expenses can be marked as paid"));
        }

        expense.MarkAsPaid(request.PaymentReference);
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
