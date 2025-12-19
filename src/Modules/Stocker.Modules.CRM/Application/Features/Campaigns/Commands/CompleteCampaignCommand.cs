using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class CompleteCampaignCommand : IRequest<Result<CampaignDto>>
{
    public Guid Id { get; set; }
}

public class CompleteCampaignCommandValidator : AbstractValidator<CompleteCampaignCommand>
{
    public CompleteCampaignCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Campaign ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class CompleteCampaignCommandHandler : IRequestHandler<CompleteCampaignCommand, Result<CampaignDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CompleteCampaignCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CampaignDto>> Handle(CompleteCampaignCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return Result<CampaignDto>.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.Id} not found"));

        campaign.Complete();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
