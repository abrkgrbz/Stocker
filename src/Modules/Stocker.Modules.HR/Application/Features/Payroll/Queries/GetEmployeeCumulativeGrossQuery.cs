using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Queries;

/// <summary>
/// Query to get cumulative gross earnings for an employee up to a specific period
/// </summary>
public class GetEmployeeCumulativeGrossQuery : IRequest<Result<decimal>>
{
    public Guid TenantId { get; set; }
    public int EmployeeId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
}

public class GetEmployeeCumulativeGrossQueryHandler : IRequestHandler<GetEmployeeCumulativeGrossQuery, Result<decimal>>
{
    private readonly HRDbContext _context;

    public GetEmployeeCumulativeGrossQueryHandler(HRDbContext context)
    {
        _context = context;
    }

    public async Task<Result<decimal>> Handle(GetEmployeeCumulativeGrossQuery request, CancellationToken cancellationToken)
    {
        // Get all payrolls for this employee in the same year, before the specified month
        var cumulativeGross = await _context.Payrolls
            .Where(p => p.TenantId == request.TenantId &&
                        p.EmployeeId == request.EmployeeId &&
                        p.Year == request.Year &&
                        p.Month < request.Month)
            .SumAsync(p => p.BaseSalary + p.OvertimePay + p.Bonus + p.Allowances + p.OtherEarnings,
                cancellationToken);

        return Result.Success(cumulativeGross);
    }
}
