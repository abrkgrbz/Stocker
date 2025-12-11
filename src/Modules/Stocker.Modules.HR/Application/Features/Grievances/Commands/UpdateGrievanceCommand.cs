using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to update a grievance
/// </summary>
public record UpdateGrievanceCommand(
    Guid TenantId,
    int GrievanceId,
    GrievanceStatus? Status = null,
    GrievancePriority? Priority = null,
    int? AssignedToId = null,
    int? HrRepresentativeId = null,
    string? InvestigationNotes = null,
    string? Resolution = null,
    ResolutionType? ResolutionType = null,
    string? InternalNotes = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for UpdateGrievanceCommand
/// </summary>
public class UpdateGrievanceCommandValidator : AbstractValidator<UpdateGrievanceCommand>
{
    public UpdateGrievanceCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.GrievanceId)
            .GreaterThan(0).WithMessage("Grievance ID must be greater than 0");
    }
}

/// <summary>
/// Handler for UpdateGrievanceCommand
/// </summary>
public class UpdateGrievanceCommandHandler : IRequestHandler<UpdateGrievanceCommand, Result<bool>>
{
    private readonly IGrievanceRepository _grievanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateGrievanceCommandHandler(
        IGrievanceRepository grievanceRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _grievanceRepository = grievanceRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateGrievanceCommand request, CancellationToken cancellationToken)
    {
        // Get existing grievance
        var grievance = await _grievanceRepository.GetByIdAsync(request.GrievanceId, cancellationToken);
        if (grievance == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.GrievanceId} not found"));
        }

        // Verify assignee if specified
        if (request.AssignedToId.HasValue)
        {
            var assignee = await _employeeRepository.GetByIdAsync(request.AssignedToId.Value, cancellationToken);
            if (assignee == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Employee", $"Assignee with ID {request.AssignedToId} not found"));
            }
            grievance.AssignTo(request.AssignedToId.Value, request.HrRepresentativeId);
        }

        // Update properties
        if (request.Priority.HasValue)
            grievance.SetPriority(request.Priority.Value);

        if (!string.IsNullOrEmpty(request.InvestigationNotes))
            grievance.SetInvestigationNotes(request.InvestigationNotes);

        if (!string.IsNullOrEmpty(request.Resolution) && request.ResolutionType.HasValue)
            grievance.Resolve(request.Resolution, request.ResolutionType.Value);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            grievance.SetInternalNotes(request.InternalNotes);

        // Save changes
        _grievanceRepository.Update(grievance);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
