using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class AddCampaignMemberCommand : IRequest<Result<CampaignMemberDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CampaignId { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? ContactId { get; set; }
    public CampaignMemberStatus Status { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public class AddCampaignMemberCommandValidator : AbstractValidator<AddCampaignMemberCommand>
{
    public AddCampaignMemberCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid campaign member status");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email format");

        RuleFor(x => x)
            .Must(HaveLeadOrContact)
            .WithMessage("Either Lead ID or Contact ID must be provided");
    }

    private static bool HaveLeadOrContact(AddCampaignMemberCommand command)
    {
        return command.LeadId.HasValue || command.ContactId.HasValue;
    }
}