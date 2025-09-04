using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class CreateActivityCommand : IRequest<Result<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ActivityType Type { get; set; }
    public ActivityStatus Status { get; set; }
    public ActivityPriority Priority { get; set; }
    public DateTime DueDate { get; set; }
    public int? Duration { get; set; }
    public string? Location { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? DealId { get; set; }
    public string? AssignedToId { get; set; }
    public string? Notes { get; set; }
}

public class CreateActivityCommandValidator : AbstractValidator<CreateActivityCommand>
{
    public CreateActivityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required")
            .MaximumLength(200).WithMessage("Subject must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid activity type");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid activity status");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid activity priority");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required");

        RuleFor(x => x.Duration)
            .GreaterThan(0).When(x => x.Duration.HasValue)
            .WithMessage("Duration must be greater than 0");

        RuleFor(x => x.Location)
            .MaximumLength(500).WithMessage("Location must not exceed 500 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");

        RuleFor(x => x)
            .Must(HaveAtLeastOneRelatedEntity)
            .WithMessage("Activity must be related to at least one entity (Lead, Customer, Contact, Opportunity, or Deal)");
    }

    private static bool HaveAtLeastOneRelatedEntity(CreateActivityCommand command)
    {
        return command.LeadId.HasValue ||
               command.CustomerId.HasValue ||
               command.ContactId.HasValue ||
               command.OpportunityId.HasValue ||
               command.DealId.HasValue;
    }
}