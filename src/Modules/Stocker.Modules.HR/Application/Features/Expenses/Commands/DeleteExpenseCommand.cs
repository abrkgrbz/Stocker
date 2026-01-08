using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Commands;

/// <summary>
/// Command to delete an expense
/// </summary>
public record DeleteExpenseCommand(int ExpenseId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteExpenseCommand
/// </summary>
public class DeleteExpenseCommandValidator : AbstractValidator<DeleteExpenseCommand>
{
    public DeleteExpenseCommandValidator()
    {
        RuleFor(x => x.ExpenseId)
            .GreaterThan(0).WithMessage("Expense ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteExpenseCommand
/// </summary>
public class DeleteExpenseCommandHandler : IRequestHandler<DeleteExpenseCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteExpenseCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Expense", $"Expense with ID {request.ExpenseId} not found"));
        }

        // Only allow deletion of draft or cancelled expenses
        if (expense.Status != ExpenseStatus.Draft && expense.Status != ExpenseStatus.Cancelled)
        {
            return Result<bool>.Failure(
                Error.Validation("Expense.CannotDelete", "Only draft or cancelled expenses can be deleted"));
        }

        _unitOfWork.Expenses.Remove(expense);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
