using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.SetQualityScore;

public class SetQualityScoreCommandHandler : IRequestHandler<SetQualityScoreCommand, Result<bool>>
{
    private readonly ICallLogRepository _callLogRepository;

    public SetQualityScoreCommandHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<bool>> Handle(SetQualityScoreCommand request, CancellationToken cancellationToken)
    {
        var callLog = await _callLogRepository.GetByIdAsync(request.Id, cancellationToken);
        if (callLog == null)
        {
            return Result<bool>.Failure(new Error("CallLog.NotFound", "Call log not found", ErrorType.NotFound));
        }

        callLog.SetQualityScore(request.Score, request.CustomerSatisfaction, request.QualityNotes);
        await _callLogRepository.UpdateAsync(callLog, cancellationToken);
        return Result<bool>.Success(true);
    }
}
