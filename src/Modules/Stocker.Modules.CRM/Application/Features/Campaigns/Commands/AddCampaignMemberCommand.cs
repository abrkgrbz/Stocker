using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class AddCampaignMemberCommandHandler : IRequestHandler<AddCampaignMemberCommand, Result<CampaignMemberDto>>
{
    private readonly CRMDbContext _context;

    public AddCampaignMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CampaignMemberDto>> Handle(AddCampaignMemberCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return Result<CampaignMemberDto>.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.CampaignId} not found"));

        // Check if member already exists
        var existingMember = campaign.Members.FirstOrDefault(m =>
            (request.LeadId.HasValue && m.LeadId == request.LeadId) ||
            (request.ContactId.HasValue && m.ContactId == request.ContactId));

        if (existingMember != null)
            return Result<CampaignMemberDto>.Failure(Error.Conflict("CampaignMember.AlreadyExists", "Member already exists in this campaign"));

        var member = new CampaignMember(
            request.TenantId,
            request.CampaignId,
            request.ContactId,
            request.LeadId);

        campaign.AddMember(member);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CampaignMemberDto>.Success(new CampaignMemberDto
        {
            Id = member.Id,
            CampaignId = member.CampaignId,
            CampaignName = campaign.Name,
            LeadId = member.LeadId,
            ContactId = member.ContactId,
            Status = member.Status,
            HasResponded = member.RespondedDate.HasValue,
            RespondedDate = member.RespondedDate,
            IsConverted = member.HasConverted,
            ConvertedDate = member.ConvertedDate,
            Email = request.Email,
            Phone = request.Phone
        });
    }
}