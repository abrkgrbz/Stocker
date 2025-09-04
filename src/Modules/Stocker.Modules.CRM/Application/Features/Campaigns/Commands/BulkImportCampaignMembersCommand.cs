using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

/// <summary>
/// Command to bulk import campaign members
/// </summary>
public class BulkImportCampaignMembersCommand : IRequest<Result<BulkImportResultDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
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
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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