using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public class UpdateProductInterestCommandHandler : IRequestHandler<UpdateProductInterestCommand, Result<bool>>
{
    private readonly IProductInterestRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateProductInterestCommandHandler(
        IProductInterestRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateProductInterestCommand request, CancellationToken cancellationToken)
    {
        var productInterest = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (productInterest == null)
        {
            return Result<bool>.Failure(Error.NotFound("ProductInterest.NotFound", $"Product interest with ID {request.Id} not found"));
        }

        if (productInterest.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("ProductInterest.Forbidden", "You don't have permission to update this product interest"));
        }

        if (request.InterestLevel.HasValue)
            productInterest.UpdateInterestLevel(request.InterestLevel.Value);

        if (request.Source.HasValue)
            productInterest.SetSource(request.Source.Value);

        if (!string.IsNullOrEmpty(request.ProductCategory))
            productInterest.SetProductCategory(request.ProductCategory);

        if (request.InterestedQuantity.HasValue || !string.IsNullOrEmpty(request.Unit) || request.EstimatedBudget.HasValue)
            productInterest.SetQuantityAndBudget(request.InterestedQuantity, request.Unit, request.EstimatedBudget);

        if (!string.IsNullOrEmpty(request.Currency))
            productInterest.SetCurrency(request.Currency);

        if (request.QuotedPrice.HasValue)
            productInterest.SetQuotedPrice(request.QuotedPrice.Value);

        if (request.ExpectedPurchaseDate.HasValue)
            productInterest.SetExpectedPurchaseDate(request.ExpectedPurchaseDate);

        if (!string.IsNullOrEmpty(request.InterestReason))
            productInterest.SetInterestReason(request.InterestReason);

        if (!string.IsNullOrEmpty(request.Requirements))
            productInterest.SetRequirements(request.Requirements);

        if (!string.IsNullOrEmpty(request.Notes))
            productInterest.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.CompetitorProducts))
            productInterest.SetCompetitorProducts(request.CompetitorProducts);

        if (!string.IsNullOrEmpty(request.PromoCode))
            productInterest.SetPromoCode(request.PromoCode);

        if (request.PurchaseProbability.HasValue)
            productInterest.SetPurchaseProbability(request.PurchaseProbability.Value);

        await _repository.UpdateAsync(productInterest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
