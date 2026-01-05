using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to update an interview
/// </summary>
public record UpdateInterviewCommand(
    int InterviewId,
    InterviewStatus? Status = null,
    DateTime? ScheduledDateTime = null,
    int? DurationMinutes = null,
    string? Location = null,
    string? VideoConferenceLink = null,
    string? Topics = null,
    string? InterviewerNotes = null,
    int? OverallRating = null,
    InterviewRecommendation? Recommendation = null,
    string? EvaluationSummary = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for UpdateInterviewCommand
/// </summary>
public class UpdateInterviewCommandValidator : AbstractValidator<UpdateInterviewCommand>
{
    public UpdateInterviewCommandValidator()
    {
        RuleFor(x => x.InterviewId)
            .GreaterThan(0).WithMessage("Interview ID must be greater than 0");

        RuleFor(x => x.ScheduledDateTime)
            .GreaterThan(DateTime.UtcNow).When(x => x.ScheduledDateTime.HasValue)
            .WithMessage("Scheduled date time must be in the future");

        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0).When(x => x.DurationMinutes.HasValue)
            .WithMessage("Duration must be greater than 0")
            .LessThanOrEqualTo(480).When(x => x.DurationMinutes.HasValue)
            .WithMessage("Duration must not exceed 8 hours (480 minutes)");

        RuleFor(x => x.OverallRating)
            .InclusiveBetween(1, 10).When(x => x.OverallRating.HasValue)
            .WithMessage("Overall rating must be between 1 and 10");
    }
}

/// <summary>
/// Handler for UpdateInterviewCommand
/// </summary>
public class UpdateInterviewCommandHandler : IRequestHandler<UpdateInterviewCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateInterviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateInterviewCommand request, CancellationToken cancellationToken)
    {
        // Get existing interview
        var interview = await _unitOfWork.Interviews.GetByIdAsync(request.InterviewId, cancellationToken);
        if (interview == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.InterviewId} not found"));
        }

        // Update scheduling if provided
        if (request.ScheduledDateTime.HasValue && request.DurationMinutes.HasValue)
            interview.Schedule(request.ScheduledDateTime.Value, request.DurationMinutes.Value);

        // Update location if provided
        if (!string.IsNullOrEmpty(request.Location))
            interview.SetLocation(request.Location, null);

        if (!string.IsNullOrEmpty(request.VideoConferenceLink))
            interview.SetVideoConference(request.VideoConferenceLink, "Teams");

        // Update topics and notes
        if (!string.IsNullOrEmpty(request.Topics))
            interview.SetTopics(request.Topics);

        if (!string.IsNullOrEmpty(request.InterviewerNotes))
            interview.SetInterviewerNotes(request.InterviewerNotes);

        // Update evaluation if provided
        if (request.OverallRating.HasValue && request.Recommendation.HasValue)
        {
            interview.SubmitEvaluation(
                request.OverallRating.Value,
                null,
                null,
                null,
                null,
                request.Recommendation.Value,
                request.EvaluationSummary);
        }

        // Save changes
        _unitOfWork.Interviews.Update(interview);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
