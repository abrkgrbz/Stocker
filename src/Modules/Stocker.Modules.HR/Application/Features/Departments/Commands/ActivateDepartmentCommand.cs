using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Commands;

/// <summary>
/// Command to activate a department
/// </summary>
public record ActivateDepartmentCommand(int DepartmentId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for ActivateDepartmentCommand
/// </summary>
public class ActivateDepartmentCommandValidator : AbstractValidator<ActivateDepartmentCommand>
{
    public ActivateDepartmentCommandValidator()
    {
        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0");
    }
}

/// <summary>
/// Handler for ActivateDepartmentCommand
/// </summary>
public class ActivateDepartmentCommandHandler : IRequestHandler<ActivateDepartmentCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ActivateDepartmentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        if (department.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("Department", "Department is already active"));
        }

        department.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
