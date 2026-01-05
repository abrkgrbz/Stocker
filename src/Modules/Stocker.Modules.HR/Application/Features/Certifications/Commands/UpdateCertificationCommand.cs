using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Certifications.Commands;

/// <summary>
/// Command to update a certification
/// </summary>
public record UpdateCertificationCommand : IRequest<Result<int>>
{
    public int CertificationId { get; init; }
    public CertificationStatus? Status { get; init; }
    public string? CertificationNumber { get; init; }
    public string? CredentialId { get; init; }
    public string? VerificationUrl { get; init; }
    public string? CertificationLevel { get; init; }
    public string? Specialization { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public DateTime? LastRenewalDate { get; init; }
    public DateTime? NextRenewalDate { get; init; }
    public int? CompletedTrainingHours { get; init; }
    public DateTime? TrainingCompletionDate { get; init; }
    public DateTime? ExamDate { get; init; }
    public decimal? ExamScore { get; init; }
    public int? EarnedCpeUnits { get; init; }
    public string? CertificateFileUrl { get; init; }
    public string? BadgeUrl { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public bool? RequiredForJob { get; init; }
}

/// <summary>
/// Handler for UpdateCertificationCommand
/// </summary>
public class UpdateCertificationCommandHandler : IRequestHandler<UpdateCertificationCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateCertificationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(UpdateCertificationCommand request, CancellationToken cancellationToken)
    {
        var certification = await _unitOfWork.Certifications.GetByIdAsync(request.CertificationId, cancellationToken);
        if (certification == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Certification", $"Certification with ID {request.CertificationId} not found"));
        }

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

        if (request.CompletedTrainingHours.HasValue && request.TrainingCompletionDate.HasValue)
            certification.CompleteTraining(request.CompletedTrainingHours.Value, request.TrainingCompletionDate.Value);

        if (request.EarnedCpeUnits.HasValue)
            certification.AddCpeUnits(request.EarnedCpeUnits.Value);

        if (!string.IsNullOrEmpty(request.CertificateFileUrl))
            certification.SetCertificateFileUrl(request.CertificateFileUrl);

        if (!string.IsNullOrEmpty(request.BadgeUrl))
            certification.SetBadgeUrl(request.BadgeUrl);

        if (!string.IsNullOrEmpty(request.Description))
            certification.SetDescription(request.Description);

        if (!string.IsNullOrEmpty(request.Notes))
            certification.SetNotes(request.Notes);

        if (request.RequiredForJob.HasValue)
            certification.SetRequiredForJob(request.RequiredForJob.Value);

        _unitOfWork.Certifications.Update(certification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(certification.Id);
    }
}
