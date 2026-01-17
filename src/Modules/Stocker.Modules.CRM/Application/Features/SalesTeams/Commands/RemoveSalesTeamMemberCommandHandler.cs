using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class RemoveSalesTeamMemberCommandHandler : IRequestHandler<RemoveSalesTeamMemberCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RemoveSalesTeamMemberCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(RemoveSalesTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = await _unitOfWork.SalesTeams.GetByIdAsync(request.SalesTeamId, cancellationToken);

        if (salesTeam == null)
        {
            return Result<bool>.Failure(Error.NotFound("SalesTeam.NotFound", $"Sales team with ID {request.SalesTeamId} not found"));
        }

        if (salesTeam.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("SalesTeam.Forbidden", "You don't have permission to modify this sales team"));
        }

        salesTeam.RemoveMember(request.UserId);

        await _unitOfWork.SalesTeams.UpdateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
