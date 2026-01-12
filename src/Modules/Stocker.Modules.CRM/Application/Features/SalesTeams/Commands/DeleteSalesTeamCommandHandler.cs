using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class DeleteSalesTeamCommandHandler : IRequestHandler<DeleteSalesTeamCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteSalesTeamCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSalesTeamCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = await _unitOfWork.SalesTeams.GetByIdAsync(request.Id, cancellationToken);

        if (salesTeam == null)
        {
            return Result<bool>.Failure(Error.NotFound("SalesTeam.NotFound", $"Sales team with ID {request.Id} not found"));
        }

        if (salesTeam.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("SalesTeam.Forbidden", "You don't have permission to delete this sales team"));
        }

        salesTeam.Deactivate();
        await _unitOfWork.SalesTeams.UpdateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
