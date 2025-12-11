using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class CreateSalesTeamCommandHandler : IRequestHandler<CreateSalesTeamCommand, Result<Guid>>
{
    private readonly ISalesTeamRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateSalesTeamCommandHandler(
        ISalesTeamRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateSalesTeamCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = new SalesTeam(
            request.TenantId,
            request.Name,
            request.Code);

        if (!string.IsNullOrEmpty(request.Description))
            salesTeam.SetDescription(request.Description);

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

        if (!request.IsActive)
            salesTeam.Deactivate();

        await _repository.CreateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(salesTeam.Id);
    }
}
