using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class CreateCampaignCommand : IRequest<Result<CampaignDto>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignType Type { get; set; }
    public CampaignStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal BudgetedCost { get; set; }
    public decimal ExpectedRevenue { get; set; }
    public string? TargetAudience { get; set; }
    public int TargetLeads { get; set; }
    public string? OwnerId { get; set; }
}

public class CreateCampaignCommandValidator : AbstractValidator<CreateCampaignCommand>
{
    public CreateCampaignCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Campaign name is required")
            .MaximumLength(200).WithMessage("Campaign name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid campaign type");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid campaign status");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date");

        RuleFor(x => x.BudgetedCost)
            .GreaterThanOrEqualTo(0).WithMessage("Budgeted cost cannot be negative");

        RuleFor(x => x.ExpectedRevenue)
            .GreaterThanOrEqualTo(0).WithMessage("Expected revenue cannot be negative");

        RuleFor(x => x.TargetAudience)
            .MaximumLength(500).WithMessage("Target audience must not exceed 500 characters");

        RuleFor(x => x.TargetLeads)
            .GreaterThan(0).WithMessage("Target leads must be greater than 0");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class CreateCampaignCommandHandler : IRequestHandler<CreateCampaignCommand, Result<CampaignDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateCampaignCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CampaignDto>> Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var ownerId = 0;
        if (!string.IsNullOrEmpty(request.OwnerId) && int.TryParse(request.OwnerId, out var parsedOwnerId))
        {
            ownerId = parsedOwnerId;
        }

        var campaign = new Campaign(
            tenantId,
            request.Name,
            request.Type,
            request.StartDate,
            request.EndDate,
            Money.Create(request.BudgetedCost, "USD"),
            ownerId);

        campaign.UpdateDetails(request.Name, request.Description, request.TargetAudience, null);
        campaign.UpdateBudget(
            Money.Create(request.BudgetedCost, "USD"),
            Money.Create(request.ExpectedRevenue, "USD"),
            request.TargetLeads);

        await _unitOfWork.Repository<Campaign>().AddAsync(campaign);
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
