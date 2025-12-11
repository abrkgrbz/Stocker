using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Queries;

/// <summary>
/// Query to get all job applications
/// </summary>
public class GetJobApplicationsQuery : IRequest<Result<List<JobApplicationDto>>>
{
    public Guid TenantId { get; set; }
    public int? JobPostingId { get; set; }
    public bool ActiveOnly { get; set; } = false;
}

/// <summary>
/// Handler for GetJobApplicationsQuery
/// </summary>
public class GetJobApplicationsQueryHandler : IRequestHandler<GetJobApplicationsQuery, Result<List<JobApplicationDto>>>
{
    private readonly IJobApplicationRepository _repository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetJobApplicationsQueryHandler(
        IJobApplicationRepository repository,
        IJobPostingRepository jobPostingRepository,
        IEmployeeRepository employeeRepository)
    {
        _repository = repository;
        _jobPostingRepository = jobPostingRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<List<JobApplicationDto>>> Handle(GetJobApplicationsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);

        var filteredEntities = entities.AsEnumerable();

        if (request.JobPostingId.HasValue)
        {
            filteredEntities = filteredEntities.Where(e => e.JobPostingId == request.JobPostingId.Value);
        }

        if (request.ActiveOnly)
        {
            filteredEntities = filteredEntities.Where(e =>
                e.Status != Domain.Entities.ApplicationStatus.Rejected &&
                e.Status != Domain.Entities.ApplicationStatus.Withdrawn &&
                e.Status != Domain.Entities.ApplicationStatus.Hired);
        }

        var dtos = new List<JobApplicationDto>();
        foreach (var entity in filteredEntities)
        {
            string? jobTitle = null;
            var jobPosting = await _jobPostingRepository.GetByIdAsync(entity.JobPostingId, cancellationToken);
            if (jobPosting != null)
            {
                jobTitle = jobPosting.Title;
            }

            string? referredByEmployeeName = null;
            if (entity.ReferredByEmployeeId.HasValue)
            {
                var referredBy = await _employeeRepository.GetByIdAsync(entity.ReferredByEmployeeId.Value, cancellationToken);
                referredByEmployeeName = referredBy != null ? $"{referredBy.FirstName} {referredBy.LastName}" : null;
            }

            dtos.Add(new JobApplicationDto
            {
                Id = entity.Id,
                ApplicationCode = entity.ApplicationCode,
                Status = entity.Status.ToString(),
                ApplicationDate = entity.ApplicationDate,
                JobPostingId = entity.JobPostingId,
                JobTitle = jobTitle,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                FullName = entity.FullName,
                Email = entity.Email,
                Phone = entity.Phone,
                MobilePhone = entity.MobilePhone,
                Address = entity.Address,
                City = entity.City,
                Country = entity.Country,
                LinkedInUrl = entity.LinkedInUrl,
                PortfolioUrl = entity.PortfolioUrl,
                TotalExperienceYears = entity.TotalExperienceYears,
                CurrentCompany = entity.CurrentCompany,
                CurrentPosition = entity.CurrentPosition,
                CurrentSalary = entity.CurrentSalary,
                ExpectedSalary = entity.ExpectedSalary,
                Currency = entity.Currency,
                NoticePeriodDays = entity.NoticePeriodDays,
                AvailableStartDate = entity.AvailableStartDate,
                HighestEducation = entity.HighestEducation?.ToString(),
                University = entity.University,
                Major = entity.Major,
                GraduationYear = entity.GraduationYear,
                ResumeUrl = entity.ResumeUrl,
                CoverLetter = entity.CoverLetter,
                AdditionalDocumentsJson = entity.AdditionalDocumentsJson,
                OverallRating = entity.OverallRating,
                TechnicalScore = entity.TechnicalScore,
                CulturalFitScore = entity.CulturalFitScore,
                EvaluationNotes = entity.EvaluationNotes,
                EvaluatedByUserId = entity.EvaluatedByUserId,
                EvaluationDate = entity.EvaluationDate,
                Source = entity.Source.ToString(),
                ReferredByEmployeeId = entity.ReferredByEmployeeId,
                ReferredByEmployeeName = referredByEmployeeName,
                SourceDetail = entity.SourceDetail,
                CurrentStage = entity.CurrentStage.ToString(),
                LastStageChangeDate = entity.LastStageChangeDate,
                RejectionReason = entity.RejectionReason,
                RejectionCategory = entity.RejectionCategory?.ToString(),
                WithdrawalReason = entity.WithdrawalReason,
                OfferExtended = entity.OfferExtended,
                OfferDate = entity.OfferDate,
                OfferedSalary = entity.OfferedSalary,
                HireDate = entity.HireDate,
                CreatedEmployeeId = entity.CreatedEmployeeId,
                Skills = entity.Skills,
                Languages = entity.Languages,
                Notes = entity.Notes,
                Tags = entity.Tags,
                InTalentPool = entity.InTalentPool,
                CreatedAt = entity.CreatedDate,
                UpdatedAt = entity.UpdatedDate
            });
        }

        return Result<List<JobApplicationDto>>.Success(dtos.OrderByDescending(a => a.ApplicationDate).ToList());
    }
}
