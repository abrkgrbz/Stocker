using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to delete a grievance
/// </summary>
public record DeleteGrievanceCommand(
    Guid TenantId,
    int GrievanceId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteGrievanceCommand
/// </summary>
public class DeleteGrievanceCommandValidator : AbstractValidator<DeleteGrievanceCommand>
{
    public DeleteGrievanceCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.GrievanceId)
            .GreaterThan(0).WithMessage("Grievance ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteGrievanceCommand
/// </summary>
public class DeleteGrievanceCommandHandler : IRequestHandler<DeleteGrievanceCommand, Result<bool>>
{
    private readonly IGrievanceRepository _grievanceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteGrievanceCommandHandler(
        IGrievanceRepository grievanceRepository,
        IUnitOfWork unitOfWork)
    {
        _grievanceRepository = grievanceRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteGrievanceCommand request, CancellationToken cancellationToken)
    {
        // Get existing grievance
        var grievance = await _grievanceRepository.GetByIdAsync(request.GrievanceId, cancellationToken);
        if (grievance == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.GrievanceId} not found"));
        }

        // Remove grievance
        _grievanceRepository.Remove(grievance);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
