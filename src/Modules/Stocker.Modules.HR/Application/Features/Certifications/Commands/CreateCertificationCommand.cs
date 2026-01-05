using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Certifications.Commands;

/// <summary>
/// Command to create a new certification
/// </summary>
public record CreateCertificationCommand : IRequest<Result<int>>
{
    public int EmployeeId { get; init; }
    public string CertificationName { get; init; } = string.Empty;
    public string IssuingAuthority { get; init; } = string.Empty;
    public DateTime IssueDate { get; init; }
    public CertificationType CertificationType { get; init; }
    public string? CertificationNumber { get; init; }
    public string? CredentialId { get; init; }
    public string? VerificationUrl { get; init; }
    public string? CertificationLevel { get; init; }
    public string? Specialization { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? IssuingCountry { get; init; }
    public string? AccreditationBody { get; init; }
    public bool TrainingRequired { get; init; }
    public int? TotalTrainingHours { get; init; }
    public string? TrainingProvider { get; init; }
    public bool ExamRequired { get; init; }
    public decimal? PassingScore { get; init; }
    public decimal? CertificationCost { get; init; }
    public decimal? RenewalCost { get; init; }
    public bool CompanySponsored { get; init; }
    public bool CpeRequired { get; init; }
    public int? RequiredCpeUnits { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public bool RequiredForJob { get; init; }
}

/// <summary>
/// Handler for CreateCertificationCommand
/// </summary>
public class CreateCertificationCommandHandler : IRequestHandler<CreateCertificationCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateCertificationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreateCertificationCommand request, CancellationToken cancellationToken)
    {
        var certification = new Certification(
            request.EmployeeId,
            request.CertificationName,
            request.IssuingAuthority,
            request.IssueDate,
            request.CertificationType);

        certification.SetTenantId(_unitOfWork.TenantId);

        if (!string.IsNullOrEmpty(request.CertificationNumber))
            certification.SetCertificationNumber(request.CertificationNumber);

        if (!string.IsNullOrEmpty(request.CredentialId))
            certification.SetCredentialId(request.CredentialId);

        if (!string.IsNullOrEmpty(request.VerificationUrl))
            certification.SetVerificationUrl(request.VerificationUrl);

        if (!string.IsNullOrEmpty(request.CertificationLevel))
            certification.SetCertificationLevel(request.CertificationLevel);

        if (!string.IsNullOrEmpty(request.Specialization))
            certification.SetSpecialization(request.Specialization);

        if (request.ExpiryDate.HasValue)
            certification.SetExpiryDate(request.ExpiryDate);

        if (!string.IsNullOrEmpty(request.IssuingCountry))
            certification.SetIssuingCountry(request.IssuingCountry);

        if (!string.IsNullOrEmpty(request.AccreditationBody))
            certification.SetAccreditationBody(request.AccreditationBody);

        certification.SetTrainingInfo(request.TrainingRequired, request.TotalTrainingHours, request.TrainingProvider);
        certification.SetExamInfo(request.ExamRequired, request.PassingScore);
        certification.SetCost(request.CertificationCost, request.RenewalCost, request.CompanySponsored);
        certification.SetCpeRequirement(request.CpeRequired, request.RequiredCpeUnits);

        if (!string.IsNullOrEmpty(request.Description))
            certification.SetDescription(request.Description);

        if (!string.IsNullOrEmpty(request.Notes))
            certification.SetNotes(request.Notes);

        certification.SetRequiredForJob(request.RequiredForJob);

        await _unitOfWork.Certifications.AddAsync(certification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(certification.Id);
    }
}
