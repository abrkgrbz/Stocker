using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Expenses.Queries;

/// <summary>
/// Query to get expenses with optional filtering
/// </summary>
public class GetExpensesQuery : IRequest<Result<List<ExpenseDto>>>
{
    public Guid TenantId { get; set; }
    public int? EmployeeId { get; set; }
    public ExpenseType? ExpenseType { get; set; }
    public ExpenseStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetExpensesQuery
/// </summary>
public class GetExpensesQueryHandler : IRequestHandler<GetExpensesQuery, Result<List<ExpenseDto>>>
{
    private readonly IExpenseRepository _expenseRepository;

    public GetExpensesQueryHandler(IExpenseRepository expenseRepository)
    {
        _expenseRepository = expenseRepository;
    }

    public async Task<Result<List<ExpenseDto>>> Handle(GetExpensesQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Domain.Entities.Expense> expenses;

        if (request.EmployeeId.HasValue)
        {
            expenses = await _expenseRepository.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else
        {
            expenses = await _expenseRepository.GetAllAsync(cancellationToken);
        }

        var filtered = expenses.AsEnumerable();

        if (request.ExpenseType.HasValue)
        {
            filtered = filtered.Where(e => e.ExpenseType == request.ExpenseType.Value);
        }

        if (request.Status.HasValue)
        {
            filtered = filtered.Where(e => e.Status == request.Status.Value);
        }

        if (request.FromDate.HasValue)
        {
            filtered = filtered.Where(e => e.ExpenseDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            filtered = filtered.Where(e => e.ExpenseDate <= request.ToDate.Value);
        }

        var dtos = filtered.Select(e => new ExpenseDto
        {
            Id = e.Id,
            EmployeeId = e.EmployeeId,
            ExpenseNumber = e.ExpenseNumber,
            ExpenseType = e.ExpenseType,
            Description = e.Description,
            Amount = e.Amount,
            Currency = e.Currency,
            ExpenseDate = e.ExpenseDate,
            MerchantName = e.MerchantName,
            ReceiptNumber = e.ReceiptNumber,
            ReceiptUrl = e.ReceiptUrl,
            Status = e.Status,
            ApprovedById = e.ApprovedById,
            ApprovedDate = e.ApprovedDate,
            ApprovalNotes = e.ApprovalNotes,
            RejectionReason = e.RejectionReason,
            PaidDate = e.PaidDate,
            PaymentReference = e.PaymentReference,
            PayrollId = e.PayrollId,
            Notes = e.Notes,
            CreatedAt = e.CreatedDate
        }).OrderByDescending(e => e.ExpenseDate).ToList();

        return Result<List<ExpenseDto>>.Success(dtos);
    }
}
