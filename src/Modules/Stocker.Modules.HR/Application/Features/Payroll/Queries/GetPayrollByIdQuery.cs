using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Queries;

/// <summary>
/// Query to get a payroll by ID with items
/// </summary>
public record GetPayrollByIdQuery(int PayrollId) : IRequest<Result<PayrollDto>>;

/// <summary>
/// Validator for GetPayrollByIdQuery
/// </summary>
public class GetPayrollByIdQueryValidator : AbstractValidator<GetPayrollByIdQuery>
{
    public GetPayrollByIdQueryValidator()
    {
        RuleFor(x => x.PayrollId)
            .GreaterThan(0).WithMessage("Payroll ID is required");
    }
}

/// <summary>
/// Handler for GetPayrollByIdQuery
/// </summary>
public class GetPayrollByIdQueryHandler : IRequestHandler<GetPayrollByIdQuery, Result<PayrollDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPayrollByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PayrollDto>> Handle(GetPayrollByIdQuery request, CancellationToken cancellationToken)
    {
        var payroll = await _unitOfWork.Payrolls.GetWithItemsAsync(request.PayrollId, cancellationToken);
        if (payroll == null)
        {
            return Result<PayrollDto>.Failure(
                Error.NotFound("Payroll.NotFound", $"Payroll with ID {request.PayrollId} not found"));
        }

        var employee = await _unitOfWork.Employees.GetByIdAsync(payroll.EmployeeId, cancellationToken);

        var dto = new PayrollDto
        {
            Id = payroll.Id,
            EmployeeId = payroll.EmployeeId,
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            EmployeeCode = employee?.EmployeeCode,
            DepartmentName = employee?.Department?.Name,
            PayrollNumber = $"PAY-{payroll.Year:D4}{payroll.Month:D2}-{payroll.Id}",
            Year = payroll.Year,
            Month = payroll.Month,
            PeriodStartDate = payroll.PeriodStart,
            PeriodEndDate = payroll.PeriodEnd,
            BaseSalary = payroll.BaseSalary,
            TotalEarnings = payroll.GrossEarnings,
            TotalDeductions = payroll.TotalDeductions,
            TotalEmployerCost = payroll.TotalEmployerCost,
            NetSalary = payroll.NetSalary,
            GrossSalary = payroll.GrossEarnings,
            Currency = payroll.Currency,
            Status = payroll.Status,
            CalculatedDate = payroll.CalculatedDate,
            CalculatedById = payroll.CalculatedById,
            ApprovedDate = payroll.ApprovedDate,
            ApprovedById = payroll.ApprovedById,
            PaidDate = payroll.PaidDate,
            PaymentReference = payroll.PaymentReference,
            Notes = payroll.Notes,
            CreatedAt = payroll.CreatedDate,
            Items = payroll.Items.Select(i => new PayrollItemDto
            {
                Id = i.Id,
                PayrollId = i.PayrollId,
                ItemType = i.ItemType.ToString(),
                ItemCode = i.Code,
                Description = i.Description,
                Amount = i.Amount,
                IsDeduction = i.ItemType == Domain.Entities.PayrollItemType.Deduction,
                IsEmployerContribution = i.ItemType == Domain.Entities.PayrollItemType.EmployerContribution,
                IsTaxable = i.IsTaxable,
                Quantity = i.Quantity,
                Rate = i.Rate
            }).ToList()
        };

        return Result<PayrollDto>.Success(dto);
    }
}
