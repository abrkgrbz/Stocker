using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class DeleteSalesTeamCommandHandler : IRequestHandler<DeleteSalesTeamCommand, Result<bool>>
{
    private readonly ISalesTeamRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteSalesTeamCommandHandler(
        ISalesTeamRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSalesTeamCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (salesTeam == null)
        {
            return Result<bool>.Failure(Error.NotFound("SalesTeam.NotFound", $"Sales team with ID {request.Id} not found"));
        }

        if (salesTeam.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("SalesTeam.Forbidden", "You don't have permission to delete this sales team"));
        }

        salesTeam.Deactivate();
        await _repository.UpdateAsync(salesTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
