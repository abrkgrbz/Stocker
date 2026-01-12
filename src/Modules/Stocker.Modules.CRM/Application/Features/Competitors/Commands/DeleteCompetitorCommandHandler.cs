using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands;

public class DeleteCompetitorCommandHandler : IRequestHandler<DeleteCompetitorCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteCompetitorCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteCompetitorCommand request, CancellationToken cancellationToken)
    {
        var competitor = await _unitOfWork.Competitors.GetByIdAsync(request.Id, cancellationToken);

        if (competitor == null)
        {
            return Result<bool>.Failure(Error.NotFound("Competitor.NotFound", $"Competitor with ID {request.Id} not found"));
        }

        if (competitor.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Competitor.Forbidden", "You don't have permission to delete this competitor"));
        }

        competitor.Deactivate();
        await _unitOfWork.Competitors.UpdateAsync(competitor, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
