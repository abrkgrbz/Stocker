using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands;

public class CreateCompetitorCommandHandler : IRequestHandler<CreateCompetitorCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateCompetitorCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateCompetitorCommand request, CancellationToken cancellationToken)
    {
        var competitor = new Competitor(_unitOfWork.TenantId, request.Name);

        competitor.UpdateDetails(request.Name, request.Code, request.Description);
        competitor.SetThreatLevel(request.ThreatLevel);

        if (!string.IsNullOrEmpty(request.Website) || !string.IsNullOrEmpty(request.Headquarters) ||
            request.FoundedYear.HasValue || !string.IsNullOrEmpty(request.EmployeeCount))
        {
            competitor.SetCompanyInfo(request.Website, request.Headquarters, request.FoundedYear, request.EmployeeCount);
        }

        if (!string.IsNullOrEmpty(request.TargetMarkets) || !string.IsNullOrEmpty(request.Industries) ||
            !string.IsNullOrEmpty(request.GeographicCoverage) || request.MarketShare.HasValue)
        {
            competitor.SetMarketInfo(request.TargetMarkets, request.Industries, request.GeographicCoverage, request.MarketShare);
        }

        if (!string.IsNullOrEmpty(request.PricingStrategy) || !string.IsNullOrEmpty(request.PriceRange) ||
            request.PriceComparison.HasValue)
        {
            competitor.SetPricingInfo(request.PricingStrategy, request.PriceRange, request.PriceComparison);
        }

        if (!string.IsNullOrEmpty(request.SalesChannels) || !string.IsNullOrEmpty(request.MarketingStrategy) ||
            !string.IsNullOrEmpty(request.KeyMessage))
        {
            competitor.SetSalesMarketingInfo(request.SalesChannels, request.MarketingStrategy, request.KeyMessage);
        }

        if (!string.IsNullOrEmpty(request.ContactPerson) || !string.IsNullOrEmpty(request.Email) ||
            !string.IsNullOrEmpty(request.Phone))
        {
            competitor.SetContactInfo(request.ContactPerson, request.Email, request.Phone);
        }

        if (!string.IsNullOrEmpty(request.AnnualRevenue))
            competitor.SetAnnualRevenue(request.AnnualRevenue);

        if (!string.IsNullOrEmpty(request.CustomerSegments))
            competitor.SetCustomerSegments(request.CustomerSegments);

        if (!string.IsNullOrEmpty(request.SocialMediaLinks))
            competitor.SetSocialMediaLinks(request.SocialMediaLinks);

        if (!string.IsNullOrEmpty(request.Notes))
            competitor.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.Tags))
            competitor.SetTags(request.Tags);

        if (!request.IsActive)
            competitor.Deactivate();

        await _unitOfWork.Competitors.CreateAsync(competitor, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(competitor.Id);
    }
}
