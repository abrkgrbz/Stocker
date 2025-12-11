using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to create a new grievance
/// </summary>
public record CreateGrievanceCommand(
    Guid TenantId,
    int ComplainantId,
    string GrievanceCode,
    string Subject,
    string Description,
    GrievanceType GrievanceType,
    GrievancePriority Priority = GrievancePriority.Medium,
    DateTime? IncidentDate = null,
    string? IncidentLocation = null,
    int? AccusedPersonId = null,
    bool IsAnonymous = false,
    bool IsConfidential = false,
    bool RetaliationProtectionRequested = false) : IRequest<Result<int>>;

/// <summary>
/// Validator for CreateGrievanceCommand
/// </summary>
public class CreateGrievanceCommandValidator : AbstractValidator<CreateGrievanceCommand>
{
    public CreateGrievanceCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ComplainantId)
            .GreaterThan(0).WithMessage("Complainant ID must be greater than 0");

        RuleFor(x => x.GrievanceCode)
            .NotEmpty().WithMessage("Grievance code is required")
            .MaximumLength(50).WithMessage("Grievance code must not exceed 50 characters");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required")
            .MaximumLength(200).WithMessage("Subject must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");
    }
}

/// <summary>
/// Handler for CreateGrievanceCommand
/// </summary>
public class CreateGrievanceCommandHandler : IRequestHandler<CreateGrievanceCommand, Result<int>>
{
    private readonly IGrievanceRepository _grievanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateGrievanceCommandHandler(
        IGrievanceRepository grievanceRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _grievanceRepository = grievanceRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateGrievanceCommand request, CancellationToken cancellationToken)
    {
        // Verify complainant exists
        var complainant = await _employeeRepository.GetByIdAsync(request.ComplainantId, cancellationToken);
        if (complainant == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Complainant with ID {request.ComplainantId} not found"));
        }

        // Check if grievance code already exists
        var existingGrievance = await _grievanceRepository.GetByCodeAsync(request.GrievanceCode, cancellationToken);
        if (existingGrievance != null)
        {
            return Result<int>.Failure(
                Error.Conflict("Grievance.Code", "A grievance with this code already exists"));
        }

        // Verify accused person if specified
        if (request.AccusedPersonId.HasValue)
        {
            var accusedPerson = await _employeeRepository.GetByIdAsync(request.AccusedPersonId.Value, cancellationToken);
            if (accusedPerson == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Accused person with ID {request.AccusedPersonId} not found"));
            }
        }

        // Create the grievance
        var grievance = new Grievance(
            request.ComplainantId,
            request.GrievanceCode,
            request.Subject,
            request.Description,
            request.GrievanceType,
            request.Priority);

        // Set tenant ID
        grievance.SetTenantId(request.TenantId);

        // Set optional properties
        if (request.IncidentDate.HasValue || !string.IsNullOrEmpty(request.IncidentLocation))
            grievance.SetIncidentDetails(request.IncidentDate, request.IncidentLocation);

        if (request.AccusedPersonId.HasValue)
            grievance.SetAccusedPerson(request.AccusedPersonId, null);

        grievance.SetConfidentiality(request.IsAnonymous, request.IsConfidential, request.RetaliationProtectionRequested);

        // Save to repository
        await _grievanceRepository.AddAsync(grievance, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(grievance.Id);
    }
}
