using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Queries;

/// <summary>
/// Query to get payroll summary for a period
/// </summary>
public class GetPayrollSummaryQuery : IRequest<Result<PayrollSummaryDto>>
{
    public Guid TenantId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
}

/// <summary>
/// Handler for GetPayrollSummaryQuery
/// </summary>
public class GetPayrollSummaryQueryHandler : IRequestHandler<GetPayrollSummaryQuery, Result<PayrollSummaryDto>>
{
    private readonly IPayrollRepository _payrollRepository;

    public GetPayrollSummaryQueryHandler(IPayrollRepository payrollRepository)
    {
        _payrollRepository = payrollRepository;
    }

    public async Task<Result<PayrollSummaryDto>> Handle(GetPayrollSummaryQuery request, CancellationToken cancellationToken)
    {
        var payrolls = await _payrollRepository.GetByPeriodAsync(request.Year, request.Month, cancellationToken);
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
