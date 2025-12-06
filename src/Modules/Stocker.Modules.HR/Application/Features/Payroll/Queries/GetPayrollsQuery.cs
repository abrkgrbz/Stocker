using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Queries;

/// <summary>
/// Query to get payrolls with optional filtering
/// </summary>
public class GetPayrollsQuery : IRequest<Result<List<PayrollDto>>>
{
    public Guid TenantId { get; set; }
    public int? EmployeeId { get; set; }
    public int? Year { get; set; }
    public int? Month { get; set; }
    public PayrollStatus? Status { get; set; }
    public int? DepartmentId { get; set; }
}

/// <summary>
/// Handler for GetPayrollsQuery
/// </summary>
public class GetPayrollsQueryHandler : IRequestHandler<GetPayrollsQuery, Result<List<PayrollDto>>>
{
    private readonly IPayrollRepository _payrollRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetPayrollsQueryHandler(
        IPayrollRepository payrollRepository,
        IEmployeeRepository employeeRepository)
    {
        _payrollRepository = payrollRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<List<PayrollDto>>> Handle(GetPayrollsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Domain.Entities.Payroll> payrolls;

        if (request.EmployeeId.HasValue)
        {
            payrolls = await _payrollRepository.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.Year.HasValue && request.Month.HasValue)
        {
            payrolls = await _payrollRepository.GetByPeriodAsync(request.Year.Value, request.Month.Value, cancellationToken);
        }
        else
        {
            payrolls = await _payrollRepository.GetAllAsync(cancellationToken);
        }

        var filtered = payrolls.AsEnumerable();

        if (request.Year.HasValue && !request.Month.HasValue)
        {
            filtered = filtered.Where(p => p.Year == request.Year.Value);
        }

        if (request.Status.HasValue)
        {
            filtered = filtered.Where(p => p.Status == request.Status.Value);
        }

        // Get all employees for mapping
        var employees = await _employeeRepository.GetAllAsync(cancellationToken);
        var employeeDict = employees.ToDictionary(e => e.Id);

        var dtos = filtered.Select(p =>
        {
            employeeDict.TryGetValue(p.EmployeeId, out var employee);
            return new PayrollDto
            {
                Id = p.Id,
                EmployeeId = p.EmployeeId,
                EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
                EmployeeCode = employee?.EmployeeCode,
                DepartmentName = employee?.Department?.Name,
                PayrollNumber = $"PAY-{p.Year:D4}{p.Month:D2}-{p.Id}",
                Year = p.Year,
                Month = p.Month,
                PeriodStartDate = p.PeriodStart,
                PeriodEndDate = p.PeriodEnd,
                BaseSalary = p.BaseSalary,
                TotalEarnings = p.GrossEarnings,
                TotalDeductions = p.TotalDeductions,
                TotalEmployerCost = p.TotalEmployerCost,
                NetSalary = p.NetSalary,
                GrossSalary = p.GrossEarnings,
                Currency = p.Currency,
                Status = p.Status,
                CalculatedDate = p.CalculatedDate,
                CalculatedById = p.CalculatedById,
                ApprovedDate = p.ApprovedDate,
                ApprovedById = p.ApprovedById,
                PaidDate = p.PaidDate,
                PaymentReference = p.PaymentReference,
                Notes = p.Notes,
                CreatedAt = p.CreatedDate
            };
        }).OrderByDescending(p => p.Year)
          .ThenByDescending(p => p.Month)
          .ThenBy(p => p.EmployeeName)
          .ToList();

        return Result<List<PayrollDto>>.Success(dtos);
    }
}
