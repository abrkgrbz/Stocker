using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class ConvertCampaignMemberCommand : IRequest<Result<CampaignMemberDto>>
{
    public Guid CampaignId { get; set; }
    public Guid MemberId { get; set; }
    public Guid OpportunityId { get; set; }
}

public class ConvertCampaignMemberCommandValidator : AbstractValidator<ConvertCampaignMemberCommand>
{
    public ConvertCampaignMemberCommandValidator()
    {
        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.MemberId)
            .NotEmpty().WithMessage("Member ID is required");

        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class ConvertCampaignMemberCommandHandler : IRequestHandler<ConvertCampaignMemberCommand, Result<CampaignMemberDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public ConvertCampaignMemberCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CampaignMemberDto>> Handle(ConvertCampaignMemberCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return Result<CampaignMemberDto>.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.CampaignId} not found"));

        var member = campaign.Members.FirstOrDefault(m => m.Id == request.MemberId);

        if (member == null)
            return Result<CampaignMemberDto>.Failure(Error.NotFound("CampaignMember.NotFound", $"Member with ID {request.MemberId} not found"));

        member.MarkAsConverted(request.OpportunityId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
