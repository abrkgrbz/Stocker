using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.CompleteCallLog;

public class CompleteCallLogCommandHandler : IRequestHandler<CompleteCallLogCommand, Result<bool>>
{
    private readonly ICallLogRepository _callLogRepository;

    public CompleteCallLogCommandHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<bool>> Handle(CompleteCallLogCommand request, CancellationToken cancellationToken)
    {
        var callLog = await _callLogRepository.GetByIdAsync(request.Id, cancellationToken);
        if (callLog == null)
        {
            return Result<bool>.Failure(new Error("CallLog.NotFound", "Call log not found", ErrorType.NotFound));
        }

        callLog.Complete(request.Outcome, request.OutcomeDescription);

        if (!string.IsNullOrEmpty(request.Notes))
            callLog.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.Summary))
            callLog.SetSummary(request.Summary);

        await _callLogRepository.UpdateAsync(callLog, cancellationToken);
        return Result<bool>.Success(true);
    }
}
