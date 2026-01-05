using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.EmployeeBenefits.Queries;

public record GetEmployeeBenefitsQuery() : IRequest<List<EmployeeBenefitDto>>;

public class GetEmployeeBenefitsQueryHandler : IRequestHandler<GetEmployeeBenefitsQuery, List<EmployeeBenefitDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeBenefitsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<EmployeeBenefitDto>> Handle(GetEmployeeBenefitsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.EmployeeBenefits.GetAllAsync(cancellationToken);
        return entities.Select(entity => new EmployeeBenefitDto
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
        }).ToList();
    }
}
