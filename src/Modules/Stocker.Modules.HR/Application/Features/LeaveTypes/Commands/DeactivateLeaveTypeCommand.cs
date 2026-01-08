using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Commands;

/// <summary>
/// Command to deactivate a leave type
/// </summary>
public record DeactivateLeaveTypeCommand(int LeaveTypeId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeactivateLeaveTypeCommand
/// </summary>
public class DeactivateLeaveTypeCommandValidator : AbstractValidator<DeactivateLeaveTypeCommand>
{
    public DeactivateLeaveTypeCommandValidator()
    {
        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("LeaveType ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeactivateLeaveTypeCommand
/// </summary>
public class DeactivateLeaveTypeCommandHandler : IRequestHandler<DeactivateLeaveTypeCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeactivateLeaveTypeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateLeaveTypeCommand request, CancellationToken cancellationToken)
    {
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(request.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("LeaveType", $"LeaveType with ID {request.LeaveTypeId} not found"));
        }

        if (!leaveType.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("LeaveType", "LeaveType is already inactive"));
        }

        leaveType.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
