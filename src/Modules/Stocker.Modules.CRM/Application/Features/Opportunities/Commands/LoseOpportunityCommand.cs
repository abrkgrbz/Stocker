using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to mark an opportunity as lost
/// </summary>
public class LoseOpportunityCommand : IRequest<Result<OpportunityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime? LostDate { get; set; }
    public string? LostReason { get; set; }
    public string? CompetitorName { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Validator for LoseOpportunityCommand
/// </summary>
public class LoseOpportunityCommandValidator : AbstractValidator<LoseOpportunityCommand>
{
    public LoseOpportunityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.LostDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Lost date cannot be in the future")
            .When(x => x.LostDate.HasValue);

        RuleFor(x => x.LostReason)
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");
    }
}