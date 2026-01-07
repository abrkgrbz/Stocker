using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to create a new grievance
/// </summary>
public record CreateGrievanceCommand : IRequest<Result<int>>
{
    public int ComplainantId { get; init; }
    public string GrievanceCode { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string GrievanceType { get; init; } = string.Empty;
    public string Priority { get; init; } = "Medium";
    public DateTime? IncidentDate { get; init; }
    public string? IncidentLocation { get; init; }
    public int? AccusedPersonId { get; init; }
    public string? AccusedPersonDescription { get; init; }
    public string? Witnesses { get; init; }
    public string? Evidence { get; init; }
    public bool IsAnonymous { get; init; }
    public bool IsConfidential { get; init; }
    public bool RetaliationProtectionRequested { get; init; }
    public string? Category { get; init; }
    public string? Subcategory { get; init; }
    public string? Tags { get; init; }
}

/// <summary>
/// Validator for CreateGrievanceCommand
/// </summary>
public class CreateGrievanceCommandValidator : AbstractValidator<CreateGrievanceCommand>
{
    public CreateGrievanceCommandValidator()
    {
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
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateGrievanceCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateGrievanceCommand request, CancellationToken cancellationToken)
    {
        // Verify complainant exists
        var complainant = await _unitOfWork.Employees.GetByIdAsync(request.ComplainantId, cancellationToken);
        if (complainant == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Complainant with ID {request.ComplainantId} not found"));
        }

        // Check if grievance code already exists
        var existingGrievance = await _unitOfWork.Grievances.GetByCodeAsync(request.GrievanceCode, cancellationToken);
        if (existingGrievance != null)
        {
            return Result<int>.Failure(
                Error.Conflict("Grievance.Code", "A grievance with this code already exists"));
        }

        // Verify accused person if specified
        if (request.AccusedPersonId.HasValue)
        {
            var accusedPerson = await _unitOfWork.Employees.GetByIdAsync(request.AccusedPersonId.Value, cancellationToken);
            if (accusedPerson == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Accused person with ID {request.AccusedPersonId} not found"));
            }
        }

        // Parse enum values
        var grievanceType = GrievanceType.Other;
        if (!string.IsNullOrEmpty(request.GrievanceType) && Enum.TryParse<GrievanceType>(request.GrievanceType, true, out var parsedType))
            grievanceType = parsedType;

        var priority = GrievancePriority.Medium;
        if (!string.IsNullOrEmpty(request.Priority) && Enum.TryParse<GrievancePriority>(request.Priority, true, out var parsedPriority))
            priority = parsedPriority;

        // Create the grievance
        var grievance = new Grievance(
            request.ComplainantId,
            request.GrievanceCode,
            request.Subject,
            request.Description,
            grievanceType,
            priority);

        // Set tenant ID
        grievance.SetTenantId(_unitOfWork.TenantId);

        // Set optional properties
        if (request.IncidentDate.HasValue || !string.IsNullOrEmpty(request.IncidentLocation))
            grievance.SetIncidentDetails(request.IncidentDate, request.IncidentLocation);

        if (request.AccusedPersonId.HasValue || !string.IsNullOrEmpty(request.AccusedPersonDescription))
            grievance.SetAccusedPerson(request.AccusedPersonId, request.AccusedPersonDescription);

        if (!string.IsNullOrEmpty(request.Witnesses))
            grievance.SetWitnesses(request.Witnesses);

        if (!string.IsNullOrEmpty(request.Evidence))
            grievance.SetEvidence(request.Evidence);

        grievance.SetConfidentiality(request.IsAnonymous, request.IsConfidential, request.RetaliationProtectionRequested);

        if (!string.IsNullOrEmpty(request.Category) || !string.IsNullOrEmpty(request.Subcategory))
            grievance.SetCategory(request.Category, request.Subcategory);

        if (!string.IsNullOrEmpty(request.Tags))
            grievance.SetTags(request.Tags);

        // Save to repository
        await _unitOfWork.Grievances.AddAsync(grievance, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(grievance.Id);
    }
}
