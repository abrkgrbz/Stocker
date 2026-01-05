using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Queries;

/// <summary>
/// Query to get payroll summary for a period
/// </summary>
public record GetPayrollSummaryQuery(int Year, int Month) : IRequest<Result<PayrollSummaryDto>>;

/// <summary>
/// Validator for GetPayrollSummaryQuery
/// </summary>
public class GetPayrollSummaryQueryValidator : AbstractValidator<GetPayrollSummaryQuery>
{
    public GetPayrollSummaryQueryValidator()
    {
        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100).WithMessage("Year must be between 2000 and 2100");

        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12).WithMessage("Month must be between 1 and 12");
    }
}

/// <summary>
/// Handler for GetPayrollSummaryQuery
/// </summary>
public class GetPayrollSummaryQueryHandler : IRequestHandler<GetPayrollSummaryQuery, Result<PayrollSummaryDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPayrollSummaryQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PayrollSummaryDto>> Handle(GetPayrollSummaryQuery request, CancellationToken cancellationToken)
    {
        var payrolls = await _unitOfWork.Payrolls.GetByPeriodAsync(request.Year, request.Month, cancellationToken);
        var payrollList = payrolls.ToList();

        var summary = new PayrollSummaryDto
        {
            Year = request.Year,
            Month = request.Month,
            TotalEmployees = payrollList.Count,
            DraftCount = payrollList.Count(p => p.Status == PayrollStatus.Draft),
            CalculatedCount = payrollList.Count(p => p.Status == PayrollStatus.Calculated),
            PendingApprovalCount = payrollList.Count(p => p.Status == PayrollStatus.PendingApproval),
            ApprovedCount = payrollList.Count(p => p.Status == PayrollStatus.Approved),
            PaidCount = payrollList.Count(p => p.Status == PayrollStatus.Paid),
            TotalBaseSalary = payrollList.Sum(p => p.BaseSalary),
            TotalEarnings = payrollList.Sum(p => p.GrossEarnings),
            TotalDeductions = payrollList.Sum(p => p.TotalDeductions),
            TotalEmployerCost = payrollList.Sum(p => p.TotalEmployerCost),
            TotalNetSalary = payrollList.Sum(p => p.NetSalary),
            TotalGrossSalary = payrollList.Sum(p => p.GrossEarnings),
            Currency = payrollList.FirstOrDefault()?.Currency ?? "TRY"
        };

        return Result<PayrollSummaryDto>.Success(summary);
    }
}
