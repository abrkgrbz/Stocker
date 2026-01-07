using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to resolve a grievance
/// </summary>
public record ResolveGrievanceCommand(
    int GrievanceId,
    string Resolution,
    string ResolutionType,
    string? ActionsTaken = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for ResolveGrievanceCommand
/// </summary>
public class ResolveGrievanceCommandValidator : AbstractValidator<ResolveGrievanceCommand>
{
    public ResolveGrievanceCommandValidator()
    {
        RuleFor(x => x.GrievanceId)
            .GreaterThan(0).WithMessage("Grievance ID must be greater than 0");

        RuleFor(x => x.Resolution)
            .NotEmpty().WithMessage("Resolution is required")
            .MaximumLength(2000).WithMessage("Resolution must not exceed 2000 characters");

        RuleFor(x => x.ResolutionType)
            .NotEmpty().WithMessage("Resolution type is required");
    }
}

/// <summary>
/// Handler for ResolveGrievanceCommand
/// </summary>
public class ResolveGrievanceCommandHandler : IRequestHandler<ResolveGrievanceCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ResolveGrievanceCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ResolveGrievanceCommand request, CancellationToken cancellationToken)
    {
        var grievance = await _unitOfWork.Grievances.GetByIdAsync(request.GrievanceId, cancellationToken);
        if (grievance == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.GrievanceId} not found"));
        }

        if (!Enum.TryParse<ResolutionType>(request.ResolutionType, true, out var resolutionType))
        {
            return Result<bool>.Failure(
                Error.Validation("Grievance.ResolutionType", $"Invalid resolution type: {request.ResolutionType}"));
        }

        try
        {
            grievance.Resolve(request.Resolution, resolutionType, request.ActionsTaken);
            await _unitOfWork.Grievances.UpdateAsync(grievance, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Grievance.Resolve", ex.Message));
        }
    }
}
