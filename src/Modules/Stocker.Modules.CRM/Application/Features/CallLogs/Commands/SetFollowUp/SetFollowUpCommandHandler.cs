using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.SetFollowUp;

public class SetFollowUpCommandHandler : IRequestHandler<SetFollowUpCommand, Result<bool>>
{
    private readonly ICallLogRepository _callLogRepository;

    public SetFollowUpCommandHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<bool>> Handle(SetFollowUpCommand request, CancellationToken cancellationToken)
    {
        var callLog = await _callLogRepository.GetByIdAsync(request.Id, cancellationToken);
        if (callLog == null)
        {
            return Result<bool>.Failure(new Error("CallLog.NotFound", "Call log not found", ErrorType.NotFound));
        }

        callLog.SetFollowUp(request.FollowUpDate, request.FollowUpNote);
        await _callLogRepository.UpdateAsync(callLog, cancellationToken);
        return Result<bool>.Success(true);
    }
}
