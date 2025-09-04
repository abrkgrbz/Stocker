using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CloseDealWonCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string? WonDetails { get; set; }
    public decimal? FinalAmount { get; set; }
}

public class CloseDealWonCommandValidator : AbstractValidator<CloseDealWonCommand>
{
    public CloseDealWonCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ActualCloseDate)
            .LessThanOrEqualTo(DateTime.UtcNow).When(x => x.ActualCloseDate.HasValue)
            .WithMessage("Actual close date cannot be in the future");

        RuleFor(x => x.WonDetails)
            .MaximumLength(1000).WithMessage("Won details must not exceed 1000 characters");

        RuleFor(x => x.FinalAmount)
            .GreaterThan(0).When(x => x.FinalAmount.HasValue)
            .WithMessage("Final amount must be greater than 0");
    }
}