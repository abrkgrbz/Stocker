using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Opportunities.Commands;

namespace Stocker.Modules.Sales.Application.Features.Opportunities.Validators;

public class CreateOpportunityCommandValidator : AbstractValidator<CreateOpportunityCommand>
{
    public CreateOpportunityCommandValidator()
    {
        RuleFor(x => x.Dto.Title)
            .NotEmpty().WithMessage("Opportunity title is required")
            .MaximumLength(200).WithMessage("Opportunity title must not exceed 200 characters");

        RuleFor(x => x.Dto.CustomerName)
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.CustomerName));

        RuleFor(x => x.Dto.EstimatedValue)
            .GreaterThan(0).WithMessage("Estimated value must be greater than 0");

        RuleFor(x => x.Dto.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Dto.ContactName)
            .MaximumLength(200).WithMessage("Contact name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.ContactName));

        RuleFor(x => x.Dto.ContactEmail)
            .EmailAddress().WithMessage("Invalid email address")
            .When(x => !string.IsNullOrEmpty(x.Dto.ContactEmail));

        RuleFor(x => x.Dto.ContactPhone)
            .MaximumLength(20).WithMessage("Contact phone must not exceed 20 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.ContactPhone));

        RuleFor(x => x.Dto.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));

        RuleFor(x => x.Dto.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Notes));

        RuleFor(x => x.Dto.SalesPersonName)
            .MaximumLength(200).WithMessage("Sales person name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.SalesPersonName));
    }
}

public class UpdateOpportunityStageCommandValidator : AbstractValidator<UpdateOpportunityStageCommand>
{
    public UpdateOpportunityStageCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.Dto.Stage)
            .NotEmpty().WithMessage("Stage is required")
            .MaximumLength(50).WithMessage("Stage must not exceed 50 characters");
    }
}

public class UpdateOpportunityValueCommandValidator : AbstractValidator<UpdateOpportunityValueCommand>
{
    public UpdateOpportunityValueCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.Dto.EstimatedValue)
            .GreaterThan(0).WithMessage("Estimated value must be greater than 0");

        RuleFor(x => x.Dto.Currency)
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Currency));
    }
}

public class MarkOpportunityLostCommandValidator : AbstractValidator<MarkOpportunityLostCommand>
{
    public MarkOpportunityLostCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.Dto.Reason)
            .NotEmpty().WithMessage("Lost reason is required")
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.Dto.LostToCompetitor)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.LostToCompetitor));
    }
}

public class AssignOpportunityCommandValidator : AbstractValidator<AssignOpportunityCommand>
{
    public AssignOpportunityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.Dto.SalesPersonId)
            .NotEmpty().WithMessage("Sales person ID is required");

        RuleFor(x => x.Dto.SalesPersonName)
            .MaximumLength(200).WithMessage("Sales person name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.SalesPersonName));
    }
}

public class ScheduleFollowUpCommandValidator : AbstractValidator<ScheduleFollowUpCommand>
{
    public ScheduleFollowUpCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.FollowUpDate)
            .NotEmpty().WithMessage("Follow-up date is required")
            .GreaterThan(DateTime.UtcNow.AddMinutes(-1))
            .WithMessage("Follow-up date must be in the future");
    }
}
