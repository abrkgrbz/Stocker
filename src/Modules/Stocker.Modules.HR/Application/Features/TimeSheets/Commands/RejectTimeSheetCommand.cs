using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Commands;

/// <summary>
/// Command to reject a timesheet
/// </summary>
public record RejectTimeSheetCommand(int TimeSheetId, int RejectedById, string Reason) : IRequest<Result<bool>>;

/// <summary>
/// Validator for RejectTimeSheetCommand
/// </summary>
public class RejectTimeSheetCommandValidator : AbstractValidator<RejectTimeSheetCommand>
{
    public RejectTimeSheetCommandValidator()
    {
        RuleFor(x => x.TimeSheetId)
            .GreaterThan(0).WithMessage("TimeSheet ID must be greater than 0");

        RuleFor(x => x.RejectedById)
            .GreaterThan(0).WithMessage("Rejector ID must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is required")
            .MaximumLength(1000).WithMessage("Rejection reason must not exceed 1000 characters");
    }
}

/// <summary>
/// Handler for RejectTimeSheetCommand
/// </summary>
public class RejectTimeSheetCommandHandler : IRequestHandler<RejectTimeSheetCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public RejectTimeSheetCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(RejectTimeSheetCommand request, CancellationToken cancellationToken)
    {
        var timeSheet = await _unitOfWork.TimeSheets.GetByIdAsync(request.TimeSheetId, cancellationToken);
        if (timeSheet == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("TimeSheet", $"TimeSheet with ID {request.TimeSheetId} not found"));
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
            timeSheet.Reject(request.RejectedById, request.Reason);
            await _unitOfWork.TimeSheets.UpdateAsync(timeSheet, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("TimeSheet.Reject", ex.Message));
        }
    }
}
