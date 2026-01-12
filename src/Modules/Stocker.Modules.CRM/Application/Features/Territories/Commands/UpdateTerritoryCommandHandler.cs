using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public class UpdateTerritoryCommandHandler : IRequestHandler<UpdateTerritoryCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateTerritoryCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.Territories.GetByIdAsync(request.Id, cancellationToken);

        if (territory == null)
            return Result<bool>.Failure(Error.NotFound("Territory.NotFound", "Territory not found"));

        if (territory.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("Territory.Forbidden", "Access denied"));

        if (request.Name != null || request.Code != null)
        {
            territory.UpdateDetails(
                request.Name ?? territory.Name,
                request.Code ?? territory.Code,
                request.Description);
        }

        if (request.Country != null || request.Region != null || request.City != null || request.District != null)
        {
            territory.SetGeographicInfo(
                request.Country,
                request.Region,
                request.City,
                request.District);
        }

        if (request.PostalCodeRange != null)
            territory.SetPostalCodeRange(request.PostalCodeRange);

        if (request.SalesTarget.HasValue)
        {
            // Use provided year or default to current year
            var targetYear = request.TargetYear ?? DateTime.UtcNow.Year;
            territory.SetSalesTarget(request.SalesTarget.Value, targetYear);
        }

        if (request.AssignedSalesTeamId.HasValue)
            territory.AssignToSalesTeam(request.AssignedSalesTeamId.Value);

        if (request.PrimarySalesRepId.HasValue)
            territory.SetPrimarySalesRep(request.PrimarySalesRepId.Value, request.PrimarySalesRepName);

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                territory.Activate();
            else
                territory.Deactivate();
        }

        await _unitOfWork.Territories.UpdateAsync(territory, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
