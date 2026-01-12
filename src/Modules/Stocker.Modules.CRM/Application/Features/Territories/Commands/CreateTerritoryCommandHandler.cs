using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public class CreateTerritoryCommandHandler : IRequestHandler<CreateTerritoryCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateTerritoryCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = new Territory(
            _unitOfWork.TenantId,
            request.Name,
            request.Code,
            request.TerritoryType);

        if (request.Description != null)
            territory.UpdateDetails(request.Name, request.Code, request.Description);

        if (request.ParentTerritoryId.HasValue)
            territory.SetParentTerritory(request.ParentTerritoryId.Value, 2);

        if (request.Country != null || request.Region != null || request.City != null || request.District != null)
        {
            territory.SetGeographicInfo(
                request.Country,
                request.Region,
                request.City,
                request.District);
        }

        if (request.CountryCode != null)
            territory.SetCountryCode(request.CountryCode);

        if (request.PostalCodeRange != null)
            territory.SetPostalCodeRange(request.PostalCodeRange);

        if (request.SalesTarget.HasValue)
        {
            // Use provided year or default to current year
            var targetYear = request.TargetYear ?? DateTime.UtcNow.Year;
            territory.SetSalesTarget(request.SalesTarget.Value, targetYear);
        }

        if (request.Currency != "TRY")
            territory.SetCurrency(request.Currency);

        if (request.AssignedSalesTeamId.HasValue)
            territory.AssignToSalesTeam(request.AssignedSalesTeamId.Value);

        if (request.PrimarySalesRepId.HasValue)
            territory.SetPrimarySalesRep(request.PrimarySalesRepId.Value, request.PrimarySalesRepName);

        if (!request.IsActive)
            territory.Deactivate();

        await _unitOfWork.Territories.CreateAsync(territory, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(territory.Id);
    }
}
