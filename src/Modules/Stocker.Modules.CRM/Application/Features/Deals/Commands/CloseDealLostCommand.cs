using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CloseDealLostCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string LostReason { get; set; } = string.Empty;
    public string? CompetitorName { get; set; }
}

public class CloseDealLostCommandValidator : AbstractValidator<CloseDealLostCommand>
{
    public CloseDealLostCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ActualCloseDate)
            .LessThanOrEqualTo(DateTime.UtcNow).When(x => x.ActualCloseDate.HasValue)
            .WithMessage("Actual close date cannot be in the future");

        RuleFor(x => x.LostReason)
            .NotEmpty().WithMessage("Lost reason is required")
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");
    }
}