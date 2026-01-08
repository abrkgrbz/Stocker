using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Commands;

/// <summary>
/// Command to cancel an expense
/// </summary>
public record CancelExpenseCommand(int ExpenseId) : IRequest<Result<ExpenseDto>>;

/// <summary>
/// Validator for CancelExpenseCommand
/// </summary>
public class CancelExpenseCommandValidator : AbstractValidator<CancelExpenseCommand>
{
    public CancelExpenseCommandValidator()
    {
        RuleFor(x => x.ExpenseId)
            .GreaterThan(0).WithMessage("Expense ID must be greater than 0");
    }
}

/// <summary>
/// Handler for CancelExpenseCommand
/// </summary>
public class CancelExpenseCommandHandler : IRequestHandler<CancelExpenseCommand, Result<ExpenseDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CancelExpenseCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(CancelExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense", $"Expense with ID {request.ExpenseId} not found"));
        }

        try
        {
            expense.Cancel();
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
        catch (InvalidOperationException ex)
        {
            return Result<ExpenseDto>.Failure(Error.Validation("Expense.Cancel", ex.Message));
        }
    }
}
