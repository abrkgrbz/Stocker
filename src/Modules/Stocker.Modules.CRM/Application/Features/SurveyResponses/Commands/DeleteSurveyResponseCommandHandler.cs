using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public class DeleteSurveyResponseCommandHandler : IRequestHandler<DeleteSurveyResponseCommand, Result<bool>>
{
    private readonly ISurveyResponseRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteSurveyResponseCommandHandler(
        ISurveyResponseRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSurveyResponseCommand request, CancellationToken cancellationToken)
    {
        var surveyResponse = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (surveyResponse == null)
            return Result<bool>.Failure(Error.NotFound("SurveyResponse.NotFound", "Survey response not found"));

        if (surveyResponse.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("SurveyResponse.Forbidden", "Access denied"));

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
