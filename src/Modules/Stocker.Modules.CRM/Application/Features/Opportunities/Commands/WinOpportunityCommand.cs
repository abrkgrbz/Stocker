using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to mark an opportunity as won
/// </summary>
public class WinOpportunityCommand : IRequest<Result<OpportunityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime? WonDate { get; set; }
    public string? WinReason { get; set; }
    public string? Notes { get; set; }
    public decimal? ActualAmount { get; set; }
    public bool CreateDeal { get; set; } = true;
}

/// <summary>
/// Validator for WinOpportunityCommand
/// </summary>
public class WinOpportunityCommandValidator : AbstractValidator<WinOpportunityCommand>
{
    public WinOpportunityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.WonDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Won date cannot be in the future")
            .When(x => x.WonDate.HasValue);

        RuleFor(x => x.WinReason)
            .MaximumLength(500).WithMessage("Win reason must not exceed 500 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");

        RuleFor(x => x.ActualAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Actual amount must be greater than or equal to 0")
            .When(x => x.ActualAmount.HasValue);
    }
}