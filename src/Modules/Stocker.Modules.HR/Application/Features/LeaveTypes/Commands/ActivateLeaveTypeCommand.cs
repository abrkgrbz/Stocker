using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Commands;

/// <summary>
/// Command to activate a leave type
/// </summary>
public record ActivateLeaveTypeCommand(int LeaveTypeId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for ActivateLeaveTypeCommand
/// </summary>
public class ActivateLeaveTypeCommandValidator : AbstractValidator<ActivateLeaveTypeCommand>
{
    public ActivateLeaveTypeCommandValidator()
    {
        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("LeaveType ID must be greater than 0");
    }
}

/// <summary>
/// Handler for ActivateLeaveTypeCommand
/// </summary>
public class ActivateLeaveTypeCommandHandler : IRequestHandler<ActivateLeaveTypeCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ActivateLeaveTypeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateLeaveTypeCommand request, CancellationToken cancellationToken)
    {
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(request.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("LeaveType", $"LeaveType with ID {request.LeaveTypeId} not found"));
        }

        if (leaveType.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("LeaveType", "LeaveType is already active"));
        }

        leaveType.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
