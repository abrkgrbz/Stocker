using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class RemoveDealProductCommandHandler : IRequestHandler<RemoveDealProductCommand, Result<Unit>>
{
    private readonly CRMDbContext _context;

    public RemoveDealProductCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(RemoveDealProductCommand request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == request.DealId && d.TenantId == request.TenantId, cancellationToken);

        if (deal == null)
            return Result<Unit>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.DealId} not found"));

        var product = deal.Products.FirstOrDefault(p => p.Id == request.ProductId);
        if (product == null)
            return Result<Unit>.Failure(Error.NotFound("DealProduct.NotFound", $"Product with ID {request.ProductId} not found in deal"));

        deal.RemoveProduct(product);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}