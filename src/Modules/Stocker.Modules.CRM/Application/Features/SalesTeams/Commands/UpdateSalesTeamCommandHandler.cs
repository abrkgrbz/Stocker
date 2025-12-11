using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class UpdateSalesTeamCommandHandler : IRequestHandler<UpdateSalesTeamCommand, Result<bool>>
{
    private readonly ISalesTeamRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateSalesTeamCommandHandler(
        ISalesTeamRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateSalesTeamCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (salesTeam == null)
        {
            return Result<bool>.Failure(Error.NotFound("SalesTeam.NotFound", $"Sales team with ID {request.Id} not found"));
        }

        if (salesTeam.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("SalesTeam.Forbidden", "You don't have permission to update this sales team"));
        }

        salesTeam.UpdateDetails(request.Name, request.Code, request.Description);

        if (request.TeamLeaderId.HasValue)
            salesTeam.SetTeamLeader(request.TeamLeaderId.Value, request.TeamLeaderName);

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

        await _repository.UpdateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
