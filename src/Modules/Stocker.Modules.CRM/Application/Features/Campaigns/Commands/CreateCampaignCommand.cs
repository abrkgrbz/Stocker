using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class CreateCampaignCommand : IRequest<Result<CampaignDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
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
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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