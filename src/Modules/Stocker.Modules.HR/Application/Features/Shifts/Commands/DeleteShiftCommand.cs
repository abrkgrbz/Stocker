using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Commands;

/// <summary>
/// Command to delete a shift
/// </summary>
public record DeleteShiftCommand(int ShiftId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteShiftCommand
/// </summary>
public class DeleteShiftCommandValidator : AbstractValidator<DeleteShiftCommand>
{
    public DeleteShiftCommandValidator()
    {
        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("Shift ID is required");
    }
}

/// <summary>
/// Handler for DeleteShiftCommand
/// </summary>
public class DeleteShiftCommandHandler : IRequestHandler<DeleteShiftCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteShiftCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteShiftCommand request, CancellationToken cancellationToken)
    {
        var shift = await _unitOfWork.Shifts.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Shift", $"Shift with ID {request.ShiftId} not found"));
        }

        // Check if any employees are assigned to this shift
        var employeeCount = await _unitOfWork.Shifts.GetEmployeeCountAsync(request.ShiftId, cancellationToken);
        if (employeeCount > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("Shift.Employees", $"Cannot delete shift. {employeeCount} employee(s) are currently assigned to this shift"));
        }

        // Soft delete the shift
        shift.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
