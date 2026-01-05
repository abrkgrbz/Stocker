using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to delete an interview
/// </summary>
public record DeleteInterviewCommand(int InterviewId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteInterviewCommand
/// </summary>
public class DeleteInterviewCommandValidator : AbstractValidator<DeleteInterviewCommand>
{
    public DeleteInterviewCommandValidator()
    {
        RuleFor(x => x.InterviewId)
            .GreaterThan(0).WithMessage("Interview ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteInterviewCommand
/// </summary>
public class DeleteInterviewCommandHandler : IRequestHandler<DeleteInterviewCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteInterviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteInterviewCommand request, CancellationToken cancellationToken)
    {
        // Get existing interview
        var interview = await _unitOfWork.Interviews.GetByIdAsync(request.InterviewId, cancellationToken);
        if (interview == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.InterviewId} not found"));
        }

        // Remove interview
        _unitOfWork.Interviews.Remove(interview);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
