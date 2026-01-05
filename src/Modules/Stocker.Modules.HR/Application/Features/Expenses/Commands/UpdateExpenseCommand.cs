using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Commands;

/// <summary>
/// Command to update an existing expense
/// </summary>
public record UpdateExpenseCommand : IRequest<Result<ExpenseDto>>
{
    public int ExpenseId { get; init; }
    public UpdateExpenseDto ExpenseData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateExpenseCommand
/// </summary>
public class UpdateExpenseCommandValidator : AbstractValidator<UpdateExpenseCommand>
{
    public UpdateExpenseCommandValidator()
    {
        RuleFor(x => x.ExpenseId)
            .GreaterThan(0).WithMessage("Valid expense ID is required");

        RuleFor(x => x.ExpenseData)
            .NotNull().WithMessage("Expense data is required");

        When(x => x.ExpenseData != null, () =>
        {
            RuleFor(x => x.ExpenseData.ExpenseType)
                .IsInEnum().WithMessage("Invalid expense type");

            RuleFor(x => x.ExpenseData.Description)
                .NotEmpty().WithMessage("Description is required")
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.ExpenseData.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than 0");
        });
    }
}

/// <summary>
/// Handler for UpdateExpenseCommand
/// </summary>
public class UpdateExpenseCommandHandler : IRequestHandler<UpdateExpenseCommand, Result<ExpenseDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateExpenseCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(UpdateExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense.NotFound", $"Expense with ID {request.ExpenseId} not found"));
        }

        // Only allow updates if expense is in Draft status
        if (expense.Status != ExpenseStatus.Draft)
        {
            return Result<ExpenseDto>.Failure(
                Error.Validation("Expense.CannotUpdate", "Only draft expenses can be updated"));
        }

        var data = request.ExpenseData;

        expense.Update(
            data.ExpenseType,
            data.Description,
            data.Amount,
            data.ExpenseDate,
            data.MerchantName,
            data.ReceiptNumber);

        if (data.Notes != null)
        {
            expense.SetNotes(data.Notes);
        }

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
