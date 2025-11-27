using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class RemoveOpportunityProductCommandHandler : IRequestHandler<RemoveOpportunityProductCommand, Result<Unit>>
{
    private readonly CRMDbContext _context;

    public RemoveOpportunityProductCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(RemoveOpportunityProductCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _context.Opportunities
            .Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.Id == request.OpportunityId && o.TenantId == request.TenantId, cancellationToken);

        if (opportunity == null)
            return Result<Unit>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.OpportunityId} not found"));

        var product = opportunity.Products.FirstOrDefault(p => p.Id == request.ProductId);
        if (product == null)
            return Result<Unit>.Failure(Error.NotFound("OpportunityProduct.NotFound", $"Product with ID {request.ProductId} not found in opportunity"));

        opportunity.RemoveProduct(product);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}