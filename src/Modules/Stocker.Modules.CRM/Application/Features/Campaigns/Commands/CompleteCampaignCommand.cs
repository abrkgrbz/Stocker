using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class CompleteCampaignCommand : IRequest<Result<CampaignDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class CompleteCampaignCommandValidator : AbstractValidator<CompleteCampaignCommand>
{
    public CompleteCampaignCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Campaign ID is required");
    }
}

public class CompleteCampaignCommandHandler : IRequestHandler<CompleteCampaignCommand, Result<CampaignDto>>
{
    private readonly CRMDbContext _context;

    public CompleteCampaignCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CampaignDto>> Handle(CompleteCampaignCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return Result<CampaignDto>.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.Id} not found"));

        campaign.Complete();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CampaignDto>.Success(new CampaignDto
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Description = campaign.Description,
            Type = campaign.Type,
            Status = campaign.Status,
            StartDate = campaign.StartDate,
            EndDate = campaign.EndDate,
            BudgetedCost = campaign.BudgetedCost.Amount,
            ActualCost = campaign.ActualCost.Amount,
            ExpectedRevenue = campaign.ExpectedRevenue.Amount,
            ActualRevenue = campaign.ActualRevenue.Amount,
            TargetAudience = campaign.TargetAudience,
            TargetLeads = campaign.ExpectedResponse,
            OwnerId = campaign.OwnerId.ToString()
        });
    }
}