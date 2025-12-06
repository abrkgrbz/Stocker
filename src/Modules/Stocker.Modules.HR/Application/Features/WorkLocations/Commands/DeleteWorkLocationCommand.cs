using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Commands;

/// <summary>
/// Command to delete a work location
/// </summary>
public class DeleteWorkLocationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int WorkLocationId { get; set; }
}

/// <summary>
/// Validator for DeleteWorkLocationCommand
/// </summary>
public class DeleteWorkLocationCommandValidator : AbstractValidator<DeleteWorkLocationCommand>
{
    public DeleteWorkLocationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.WorkLocationId)
            .GreaterThan(0).WithMessage("Work location ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteWorkLocationCommand
/// </summary>
public class DeleteWorkLocationCommandHandler : IRequestHandler<DeleteWorkLocationCommand, Result<bool>>
{
    private readonly IWorkLocationRepository _workLocationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWorkLocationCommandHandler(
        IWorkLocationRepository workLocationRepository,
        IUnitOfWork unitOfWork)
    {
        _workLocationRepository = workLocationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteWorkLocationCommand request, CancellationToken cancellationToken)
    {
        // Get existing work location
        var workLocation = await _workLocationRepository.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("WorkLocation", $"Work location with ID {request.WorkLocationId} not found"));
        }

        // Check if location has employees
        var employeeCount = await _workLocationRepository.GetEmployeeCountAsync(request.WorkLocationId, cancellationToken);
        if (employeeCount > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("WorkLocation",
                    $"Cannot delete work location with {employeeCount} employees. Please reassign employees first."));
        }

        // Prevent deletion of headquarters location
        if (workLocation.IsHeadquarters)
        {
            return Result<bool>.Failure(
                Error.Conflict("WorkLocation.IsHeadquarters",
                    "Cannot delete the headquarters location. Please designate another location as headquarters first."));
        }

        // Soft delete
        _workLocationRepository.Remove(workLocation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
