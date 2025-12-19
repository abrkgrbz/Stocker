using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

/// <summary>
/// Command to remove a product from a deal
/// </summary>
public class RemoveDealProductCommand : IRequest<Result<Unit>>
{
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
        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class RemoveDealProductCommandHandler : IRequestHandler<RemoveDealProductCommand, Result<Unit>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RemoveDealProductCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(RemoveDealProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == request.DealId && d.TenantId == tenantId, cancellationToken);

        if (deal == null)
            return Result<Unit>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.DealId} not found"));

        var product = deal.Products.FirstOrDefault(p => p.Id == request.ProductId);
        if (product == null)
            return Result<Unit>.Failure(Error.NotFound("DealProduct.NotFound", $"Product with ID {request.ProductId} not found in deal"));

        deal.RemoveProduct(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
