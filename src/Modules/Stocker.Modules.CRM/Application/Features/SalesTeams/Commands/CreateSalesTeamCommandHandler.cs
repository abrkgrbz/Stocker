using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class CreateSalesTeamCommandHandler : IRequestHandler<CreateSalesTeamCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateSalesTeamCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateSalesTeamCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = new SalesTeam(
            _unitOfWork.TenantId,
            request.Name,
            request.Code);

        if (!string.IsNullOrEmpty(request.Description))
            salesTeam.SetDescription(request.Description);

        // Set team leader - either with ID or just name
        if (request.TeamLeaderId.HasValue)
            salesTeam.SetTeamLeader(request.TeamLeaderId.Value, request.TeamLeaderName);
        else if (!string.IsNullOrEmpty(request.TeamLeaderName))
            salesTeam.SetTeamLeaderName(request.TeamLeaderName);

        if (request.ParentTeamId.HasValue)
            salesTeam.SetParentTeam(request.ParentTeamId.Value);

        if (request.SalesTarget.HasValue && !string.IsNullOrEmpty(request.TargetPeriod))
            salesTeam.SetSalesTarget(request.SalesTarget.Value, request.TargetPeriod);

        if (!string.IsNullOrEmpty(request.Currency))
            salesTeam.SetCurrency(request.Currency);

        // Set territory - get territory name if not provided
        if (request.TerritoryId.HasValue)
        {
            var territoryNames = request.TerritoryNames;
            if (string.IsNullOrEmpty(territoryNames))
            {
                var territory = await _unitOfWork.ReadRepository<Territory>().GetByIdAsync(request.TerritoryId.Value, cancellationToken);
                territoryNames = territory?.Name;
            }
            salesTeam.SetTerritory(request.TerritoryId.Value, territoryNames);
        }

        if (!string.IsNullOrEmpty(request.TeamEmail))
            salesTeam.SetTeamEmail(request.TeamEmail);

        if (!string.IsNullOrEmpty(request.CommunicationChannel))
            salesTeam.SetCommunicationChannel(request.CommunicationChannel);

        if (!request.IsActive)
            salesTeam.Deactivate();

        await _unitOfWork.SalesTeams.CreateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(salesTeam.Id);
    }
}
