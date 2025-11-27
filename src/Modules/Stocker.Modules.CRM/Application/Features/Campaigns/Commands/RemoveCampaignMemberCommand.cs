using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class RemoveCampaignMemberCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CampaignId { get; set; }
    public Guid MemberId { get; set; }
}

public class RemoveCampaignMemberCommandValidator : AbstractValidator<RemoveCampaignMemberCommand>
{
    public RemoveCampaignMemberCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.MemberId)
            .NotEmpty().WithMessage("Member ID is required");
    }
}

public class RemoveCampaignMemberCommandHandler : IRequestHandler<RemoveCampaignMemberCommand, Result>
{
    private readonly CRMDbContext _context;

    public RemoveCampaignMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(RemoveCampaignMemberCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return Result.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.CampaignId} not found"));

        var member = campaign.Members.FirstOrDefault(m => m.Id == request.MemberId);

        if (member == null)
            return Result.Failure(Error.NotFound("CampaignMember.NotFound", $"Member with ID {request.MemberId} not found"));

        campaign.RemoveMember(member);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}