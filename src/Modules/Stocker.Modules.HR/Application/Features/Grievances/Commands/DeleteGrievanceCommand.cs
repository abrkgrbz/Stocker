using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to delete a grievance
/// </summary>
public record DeleteGrievanceCommand(int GrievanceId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteGrievanceCommand
/// </summary>
public class DeleteGrievanceCommandValidator : AbstractValidator<DeleteGrievanceCommand>
{
    public DeleteGrievanceCommandValidator()
    {
        RuleFor(x => x.GrievanceId)
            .GreaterThan(0).WithMessage("Grievance ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteGrievanceCommand
/// </summary>
public class DeleteGrievanceCommandHandler : IRequestHandler<DeleteGrievanceCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteGrievanceCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteGrievanceCommand request, CancellationToken cancellationToken)
    {
        // Get existing grievance
        var grievance = await _unitOfWork.Grievances.GetByIdAsync(request.GrievanceId, cancellationToken);
        if (grievance == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.GrievanceId} not found"));
        }

        // Remove grievance
        _unitOfWork.Grievances.Remove(grievance);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
