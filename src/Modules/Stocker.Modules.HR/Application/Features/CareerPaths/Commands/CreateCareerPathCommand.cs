using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.CareerPaths.Commands;

/// <summary>
/// Command to create a new career path
/// </summary>
public record CreateCareerPathCommand : IRequest<Result<int>>
{
    public int EmployeeId { get; init; }
    public string PathName { get; init; } = string.Empty;
    public int CurrentPositionId { get; init; }
    public int CurrentLevel { get; init; }
    public CareerTrack CareerTrack { get; init; }
    public int? TargetPositionId { get; init; }
    public string? TargetPositionName { get; init; }
    public int? TargetLevel { get; init; }
    public DateTime? ExpectedTargetDate { get; init; }
    public int? TargetTimelineMonths { get; init; }
    public int? MentorId { get; init; }
    public string? DevelopmentAreas { get; init; }
    public string? RequiredCompetencies { get; init; }
    public string? RequiredCertifications { get; init; }
    public string? RequiredTraining { get; init; }
    public int? RequiredExperienceYears { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Handler for CreateCareerPathCommand
/// </summary>
public class CreateCareerPathCommandHandler : IRequestHandler<CreateCareerPathCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateCareerPathCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateCareerPathCommand request, CancellationToken cancellationToken)
    {
        var careerPath = new CareerPath(
            request.EmployeeId,
            request.PathName,
            request.CurrentPositionId,
            request.CurrentLevel,
            request.CareerTrack);

        careerPath.SetTenantId(_unitOfWork.TenantId);

        if (request.TargetPositionId.HasValue && !string.IsNullOrEmpty(request.TargetPositionName))
        {
            careerPath.SetTarget(
                request.TargetPositionId.Value,
                request.TargetPositionName,
                request.TargetLevel ?? 0,
                request.ExpectedTargetDate,
                request.TargetTimelineMonths);
        }

        if (request.MentorId.HasValue)
        {
            careerPath.AssignMentor(request.MentorId.Value);
        }

        if (!string.IsNullOrEmpty(request.DevelopmentAreas))
            careerPath.SetDevelopmentAreas(request.DevelopmentAreas);

        if (!string.IsNullOrEmpty(request.RequiredCompetencies))
            careerPath.SetRequiredCompetencies(request.RequiredCompetencies);

        if (!string.IsNullOrEmpty(request.RequiredCertifications))
            careerPath.SetRequiredCertifications(request.RequiredCertifications);

        if (!string.IsNullOrEmpty(request.RequiredTraining))
            careerPath.SetRequiredTraining(request.RequiredTraining);

        if (request.RequiredExperienceYears.HasValue)
            careerPath.SetRequiredExperience(request.RequiredExperienceYears);

        if (!string.IsNullOrEmpty(request.Notes))
            careerPath.SetNotes(request.Notes);

        await _unitOfWork.CareerPaths.AddAsync(careerPath, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(careerPath.Id);
    }
}
