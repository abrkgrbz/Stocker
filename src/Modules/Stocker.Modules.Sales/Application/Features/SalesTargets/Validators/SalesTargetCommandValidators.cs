using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesTargets.Commands;

namespace Stocker.Modules.Sales.Application.Features.SalesTargets.Validators;

public class CreateSalesTargetCommandValidator : AbstractValidator<CreateSalesTargetCommand>
{
    public CreateSalesTargetCommandValidator()
    {
        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Target name is required")
            .MaximumLength(200).WithMessage("Target name must not exceed 200 characters");

        RuleFor(x => x.Dto.TargetType)
            .NotEmpty().WithMessage("Target type is required");

        RuleFor(x => x.Dto.PeriodType)
            .NotEmpty().WithMessage("Period type is required");

        RuleFor(x => x.Dto.MetricType)
            .NotEmpty().WithMessage("Metric type is required");

        RuleFor(x => x.Dto.Year)
            .GreaterThan(2000).WithMessage("Year must be greater than 2000")
            .LessThan(2100).WithMessage("Year must be less than 2100");

        RuleFor(x => x.Dto.TotalTargetAmount)
            .GreaterThan(0).WithMessage("Total target amount must be greater than 0");

        RuleFor(x => x.Dto.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Dto.MinimumAchievementPercentage)
            .InclusiveBetween(0, 100).WithMessage("Minimum achievement percentage must be between 0 and 100");

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));
    }
}

public class AddTargetPeriodCommandValidator : AbstractValidator<AddTargetPeriodCommand>
{
    public AddTargetPeriodCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sales target ID is required");

        RuleFor(x => x.Dto.PeriodNumber)
            .GreaterThan(0).WithMessage("Period number must be greater than 0");

        RuleFor(x => x.Dto.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.Dto.EndDate)
            .GreaterThan(x => x.Dto.StartDate)
            .WithMessage("End date must be after start date");

        RuleFor(x => x.Dto.TargetAmount)
            .GreaterThan(0).WithMessage("Target amount must be greater than 0");
    }
}

public class AddTargetProductCommandValidator : AbstractValidator<AddTargetProductCommand>
{
    public AddTargetProductCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sales target ID is required");

        RuleFor(x => x.Dto.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Dto.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.Dto.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.Dto.TargetAmount)
            .GreaterThan(0).WithMessage("Target amount must be greater than 0");

        RuleFor(x => x.Dto.Weight)
            .InclusiveBetween(0, 100).WithMessage("Weight must be between 0 and 100");
    }
}

public class RecordAchievementCommandValidator : AbstractValidator<RecordAchievementCommand>
{
    public RecordAchievementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sales target ID is required");

        RuleFor(x => x.Dto.AchievementDate)
            .NotEmpty().WithMessage("Achievement date is required");

        RuleFor(x => x.Dto.Amount)
            .GreaterThan(0).WithMessage("Achievement amount must be greater than 0");
    }
}

public class AssignTargetToRepresentativeCommandValidator : AbstractValidator<AssignTargetToRepresentativeCommand>
{
    public AssignTargetToRepresentativeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sales target ID is required");

        RuleFor(x => x.Dto.AssigneeId)
            .NotEmpty().WithMessage("Assignee ID is required");

        RuleFor(x => x.Dto.AssigneeName)
            .NotEmpty().WithMessage("Assignee name is required")
            .MaximumLength(200).WithMessage("Assignee name must not exceed 200 characters");
    }
}

public class CancelSalesTargetCommandValidator : AbstractValidator<CancelSalesTargetCommand>
{
    public CancelSalesTargetCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sales target ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required")
            .MaximumLength(500).WithMessage("Cancellation reason must not exceed 500 characters");
    }
}
