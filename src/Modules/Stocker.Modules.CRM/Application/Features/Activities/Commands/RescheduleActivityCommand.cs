using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class RescheduleActivityCommand : IRequest<Result<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime NewDueDate { get; set; }
    public string? RescheduleReason { get; set; }
}

public class RescheduleActivityCommandValidator : AbstractValidator<RescheduleActivityCommand>
{
    public RescheduleActivityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");

        RuleFor(x => x.NewDueDate)
            .NotEmpty().WithMessage("New due date is required")
            .GreaterThan(DateTime.UtcNow).WithMessage("New due date must be in the future");

        RuleFor(x => x.RescheduleReason)
            .MaximumLength(500).WithMessage("Reschedule reason must not exceed 500 characters");
    }
}