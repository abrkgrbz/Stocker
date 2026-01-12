using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public class DeleteSurveyResponseCommandHandler : IRequestHandler<DeleteSurveyResponseCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteSurveyResponseCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSurveyResponseCommand request, CancellationToken cancellationToken)
    {
        var surveyResponse = await _unitOfWork.SurveyResponses.GetByIdAsync(request.Id, cancellationToken);

        if (surveyResponse == null)
            return Result<bool>.Failure(Error.NotFound("SurveyResponse.NotFound", "Survey response not found"));

        if (surveyResponse.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("SurveyResponse.Forbidden", "Access denied"));

        await _unitOfWork.SurveyResponses.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
