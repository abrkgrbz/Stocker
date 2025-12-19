using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class RemoveCampaignMemberCommand : IRequest<Result>
{
    public Guid CampaignId { get; set; }
    public Guid MemberId { get; set; }
}

public class RemoveCampaignMemberCommandValidator : AbstractValidator<RemoveCampaignMemberCommand>
{
    public RemoveCampaignMemberCommandValidator()
    {
        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.MemberId)
            .NotEmpty().WithMessage("Member ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class RemoveCampaignMemberCommandHandler : IRequestHandler<RemoveCampaignMemberCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RemoveCampaignMemberCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemoveCampaignMemberCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return Result.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.CampaignId} not found"));

        var member = campaign.Members.FirstOrDefault(m => m.Id == request.MemberId);

        if (member == null)
            return Result.Failure(Error.NotFound("CampaignMember.NotFound", $"Member with ID {request.MemberId} not found"));

        campaign.RemoveMember(member);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
