using FluentValidation;
using MediatR;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to remove a product from an opportunity
/// </summary>
public class RemoveOpportunityProductCommand : IRequest<Result<Unit>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid OpportunityId { get; set; }
    public Guid ProductId { get; set; }
}

/// <summary>
/// Validator for RemoveOpportunityProductCommand
/// </summary>
public class RemoveOpportunityProductCommandValidator : AbstractValidator<RemoveOpportunityProductCommand>
{
    public RemoveOpportunityProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");
    }
}