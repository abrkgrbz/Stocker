using FluentValidation;
using MediatR;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

/// <summary>
/// Command to remove a product from a deal
/// </summary>
public class RemoveDealProductCommand : IRequest<Result<Unit>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid DealId { get; set; }
    public Guid ProductId { get; set; }
}

/// <summary>
/// Validator for RemoveDealProductCommand
/// </summary>
public class RemoveDealProductCommandValidator : AbstractValidator<RemoveDealProductCommand>
{
    public RemoveDealProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");
    }
}