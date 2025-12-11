using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to delete an interview
/// </summary>
public record DeleteInterviewCommand(
    Guid TenantId,
    int InterviewId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteInterviewCommand
/// </summary>
public class DeleteInterviewCommandValidator : AbstractValidator<DeleteInterviewCommand>
{
    public DeleteInterviewCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.InterviewId)
            .GreaterThan(0).WithMessage("Interview ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteInterviewCommand
/// </summary>
public class DeleteInterviewCommandHandler : IRequestHandler<DeleteInterviewCommand, Result<bool>>
{
    private readonly IInterviewRepository _interviewRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteInterviewCommandHandler(
        IInterviewRepository interviewRepository,
        IUnitOfWork unitOfWork)
    {
        _interviewRepository = interviewRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteInterviewCommand request, CancellationToken cancellationToken)
    {
        // Get existing interview
        var interview = await _interviewRepository.GetByIdAsync(request.InterviewId, cancellationToken);
        if (interview == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.InterviewId} not found"));
        }

        // Remove interview
        _interviewRepository.Remove(interview);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
