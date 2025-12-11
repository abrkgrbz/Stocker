using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeBenefits.Commands;

/// <summary>
/// Command to create a new employee benefit
/// </summary>
public record CreateEmployeeBenefitCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int EmployeeId { get; init; }
    public BenefitType BenefitType { get; init; }
    public string BenefitName { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public DateTime StartDate { get; init; }
    public PaymentFrequency PaymentFrequency { get; init; }
    public DateTime? EndDate { get; init; }
    public DateTime? VestingDate { get; init; }
    public int? WaitingPeriodMonths { get; init; }
    public bool IsTaxable { get; init; }
    public bool TaxIncluded { get; init; }
    public string? InsuranceProvider { get; init; }
    public string? PolicyNumber { get; init; }
    public string? CoverageLevel { get; init; }
    public bool IncludesFamily { get; init; }
    public bool SpouseCovered { get; init; }
    public bool ChildrenCovered { get; init; }
    public int? NumberOfDependents { get; init; }
    public string? VehiclePlate { get; init; }
    public string? VehicleModel { get; init; }
    public decimal? FuelAllowance { get; init; }
    public int? MileageLimit { get; init; }
    public string? PhoneNumber { get; init; }
    public decimal? MonthlyLimit { get; init; }
    public string? Operator { get; init; }
    public string? CardNumber { get; init; }
    public decimal? DailyAmount { get; init; }
    public string? CardProvider { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public string? DocumentUrl { get; init; }
}

/// <summary>
/// Handler for CreateEmployeeBenefitCommand
/// </summary>
public class CreateEmployeeBenefitCommandHandler : IRequestHandler<CreateEmployeeBenefitCommand, Result<int>>
{
    private readonly IEmployeeBenefitRepository _employeeBenefitRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEmployeeBenefitCommandHandler(
        IEmployeeBenefitRepository employeeBenefitRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeBenefitRepository = employeeBenefitRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateEmployeeBenefitCommand request, CancellationToken cancellationToken)
    {
        var employeeBenefit = new EmployeeBenefit(
            request.EmployeeId,
            request.BenefitType,
            request.BenefitName,
            request.Amount,
            request.StartDate,
            request.PaymentFrequency);

        employeeBenefit.SetTenantId(request.TenantId);

        if (request.EndDate.HasValue)
            employeeBenefit.SetEndDate(request.EndDate);

        if (request.VestingDate.HasValue)
            employeeBenefit.SetVestingDate(request.VestingDate);

        if (request.WaitingPeriodMonths.HasValue)
            employeeBenefit.SetWaitingPeriod(request.WaitingPeriodMonths);

        employeeBenefit.SetTaxable(request.IsTaxable);
        employeeBenefit.SetTaxIncluded(request.TaxIncluded);

        // Health Insurance specific
        if (request.BenefitType == BenefitType.HealthInsurance && !string.IsNullOrEmpty(request.InsuranceProvider))
        {
            employeeBenefit.SetInsuranceDetails(
                request.InsuranceProvider,
                request.PolicyNumber ?? string.Empty,
                request.CoverageLevel ?? string.Empty);

            employeeBenefit.SetFamilyCoverage(
                request.IncludesFamily,
                request.SpouseCovered,
                request.ChildrenCovered,
                request.NumberOfDependents);
        }

        // Vehicle specific
        if (request.BenefitType == BenefitType.CompanyCar && !string.IsNullOrEmpty(request.VehiclePlate))
        {
            employeeBenefit.SetVehicleDetails(
                request.VehiclePlate,
                request.VehicleModel ?? string.Empty,
                request.FuelAllowance,
                request.MileageLimit);
        }

        // Phone specific
        if (request.BenefitType == BenefitType.Phone && !string.IsNullOrEmpty(request.PhoneNumber))
        {
            employeeBenefit.SetPhoneDetails(request.PhoneNumber, request.MonthlyLimit, request.Operator);
        }

        // Meal card specific
        if (request.BenefitType == BenefitType.MealCard && !string.IsNullOrEmpty(request.CardNumber))
        {
            employeeBenefit.SetMealCardDetails(
                request.CardNumber,
                request.DailyAmount ?? 0,
                request.CardProvider ?? string.Empty);
        }

        if (!string.IsNullOrEmpty(request.Description))
            employeeBenefit.SetDescription(request.Description);

        if (!string.IsNullOrEmpty(request.Notes))
            employeeBenefit.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.DocumentUrl))
            employeeBenefit.SetDocumentUrl(request.DocumentUrl);

        await _employeeBenefitRepository.AddAsync(employeeBenefit, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(employeeBenefit.Id);
    }
}
