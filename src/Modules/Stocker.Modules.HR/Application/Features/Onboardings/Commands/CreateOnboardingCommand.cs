using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to create a new onboarding
/// </summary>
public record CreateOnboardingCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int EmployeeId { get; init; }
    public DateTime FirstDayOfWork { get; init; }
    public int? TemplateId { get; init; }
    public DateTime? PlannedEndDate { get; init; }
    public int? BuddyId { get; init; }
    public int? HrResponsibleId { get; init; }
    public int? ItResponsibleId { get; init; }
}

/// <summary>
/// Handler for CreateOnboardingCommand
/// </summary>
public class CreateOnboardingCommandHandler : IRequestHandler<CreateOnboardingCommand, Result<int>>
{
    private readonly IOnboardingRepository _onboardingRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOnboardingCommandHandler(
        IOnboardingRepository onboardingRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _onboardingRepository = onboardingRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateOnboardingCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Check if employee already has an active onboarding
        var existingOnboardings = await _onboardingRepository.GetByEmployeeAsync(request.EmployeeId, cancellationToken);
        var activeOnboarding = existingOnboardings.FirstOrDefault(o =>
            o.Status != OnboardingStatus.Completed && o.Status != OnboardingStatus.Cancelled);
        if (activeOnboarding != null)
        {
            return Result<int>.Failure(
                Error.Conflict("Onboarding", "Employee already has an active onboarding"));
        }

        // Verify buddy exists if specified
        if (request.BuddyId.HasValue)
        {
            var buddy = await _employeeRepository.GetByIdAsync(request.BuddyId.Value, cancellationToken);
            if (buddy == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Buddy with ID {request.BuddyId} not found"));
            }
        }

        // Create the onboarding
        var onboarding = new Onboarding(
            request.EmployeeId,
            request.FirstDayOfWork,
            request.TemplateId);

        // Set tenant ID
        onboarding.SetTenantId(request.TenantId);

        // Set optional properties
        if (request.PlannedEndDate.HasValue)
            onboarding.SetPlannedEndDate(request.PlannedEndDate.Value);

        if (request.BuddyId.HasValue)
            onboarding.SetBuddy(request.BuddyId);

        if (request.HrResponsibleId.HasValue)
            onboarding.SetHrResponsible(request.HrResponsibleId);

        if (request.ItResponsibleId.HasValue)
            onboarding.SetItResponsible(request.ItResponsibleId);

        // Save to repository
        await _onboardingRepository.AddAsync(onboarding, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(onboarding.Id);
    }
}
