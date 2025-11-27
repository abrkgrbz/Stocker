using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class ConvertCampaignMemberCommand : IRequest<Result<CampaignMemberDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CampaignId { get; set; }
    public Guid MemberId { get; set; }
    public Guid OpportunityId { get; set; }
}

public class ConvertCampaignMemberCommandValidator : AbstractValidator<ConvertCampaignMemberCommand>
{
    public ConvertCampaignMemberCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.MemberId)
            .NotEmpty().WithMessage("Member ID is required");

        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");
    }
}

public class ConvertCampaignMemberCommandHandler : IRequestHandler<ConvertCampaignMemberCommand, Result<CampaignMemberDto>>
{
    private readonly CRMDbContext _context;

    public ConvertCampaignMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CampaignMemberDto>> Handle(ConvertCampaignMemberCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return Result<CampaignMemberDto>.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.CampaignId} not found"));

        var member = campaign.Members.FirstOrDefault(m => m.Id == request.MemberId);

        if (member == null)
            return Result<CampaignMemberDto>.Failure(Error.NotFound("CampaignMember.NotFound", $"Member with ID {request.MemberId} not found"));

        member.MarkAsConverted(request.OpportunityId);
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
            ConvertedDate = member.ConvertedDate
        });
    }
}