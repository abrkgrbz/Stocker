using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Commands;

/// <summary>
/// Command to reject an overtime request
/// </summary>
public record RejectOvertimeCommand(int OvertimeId, int RejectedById, string Reason) : IRequest<Result<bool>>;

/// <summary>
/// Validator for RejectOvertimeCommand
/// </summary>
public class RejectOvertimeCommandValidator : AbstractValidator<RejectOvertimeCommand>
{
    public RejectOvertimeCommandValidator()
    {
        RuleFor(x => x.OvertimeId)
            .GreaterThan(0).WithMessage("Overtime ID must be greater than 0");

        RuleFor(x => x.RejectedById)
            .GreaterThan(0).WithMessage("Rejector ID must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is required")
            .MaximumLength(1000).WithMessage("Rejection reason must not exceed 1000 characters");
    }
}

/// <summary>
/// Handler for RejectOvertimeCommand
/// </summary>
public class RejectOvertimeCommandHandler : IRequestHandler<RejectOvertimeCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public RejectOvertimeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(RejectOvertimeCommand request, CancellationToken cancellationToken)
    {
        var overtime = await _unitOfWork.Overtimes.GetByIdAsync(request.OvertimeId, cancellationToken);
        if (overtime == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Overtime", $"Overtime with ID {request.OvertimeId} not found"));
        }

        // Verify rejector exists
        var rejector = await _unitOfWork.Employees.GetByIdAsync(request.RejectedById, cancellationToken);
        if (rejector == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Employee", $"Rejector with ID {request.RejectedById} not found"));
        }

        try
        {
            overtime.Reject(request.RejectedById, request.Reason);
            await _unitOfWork.Overtimes.UpdateAsync(overtime, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Overtime.Reject", ex.Message));
        }
    }
}
