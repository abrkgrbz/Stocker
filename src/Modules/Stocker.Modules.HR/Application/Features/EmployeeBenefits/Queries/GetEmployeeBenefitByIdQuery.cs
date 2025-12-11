using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.EmployeeBenefits.Queries;

public record GetEmployeeBenefitByIdQuery(int Id) : IRequest<EmployeeBenefitDto?>;

public class GetEmployeeBenefitByIdQueryHandler : IRequestHandler<GetEmployeeBenefitByIdQuery, EmployeeBenefitDto?>
{
    private readonly IEmployeeBenefitRepository _repository;

    public GetEmployeeBenefitByIdQueryHandler(IEmployeeBenefitRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<EmployeeBenefitDto?> Handle(GetEmployeeBenefitByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new EmployeeBenefitDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = entity.Employee?.FullName ?? string.Empty,
            BenefitType = entity.BenefitType.ToString(),
            BenefitName = entity.BenefitName,
            Status = entity.Status.ToString(),

            // Value Information
            Amount = entity.Amount,
            Currency = entity.Currency,
            PaymentFrequency = entity.PaymentFrequency.ToString(),
            AnnualValue = entity.AnnualValue,
            TaxIncluded = entity.TaxIncluded,
            IsTaxable = entity.IsTaxable,

            // Period Information
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            RenewalDate = entity.RenewalDate,
            VestingDate = entity.VestingDate,
            WaitingPeriodMonths = entity.WaitingPeriodMonths,

            // Health Insurance
            InsuranceProvider = entity.InsuranceProvider,
            PolicyNumber = entity.PolicyNumber,
            CoverageLevel = entity.CoverageLevel,
            IncludesFamily = entity.IncludesFamily,
            SpouseCovered = entity.SpouseCovered,
            ChildrenCovered = entity.ChildrenCovered,
            NumberOfDependents = entity.NumberOfDependents,

            // Vehicle
            VehiclePlate = entity.VehiclePlate,
            VehicleModel = entity.VehicleModel,
            FuelAllowance = entity.FuelAllowance,
            MileageLimit = entity.MileageLimit,

            // Phone/Internet
            PhoneNumber = entity.PhoneNumber,
            MonthlyLimit = entity.MonthlyLimit,
            Operator = entity.Operator,

            // Meal Card
            CardNumber = entity.CardNumber,
            DailyAmount = entity.DailyAmount,
            CardProvider = entity.CardProvider,

            // Usage Information
            UsedAmount = entity.UsedAmount,
            RemainingAmount = entity.RemainingAmount,
            LastUsageDate = entity.LastUsageDate,

            // Additional Information
            Description = entity.Description,
            Notes = entity.Notes,
            DocumentUrl = entity.DocumentUrl,
            ApprovedById = entity.ApprovedById,
            ApprovedByName = entity.ApprovedBy?.FullName,
            ApprovalDate = entity.ApprovalDate,

            IsActive = !entity.IsDeleted,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };
    }
}
