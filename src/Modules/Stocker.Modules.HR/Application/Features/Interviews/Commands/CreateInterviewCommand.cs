using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to create a new interview
/// </summary>
public record CreateInterviewCommand(
    Guid TenantId,
    int JobApplicationId,
    int InterviewerId,
    InterviewType InterviewType,
    DateTime ScheduledDateTime,
    int DurationMinutes = 60,
    int Round = 1,
    InterviewFormat Format = InterviewFormat.InPerson,
    string? Location = null,
    string? VideoConferenceLink = null,
    string? Topics = null,
    string? CandidateInstructions = null) : IRequest<Result<int>>;

/// <summary>
/// Validator for CreateInterviewCommand
/// </summary>
public class CreateInterviewCommandValidator : AbstractValidator<CreateInterviewCommand>
{
    public CreateInterviewCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.JobApplicationId)
            .GreaterThan(0).WithMessage("Job Application ID must be greater than 0");

        RuleFor(x => x.InterviewerId)
            .GreaterThan(0).WithMessage("Interviewer ID must be greater than 0");

        RuleFor(x => x.ScheduledDateTime)
            .GreaterThan(DateTime.UtcNow).WithMessage("Scheduled date time must be in the future");

        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0).WithMessage("Duration must be greater than 0")
            .LessThanOrEqualTo(480).WithMessage("Duration must not exceed 8 hours (480 minutes)");

        RuleFor(x => x.Round)
            .GreaterThan(0).WithMessage("Round must be greater than 0");
    }
}

/// <summary>
/// Handler for CreateInterviewCommand
/// </summary>
public class CreateInterviewCommandHandler : IRequestHandler<CreateInterviewCommand, Result<int>>
{
    private readonly IInterviewRepository _interviewRepository;
    private readonly IJobApplicationRepository _jobApplicationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateInterviewCommandHandler(
        IInterviewRepository interviewRepository,
        IJobApplicationRepository jobApplicationRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _interviewRepository = interviewRepository;
        _jobApplicationRepository = jobApplicationRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateInterviewCommand request, CancellationToken cancellationToken)
    {
        // Verify job application exists
        var jobApplication = await _jobApplicationRepository.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<int>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        // Verify interviewer exists
        var interviewer = await _employeeRepository.GetByIdAsync(request.InterviewerId, cancellationToken);
        if (interviewer == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Interviewer with ID {request.InterviewerId} not found"));
        }

        // Create the interview
        var interview = new Interview(
            request.JobApplicationId,
            request.InterviewerId,
            request.InterviewType,
            request.ScheduledDateTime,
            request.DurationMinutes,
            request.Round);

        // Set tenant ID
        interview.SetTenantId(request.TenantId);

        // Set format and location
        interview.SetFormat(request.Format);

        if (request.Format == InterviewFormat.InPerson && !string.IsNullOrEmpty(request.Location))
            interview.SetLocation(request.Location, null);

        if (request.Format == InterviewFormat.Video && !string.IsNullOrEmpty(request.VideoConferenceLink))
            interview.SetVideoConference(request.VideoConferenceLink, "Teams");

        // Set optional properties
        if (!string.IsNullOrEmpty(request.Topics))
            interview.SetTopics(request.Topics);

        if (!string.IsNullOrEmpty(request.CandidateInstructions))
            interview.SetCandidateInstructions(request.CandidateInstructions);

        // Save to repository
        await _interviewRepository.AddAsync(interview, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(interview.Id);
    }
}
