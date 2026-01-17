using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class UpdateLeadCommand : IRequest<Result<LeadDto>>
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public LeadStatus Status { get; set; }
    public LeadRating Rating { get; set; }
    public int Score { get; set; }
    public string? Source { get; set; }
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; }
    public int? NumberOfEmployees { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    // KVKK Consent Fields
    public bool KvkkDataProcessingConsent { get; set; }
    public bool KvkkMarketingConsent { get; set; }
    public bool KvkkCommunicationConsent { get; set; }
}

public class UpdateLeadCommandValidator : AbstractValidator<UpdateLeadCommand>
{
    public UpdateLeadCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Lead ID is required");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class UpdateLeadCommandHandler : IRequestHandler<UpdateLeadCommand, Result<LeadDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateLeadCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeadDto>> Handle(UpdateLeadCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var lead = await _unitOfWork.ReadRepository<Domain.Entities.Lead>().AsQueryable()
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == tenantId, cancellationToken);

        if (lead == null)
            return Result<LeadDto>.Failure(Error.NotFound("Lead.NotFound", $"Lead with ID {request.Id} not found"));

        // Update basic info
        var basicResult = lead.UpdateBasicInfo(
            request.FirstName,
            request.LastName,
            request.Email,
            request.CompanyName,
            request.Phone,
            request.MobilePhone);

        if (basicResult.IsFailure)
            return Result<LeadDto>.Failure(basicResult.Error);

        // Update business info
        var businessResult = lead.UpdateBusinessInfo(
            request.JobTitle,
            request.Industry,
            request.Website,
            request.AnnualRevenue,
            request.NumberOfEmployees);

        if (businessResult.IsFailure)
            return Result<LeadDto>.Failure(businessResult.Error);

        // Update address
        var addressResult = lead.UpdateAddress(
            request.Address,
            request.City,
            request.State,
            request.Country,
            request.PostalCode);

        if (addressResult.IsFailure)
            return Result<LeadDto>.Failure(addressResult.Error);

        // Update status and rating
        var statusResult = lead.UpdateStatus(request.Status);
        if (statusResult.IsFailure)
            return Result<LeadDto>.Failure(statusResult.Error);

        var ratingResult = lead.UpdateRating(request.Rating);
        if (ratingResult.IsFailure)
            return Result<LeadDto>.Failure(ratingResult.Error);

        // Update score
        var scoreResult = lead.SetScore(request.Score);
        if (scoreResult.IsFailure)
            return Result<LeadDto>.Failure(scoreResult.Error);

        // Update description
        lead.UpdateDescription(request.Description);

        // Update KVKK consent
        lead.UpdateKvkkConsent(
            request.KvkkDataProcessingConsent,
            request.KvkkMarketingConsent,
            request.KvkkCommunicationConsent);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LeadDto
        {
            Id = lead.Id,
            CompanyName = lead.CompanyName,
            FirstName = lead.FirstName,
            LastName = lead.LastName,
            FullName = lead.FullName,
            Email = lead.Email,
            Phone = lead.Phone,
            MobilePhone = lead.MobilePhone,
            JobTitle = lead.JobTitle,
            Industry = lead.Industry,
            Source = lead.Source,
            Status = lead.Status,
            Rating = lead.Rating,
            Address = lead.Address,
            City = lead.City,
            State = lead.State,
            Country = lead.Country,
            PostalCode = lead.PostalCode,
            Website = lead.Website,
            AnnualRevenue = lead.AnnualRevenue,
            NumberOfEmployees = lead.NumberOfEmployees,
            Description = lead.Description,
            AssignedToUserId = lead.AssignedToUserId,
            ConvertedDate = lead.ConvertedDate,
            ConvertedToCustomerId = lead.ConvertedToCustomerId,
            IsConverted = lead.IsConverted,
            Score = lead.Score,
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt,
            // KVKK Consent
            KvkkDataProcessingConsent = lead.KvkkDataProcessingConsent,
            KvkkMarketingConsent = lead.KvkkMarketingConsent,
            KvkkCommunicationConsent = lead.KvkkCommunicationConsent,
            KvkkConsentDate = lead.KvkkConsentDate
        };

        return Result<LeadDto>.Success(dto);
    }
}
