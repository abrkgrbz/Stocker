using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public class UpdateTerritoryCommandHandler : IRequestHandler<UpdateTerritoryCommand, Result<bool>>
{
    private readonly ITerritoryRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateTerritoryCommandHandler(
        ITerritoryRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (territory == null)
            return Result<bool>.Failure(Error.NotFound("Territory.NotFound", "Territory not found"));

        if (territory.TenantId != request.TenantId)
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

        if (request.SalesTarget.HasValue && request.TargetYear.HasValue)
            territory.SetSalesTarget(request.SalesTarget.Value, request.TargetYear.Value);

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

        await _repository.UpdateAsync(territory, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
