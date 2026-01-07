using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to escalate a grievance
/// </summary>
public record EscalateGrievanceCommand(int GrievanceId, string Reason) : IRequest<Result<bool>>;

/// <summary>
/// Validator for EscalateGrievanceCommand
/// </summary>
public class EscalateGrievanceCommandValidator : AbstractValidator<EscalateGrievanceCommand>
{
    public EscalateGrievanceCommandValidator()
    {
        RuleFor(x => x.GrievanceId)
            .GreaterThan(0).WithMessage("Grievance ID must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Escalation reason is required")
            .MaximumLength(1000).WithMessage("Escalation reason must not exceed 1000 characters");
    }
}

/// <summary>
/// Handler for EscalateGrievanceCommand
/// </summary>
public class EscalateGrievanceCommandHandler : IRequestHandler<EscalateGrievanceCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public EscalateGrievanceCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(EscalateGrievanceCommand request, CancellationToken cancellationToken)
    {
        var grievance = await _unitOfWork.Grievances.GetByIdAsync(request.GrievanceId, cancellationToken);
        if (grievance == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.GrievanceId} not found"));
        }

        try
        {
            grievance.Escalate(request.Reason);
            await _unitOfWork.Grievances.UpdateAsync(grievance, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Grievance.Escalate", ex.Message));
        }
    }
}
