using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Queries;

/// <summary>
/// Query to get an expense by ID
/// </summary>
public record GetExpenseByIdQuery(int ExpenseId) : IRequest<Result<ExpenseDto>>;

/// <summary>
/// Validator for GetExpenseByIdQuery
/// </summary>
public class GetExpenseByIdQueryValidator : AbstractValidator<GetExpenseByIdQuery>
{
    public GetExpenseByIdQueryValidator()
    {
        RuleFor(x => x.ExpenseId)
            .GreaterThan(0).WithMessage("Expense ID is required");
    }
}

/// <summary>
/// Handler for GetExpenseByIdQuery
/// </summary>
public class GetExpenseByIdQueryHandler : IRequestHandler<GetExpenseByIdQuery, Result<ExpenseDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetExpenseByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(GetExpenseByIdQuery request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense.NotFound", $"Expense with ID {request.ExpenseId} not found"));
        }

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
