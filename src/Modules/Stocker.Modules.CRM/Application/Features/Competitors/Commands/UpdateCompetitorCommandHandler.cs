using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands;

public class UpdateCompetitorCommandHandler : IRequestHandler<UpdateCompetitorCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateCompetitorCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateCompetitorCommand request, CancellationToken cancellationToken)
    {
        var competitor = await _unitOfWork.Competitors.GetByIdAsync(request.Id, cancellationToken);

        if (competitor == null)
        {
            return Result<bool>.Failure(Error.NotFound("Competitor.NotFound", $"Competitor with ID {request.Id} not found"));
        }

        if (competitor.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Competitor.Forbidden", "You don't have permission to update this competitor"));
        }

        competitor.UpdateDetails(request.Name, request.Code, request.Description);

        if (request.ThreatLevel.HasValue)
            competitor.SetThreatLevel(request.ThreatLevel.Value);

        competitor.SetCompanyInfo(request.Website, request.Headquarters, request.FoundedYear, request.EmployeeCount);
        competitor.SetMarketInfo(request.TargetMarkets, request.Industries, request.GeographicCoverage, request.MarketShare);
        competitor.SetPricingInfo(request.PricingStrategy, request.PriceRange, request.PriceComparison);
        competitor.SetSalesMarketingInfo(request.SalesChannels, request.MarketingStrategy, request.KeyMessage);
        competitor.SetContactInfo(request.ContactPerson, request.Email, request.Phone);
        competitor.SetAnnualRevenue(request.AnnualRevenue);
        competitor.SetCustomerSegments(request.CustomerSegments);
        competitor.SetSocialMediaLinks(request.SocialMediaLinks);
        competitor.SetNotes(request.Notes);
        competitor.SetTags(request.Tags);

        await _unitOfWork.Competitors.UpdateAsync(competitor, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
