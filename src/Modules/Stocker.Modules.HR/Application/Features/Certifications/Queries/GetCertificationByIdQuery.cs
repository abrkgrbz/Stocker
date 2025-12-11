using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.Certifications.Queries;

public record GetCertificationByIdQuery(int Id) : IRequest<CertificationDto?>;

public class GetCertificationByIdQueryHandler : IRequestHandler<GetCertificationByIdQuery, CertificationDto?>
{
    private readonly ICertificationRepository _repository;

    public GetCertificationByIdQueryHandler(ICertificationRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<CertificationDto?> Handle(GetCertificationByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new CertificationDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = entity.Employee?.FullName ?? string.Empty,
            CertificationName = entity.CertificationName,
            CertificationType = entity.CertificationType.ToString(),
            Status = entity.Status.ToString(),

            // Issuing Authority
            IssuingAuthority = entity.IssuingAuthority,
            IssuingCountry = entity.IssuingCountry,
            AccreditationBody = entity.AccreditationBody,

            // Certification Details
            CertificationNumber = entity.CertificationNumber,
            CredentialId = entity.CredentialId,
            VerificationUrl = entity.VerificationUrl,
            CertificationLevel = entity.CertificationLevel,
            Specialization = entity.Specialization,

            // Dates
            IssueDate = entity.IssueDate,
            ExpiryDate = entity.ExpiryDate,
            LastRenewalDate = entity.LastRenewalDate,
            NextRenewalDate = entity.NextRenewalDate,

            // Training Information
            TrainingRequired = entity.TrainingRequired,
            TotalTrainingHours = entity.TotalTrainingHours,
            CompletedTrainingHours = entity.CompletedTrainingHours,
            TrainingProvider = entity.TrainingProvider,
            TrainingCompletionDate = entity.TrainingCompletionDate,

            // Exam Information
            ExamRequired = entity.ExamRequired,
            ExamDate = entity.ExamDate,
            ExamScore = entity.ExamScore,
            PassingScore = entity.PassingScore,
            AttemptNumber = entity.AttemptNumber,

            // Cost Information
            CertificationCost = entity.CertificationCost,
            RenewalCost = entity.RenewalCost,
            CompanySponsored = entity.CompanySponsored,
            Currency = entity.Currency,

            // CPE/CEU Information
            CpeRequired = entity.CpeRequired,
            RequiredCpeUnits = entity.RequiredCpeUnits,
            EarnedCpeUnits = entity.EarnedCpeUnits,
            CpePeriodStart = entity.CpePeriodStart,
            CpePeriodEnd = entity.CpePeriodEnd,

            // Document Information
            CertificateFileUrl = entity.CertificateFileUrl,
            BadgeUrl = entity.BadgeUrl,

            // Additional Information
            Description = entity.Description,
            Notes = entity.Notes,
            RequiredForJob = entity.RequiredForJob,
            ReminderSent = entity.ReminderSent,
            ReminderDate = entity.ReminderDate,

            IsActive = !entity.IsDeleted,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };
    }
}
