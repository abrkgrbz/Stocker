using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class UpdateSalesTeamCommandHandler : IRequestHandler<UpdateSalesTeamCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateSalesTeamCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateSalesTeamCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = await _unitOfWork.SalesTeams.GetByIdAsync(request.Id, cancellationToken);

        if (salesTeam == null)
        {
            return Result<bool>.Failure(Error.NotFound("SalesTeam.NotFound", $"Sales team with ID {request.Id} not found"));
        }

        if (salesTeam.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("SalesTeam.Forbidden", "You don't have permission to update this sales team"));
        }

        salesTeam.UpdateDetails(request.Name, request.Code, request.Description);

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

        if (request.TerritoryId.HasValue)
            salesTeam.SetTerritory(request.TerritoryId.Value, request.TerritoryNames);

        if (!string.IsNullOrEmpty(request.TeamEmail))
            salesTeam.SetTeamEmail(request.TeamEmail);

        if (!string.IsNullOrEmpty(request.CommunicationChannel))
            salesTeam.SetCommunicationChannel(request.CommunicationChannel);

        await _unitOfWork.SalesTeams.UpdateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
