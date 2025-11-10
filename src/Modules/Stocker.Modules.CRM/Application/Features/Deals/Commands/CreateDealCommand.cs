using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CreateDealCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DealStatus Status { get; set; }
    public DealPriority Priority { get; set; }
    public Guid? PipelineId { get; set; }
    public Guid? StageId { get; set; }
    public DateTime ExpectedCloseDate { get; set; }
    public decimal Probability { get; set; }
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
}

public class CreateDealCommandValidator : AbstractValidator<CreateDealCommand>
{
    public CreateDealCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Deal title is required")
            .MaximumLength(200).WithMessage("Deal title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid deal status");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid deal priority");

        RuleFor(x => x.ExpectedCloseDate)
            .NotEmpty().WithMessage("Expected close date is required")
            .GreaterThan(DateTime.UtcNow).WithMessage("Expected close date must be in the future");

        RuleFor(x => x.Probability)
            .InclusiveBetween(0, 100).WithMessage("Probability must be between 0 and 100");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");

        RuleFor(x => x.Source)
            .MaximumLength(100).WithMessage("Source must not exceed 100 characters");
    }
}