using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Queries;

/// <summary>
/// Query to get a job application by ID
/// </summary>
public record GetJobApplicationByIdQuery(int Id) : IRequest<Result<JobApplicationDto>>;

/// <summary>
/// Handler for GetJobApplicationByIdQuery
/// </summary>
public class GetJobApplicationByIdQueryHandler : IRequestHandler<GetJobApplicationByIdQuery, Result<JobApplicationDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetJobApplicationByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JobApplicationDto>> Handle(GetJobApplicationByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.JobApplications.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<JobApplicationDto>.Failure(
                Error.NotFound("JobApplication", $"Job application with ID {request.Id} not found"));
        }

        // Get related names
        string? jobTitle = null;
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(entity.JobPostingId, cancellationToken);
        if (jobPosting != null)
        {
            jobTitle = jobPosting.Title;
        }

        string? referredByEmployeeName = null;
        if (entity.ReferredByEmployeeId.HasValue)
        {
            var referredBy = await _unitOfWork.Employees.GetByIdAsync(entity.ReferredByEmployeeId.Value, cancellationToken);
            referredByEmployeeName = referredBy != null ? $"{referredBy.FirstName} {referredBy.LastName}" : null;
        }

        var dto = new JobApplicationDto
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
        };

        return Result<JobApplicationDto>.Success(dto);
    }
}
