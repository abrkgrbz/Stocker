using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.Payslips.Queries;

public record GetPayslipByIdQuery(int Id) : IRequest<PayslipDto?>;

public class GetPayslipByIdQueryHandler : IRequestHandler<GetPayslipByIdQuery, PayslipDto?>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPayslipByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PayslipDto?> Handle(GetPayslipByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.Payslips.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new PayslipDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            PayrollId = entity.PayrollId,
            PayslipNumber = entity.PayslipNumber,
            Status = entity.Status.ToString(),
            Period = entity.Period,
            Year = entity.Year,
            Month = entity.Month,
            PeriodStart = entity.PeriodStart,
            PeriodEnd = entity.PeriodEnd,
            PaymentDate = entity.PaymentDate,
            GrossSalary = entity.GrossSalary,
            BaseSalary = entity.BaseSalary,
            OvertimePay = entity.OvertimePay,
            Bonus = entity.Bonus,
            Gratuity = entity.Gratuity,
            Commission = entity.Commission,
            OtherEarnings = entity.OtherEarnings,
            TotalEarnings = entity.TotalEarnings,
            TransportationAllowance = entity.TransportationAllowance,
            MealAllowance = entity.MealAllowance,
            HousingAllowance = entity.HousingAllowance,
            PhoneAllowance = entity.PhoneAllowance,
            OtherAllowances = entity.OtherAllowances,
            TotalAllowances = entity.TotalAllowances,
            IncomeTax = entity.IncomeTax,
            StampTax = entity.StampTax,
            SsiEmployeeShare = entity.SsiEmployeeShare,
            UnemploymentInsuranceEmployee = entity.UnemploymentInsuranceEmployee,
            PrivatePensionDeduction = entity.PrivatePensionDeduction,
            UnionDues = entity.UnionDues,
            Garnishment = entity.Garnishment,
            AdvanceDeduction = entity.AdvanceDeduction,
            OtherDeductions = entity.OtherDeductions,
            TotalDeductions = entity.TotalDeductions,
            SsiEmployerShare = entity.SsiEmployerShare,
            UnemploymentInsuranceEmployer = entity.UnemploymentInsuranceEmployer,
            PrivatePensionEmployer = entity.PrivatePensionEmployer,
            TotalEmployerCost = entity.TotalEmployerCost,
            NetSalary = entity.NetSalary,
            PaidAmount = entity.PaidAmount,
            Currency = entity.Currency,
            DaysWorked = entity.DaysWorked,
            HoursWorked = entity.HoursWorked,
            OvertimeHours = entity.OvertimeHours,
            LeaveDays = entity.LeaveDays,
            AbsenceDays = entity.AbsenceDays,
            HolidayDays = entity.HolidayDays,
            CumulativeGross = entity.CumulativeGross,
            CumulativeIncomeTax = entity.CumulativeIncomeTax,
            CumulativeSsiBase = entity.CumulativeSsiBase,
            BankName = entity.BankName,
            Iban = entity.Iban,
            PaymentMethod = entity.PaymentMethod.ToString(),
            PaymentReference = entity.PaymentReference,
            PdfUrl = entity.PdfUrl,
            GeneratedDate = entity.GeneratedDate,
            SentDate = entity.SentDate,
            ViewedDate = entity.ViewedDate,
            Notes = entity.Notes,
            InternalNotes = entity.InternalNotes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };
    }
}
