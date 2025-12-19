using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

/// <summary>
/// Command to bulk import campaign members
/// </summary>
public class BulkImportCampaignMembersCommand : IRequest<Result<BulkImportResultDto>>
{
    public Guid CampaignId { get; set; }
    public List<CampaignMemberImportDto> Members { get; set; } = new();
    public bool SkipDuplicates { get; set; } = true;
    public bool UpdateExisting { get; set; } = false;
    public string? DefaultStatus { get; set; }
    public string? DefaultSource { get; set; }
}

/// <summary>
/// DTO for importing campaign members
/// </summary>
public class CampaignMemberImportDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public string? Status { get; set; }
    public string? Source { get; set; }
    public DateTime? AddedDate { get; set; }
    public Dictionary<string, object>? CustomFields { get; set; }
}


/// <summary>
/// Validator for BulkImportCampaignMembersCommand
/// </summary>
public class BulkImportCampaignMembersCommandValidator : AbstractValidator<BulkImportCampaignMembersCommand>
{
    public BulkImportCampaignMembersCommandValidator()
    {
        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.Members)
            .NotEmpty().WithMessage("At least one member is required for import")
            .Must(x => x.Count <= 10000).WithMessage("Maximum 10,000 members can be imported at once");

        RuleFor(x => x.DefaultStatus)
            .MaximumLength(50).WithMessage("Default status must not exceed 50 characters");

        RuleFor(x => x.DefaultSource)
            .MaximumLength(100).WithMessage("Default source must not exceed 100 characters");

        RuleForEach(x => x.Members).ChildRules(member =>
        {
            member.RuleFor(m => m.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

            member.RuleFor(m => m.FirstName)
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            member.RuleFor(m => m.LastName)
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            member.RuleFor(m => m.Phone)
                .MaximumLength(50).WithMessage("Phone must not exceed 50 characters");

            member.RuleFor(m => m.CompanyName)
                .MaximumLength(200).WithMessage("Company name must not exceed 200 characters");

            member.RuleFor(m => m.JobTitle)
                .MaximumLength(100).WithMessage("Job title must not exceed 100 characters");

            member.RuleFor(m => m.Status)
                .MaximumLength(50).WithMessage("Status must not exceed 50 characters");

            member.RuleFor(m => m.Source)
                .MaximumLength(100).WithMessage("Source must not exceed 100 characters");

            member.RuleFor(m => m.AddedDate)
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Added date cannot be in the future")
                .When(m => m.AddedDate.HasValue);
        });
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class BulkImportCampaignMembersCommandHandler : IRequestHandler<BulkImportCampaignMembersCommand, Result<BulkImportResultDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public BulkImportCampaignMembersCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkImportResultDto>> Handle(BulkImportCampaignMembersCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return Result<BulkImportResultDto>.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.CampaignId} not found"));

        var result = new BulkImportResultDto
        {
            TotalRecords = request.Members.Count
        };

        var existingEmails = campaign.Members
            .Where(m => m.Lead != null)
            .Select(m => m.Lead!.Email?.ToLowerInvariant())
            .Where(e => e != null)
            .ToHashSet();

        foreach (var memberDto in request.Members)
        {
            try
            {
                var emailLower = memberDto.Email.ToLowerInvariant();

                if (request.SkipDuplicates && existingEmails.Contains(emailLower))
                {
                    result.FailedImports++;
                    result.Errors.Add($"Duplicate email: {memberDto.Email}");
                    continue;
                }

                // Create a new lead from the import data
                var leadResult = Lead.Create(
                    tenantId,
                    memberDto.FirstName ?? "Unknown",
                    memberDto.LastName ?? "Unknown",
                    memberDto.Email,
                    memberDto.CompanyName,
                    memberDto.Phone,
                    memberDto.Source ?? request.DefaultSource ?? "Campaign Import");

                if (leadResult.IsFailure)
                {
                    result.FailedImports++;
                    result.Errors.Add($"Error creating lead for {memberDto.Email}: {leadResult.Error.Description}");
                    continue;
                }

                var lead = leadResult.Value;
                await _unitOfWork.Repository<Lead>().AddAsync(lead);

                var member = new CampaignMember(
                    tenantId,
                    request.CampaignId,
                    null,
                    lead.Id);

                campaign.AddMember(member);
                existingEmails.Add(emailLower);
                result.SuccessfulImports++;
            }
            catch (Exception ex)
            {
                result.FailedImports++;
                result.Errors.Add($"Error importing {memberDto.Email}: {ex.Message}");
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkImportResultDto>.Success(result);
    }
}
