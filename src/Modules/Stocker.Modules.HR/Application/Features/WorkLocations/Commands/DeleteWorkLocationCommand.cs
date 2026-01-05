using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Commands;

/// <summary>
/// Command to delete a work location
/// </summary>
public record DeleteWorkLocationCommand : IRequest<Result<bool>>
{
    public int WorkLocationId { get; init; }
}

/// <summary>
/// Validator for DeleteWorkLocationCommand
/// </summary>
public class DeleteWorkLocationCommandValidator : AbstractValidator<DeleteWorkLocationCommand>
{
    public DeleteWorkLocationCommandValidator()
    {
        RuleFor(x => x.WorkLocationId)
            .GreaterThan(0).WithMessage("Work location ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteWorkLocationCommand
/// </summary>
public class DeleteWorkLocationCommandHandler : IRequestHandler<DeleteWorkLocationCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteWorkLocationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteWorkLocationCommand request, CancellationToken cancellationToken)
    {
        // Get existing work location
        var workLocation = await _unitOfWork.WorkLocations.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("WorkLocation", $"Work location with ID {request.WorkLocationId} not found"));
        }

        // Check if location has employees
        var employeeCount = await _unitOfWork.WorkLocations.GetEmployeeCountAsync(request.WorkLocationId, cancellationToken);
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
        _unitOfWork.WorkLocations.Remove(workLocation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
