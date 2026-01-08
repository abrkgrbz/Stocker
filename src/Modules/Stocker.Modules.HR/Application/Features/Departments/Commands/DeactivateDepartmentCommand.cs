using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Commands;

/// <summary>
/// Command to deactivate a department
/// </summary>
public record DeactivateDepartmentCommand(int DepartmentId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeactivateDepartmentCommand
/// </summary>
public class DeactivateDepartmentCommandValidator : AbstractValidator<DeactivateDepartmentCommand>
{
    public DeactivateDepartmentCommandValidator()
    {
        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeactivateDepartmentCommand
/// </summary>
public class DeactivateDepartmentCommandHandler : IRequestHandler<DeactivateDepartmentCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeactivateDepartmentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        if (!department.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("Department", "Department is already inactive"));
        }

        department.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
