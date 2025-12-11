using MediatR;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogById;

public class GetCallLogByIdQueryHandler : IRequestHandler<GetCallLogByIdQuery, Result<CallLogDto>>
{
    private readonly ICallLogRepository _callLogRepository;

    public GetCallLogByIdQueryHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<CallLogDto>> Handle(GetCallLogByIdQuery request, CancellationToken cancellationToken)
    {
        var callLog = await _callLogRepository.GetByIdAsync(request.Id, cancellationToken);

        if (callLog == null)
        {
            return Result<CallLogDto>.Failure(new Error("CallLog.NotFound", "Call log not found", ErrorType.NotFound));
        }

        var dto = new CallLogDto(
            callLog.Id,
            callLog.TenantId,
            callLog.CallNumber,
            callLog.Direction,
            callLog.CallType,
            callLog.Status,
            callLog.StartTime,
            callLog.EndTime,
            callLog.DurationSeconds,
            callLog.WaitTimeSeconds,
            callLog.RingTimeSeconds,
            callLog.CallerNumber,
            callLog.CalledNumber,
            callLog.Extension,
            callLog.ForwardedTo,
            callLog.CustomerId,
            callLog.ContactId,
            callLog.LeadId,
            callLog.OpportunityId,
            callLog.TicketId,
            callLog.AgentUserId,
            callLog.AgentName,
            callLog.QueueName,
            callLog.Outcome,
            callLog.OutcomeDescription,
            callLog.FollowUpRequired,
            callLog.FollowUpDate,
            callLog.FollowUpNote,
            callLog.HasRecording,
            callLog.RecordingUrl,
            callLog.RecordingFileSize,
            callLog.Transcript,
            callLog.QualityScore,
            callLog.CustomerSatisfaction,
            callLog.QualityNotes,
            callLog.Notes,
            callLog.Summary,
            callLog.Tags,
            callLog.ExternalCallId,
            callLog.PbxType,
            callLog.CampaignId
        );

        return Result<CallLogDto>.Success(dto);
    }
}
