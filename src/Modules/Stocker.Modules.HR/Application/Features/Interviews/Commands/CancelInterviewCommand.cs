using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to cancel an interview
/// </summary>
public record CancelInterviewCommand(int InterviewId, string Reason, string CancelledBy) : IRequest<Result<bool>>;

/// <summary>
/// Validator for CancelInterviewCommand
/// </summary>
public class CancelInterviewCommandValidator : AbstractValidator<CancelInterviewCommand>
{
    public CancelInterviewCommandValidator()
    {
        RuleFor(x => x.InterviewId)
            .GreaterThan(0).WithMessage("Interview ID must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required")
            .MaximumLength(1000).WithMessage("Cancellation reason must not exceed 1000 characters");

        RuleFor(x => x.CancelledBy)
            .NotEmpty().WithMessage("Cancelled by is required")
            .MaximumLength(200).WithMessage("Cancelled by must not exceed 200 characters");
    }
}

/// <summary>
/// Handler for CancelInterviewCommand
/// </summary>
public class CancelInterviewCommandHandler : IRequestHandler<CancelInterviewCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CancelInterviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CancelInterviewCommand request, CancellationToken cancellationToken)
    {
        var interview = await _unitOfWork.Interviews.GetByIdAsync(request.InterviewId, cancellationToken);
        if (interview == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.InterviewId} not found"));
        }

        try
        {
            interview.Cancel(request.Reason, request.CancelledBy);
            await _unitOfWork.Interviews.UpdateAsync(interview, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Interview.Cancel", ex.Message));
        }
    }
}
