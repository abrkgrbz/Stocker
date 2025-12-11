using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.DeleteCallLog;

public class DeleteCallLogCommandHandler : IRequestHandler<DeleteCallLogCommand, Result<bool>>
{
    private readonly ICallLogRepository _callLogRepository;

    public DeleteCallLogCommandHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<bool>> Handle(DeleteCallLogCommand request, CancellationToken cancellationToken)
    {
        var callLog = await _callLogRepository.GetByIdAsync(request.Id, cancellationToken);
        if (callLog == null)
        {
            return Result<bool>.Failure(new Error("CallLog.NotFound", "Call log not found", ErrorType.NotFound));
        }

        await _callLogRepository.DeleteAsync(request.Id, cancellationToken);
        return Result<bool>.Success(true);
    }
}
