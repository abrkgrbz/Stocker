using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Queries;

/// <summary>
/// Query to get cumulative gross earnings for an employee up to a specific period
/// </summary>
public record GetEmployeeCumulativeGrossQuery(int EmployeeId, int Year, int Month) : IRequest<Result<decimal>>;

/// <summary>
/// Validator for GetEmployeeCumulativeGrossQuery
/// </summary>
public class GetEmployeeCumulativeGrossQueryValidator : AbstractValidator<GetEmployeeCumulativeGrossQuery>
{
    public GetEmployeeCumulativeGrossQueryValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Valid employee ID is required");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100).WithMessage("Year must be between 2000 and 2100");

        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12).WithMessage("Month must be between 1 and 12");
    }
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
            .Where(p => p.EmployeeId == request.EmployeeId &&
                        p.Year == request.Year &&
                        p.Month < request.Month)
            .SumAsync(p => p.BaseSalary + p.OvertimePay + p.Bonus + p.Allowances + p.OtherEarnings,
                cancellationToken);

        return Result.Success(cumulativeGross);
    }
}
