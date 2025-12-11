using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public class CreateProductInterestCommandHandler : IRequestHandler<CreateProductInterestCommand, Result<Guid>>
{
    private readonly IProductInterestRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateProductInterestCommandHandler(
        IProductInterestRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateProductInterestCommand request, CancellationToken cancellationToken)
    {
        var productInterest = new ProductInterest(
            request.TenantId,
            request.ProductId,
            request.ProductName,
            request.InterestLevel);

        productInterest.SetSource(request.Source);

        if (request.CustomerId.HasValue)
            productInterest.RelateToCustomer(request.CustomerId.Value);

        if (request.ContactId.HasValue)
            productInterest.RelateToContact(request.ContactId.Value);

        if (request.LeadId.HasValue)
            productInterest.RelateToLead(request.LeadId.Value);

        if (request.OpportunityId.HasValue)
            productInterest.RelateToOpportunity(request.OpportunityId.Value);

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

        if (request.CampaignId.HasValue)
            productInterest.RelateToCampaign(request.CampaignId.Value);

        if (!string.IsNullOrEmpty(request.PromoCode))
            productInterest.SetPromoCode(request.PromoCode);

        await _repository.CreateAsync(productInterest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(productInterest.Id);
    }
}
