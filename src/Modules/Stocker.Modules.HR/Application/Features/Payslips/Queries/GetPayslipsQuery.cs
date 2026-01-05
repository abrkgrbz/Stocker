using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.Payslips.Queries;

public record GetPayslipsQuery() : IRequest<List<PayslipDto>>;

public class GetPayslipsQueryHandler : IRequestHandler<GetPayslipsQuery, List<PayslipDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPayslipsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PayslipDto>> Handle(GetPayslipsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.Payslips.GetAllAsync(cancellationToken);
        return entities.Select(e => new PayslipDto
        {
            Id = e.Id,
            EmployeeId = e.EmployeeId,
            PayrollId = e.PayrollId,
            PayslipNumber = e.PayslipNumber,
            Status = e.Status.ToString(),
            Period = e.Period,
            Year = e.Year,
            Month = e.Month,
            PeriodStart = e.PeriodStart,
            PeriodEnd = e.PeriodEnd,
            PaymentDate = e.PaymentDate,
            GrossSalary = e.GrossSalary,
            BaseSalary = e.BaseSalary,
            OvertimePay = e.OvertimePay,
            Bonus = e.Bonus,
            Gratuity = e.Gratuity,
            Commission = e.Commission,
            OtherEarnings = e.OtherEarnings,
            TotalEarnings = e.TotalEarnings,
            TransportationAllowance = e.TransportationAllowance,
            MealAllowance = e.MealAllowance,
            HousingAllowance = e.HousingAllowance,
            PhoneAllowance = e.PhoneAllowance,
            OtherAllowances = e.OtherAllowances,
            TotalAllowances = e.TotalAllowances,
            IncomeTax = e.IncomeTax,
            StampTax = e.StampTax,
            SsiEmployeeShare = e.SsiEmployeeShare,
            UnemploymentInsuranceEmployee = e.UnemploymentInsuranceEmployee,
            PrivatePensionDeduction = e.PrivatePensionDeduction,
            UnionDues = e.UnionDues,
            Garnishment = e.Garnishment,
            AdvanceDeduction = e.AdvanceDeduction,
            OtherDeductions = e.OtherDeductions,
            TotalDeductions = e.TotalDeductions,
            SsiEmployerShare = e.SsiEmployerShare,
            UnemploymentInsuranceEmployer = e.UnemploymentInsuranceEmployer,
            PrivatePensionEmployer = e.PrivatePensionEmployer,
            TotalEmployerCost = e.TotalEmployerCost,
            NetSalary = e.NetSalary,
            PaidAmount = e.PaidAmount,
            Currency = e.Currency,
            DaysWorked = e.DaysWorked,
            HoursWorked = e.HoursWorked,
            OvertimeHours = e.OvertimeHours,
            LeaveDays = e.LeaveDays,
            AbsenceDays = e.AbsenceDays,
            HolidayDays = e.HolidayDays,
            CumulativeGross = e.CumulativeGross,
            CumulativeIncomeTax = e.CumulativeIncomeTax,
            CumulativeSsiBase = e.CumulativeSsiBase,
            BankName = e.BankName,
            Iban = e.Iban,
            PaymentMethod = e.PaymentMethod.ToString(),
            PaymentReference = e.PaymentReference,
            PdfUrl = e.PdfUrl,
            GeneratedDate = e.GeneratedDate,
            SentDate = e.SentDate,
            ViewedDate = e.ViewedDate,
            Notes = e.Notes,
            InternalNotes = e.InternalNotes,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();
    }
}
