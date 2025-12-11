using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands;

public class DeleteCompetitorCommandHandler : IRequestHandler<DeleteCompetitorCommand, Result<bool>>
{
    private readonly ICompetitorRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteCompetitorCommandHandler(
        ICompetitorRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteCompetitorCommand request, CancellationToken cancellationToken)
    {
        var competitor = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (competitor == null)
        {
            return Result<bool>.Failure(Error.NotFound("Competitor.NotFound", $"Competitor with ID {request.Id} not found"));
        }

        if (competitor.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Competitor.Forbidden", "You don't have permission to delete this competitor"));
        }

        competitor.Deactivate();
        await _repository.UpdateAsync(competitor, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
