using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;

public class GetCallLogsQueryHandler : IRequestHandler<GetCallLogsQuery, Result<GetCallLogsResponse>>
{
    private readonly ICallLogRepository _callLogRepository;

    public GetCallLogsQueryHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<GetCallLogsResponse>> Handle(GetCallLogsQuery request, CancellationToken cancellationToken)
    {
        var callLogs = await _callLogRepository.GetAllAsync(
            request.CustomerId,
            request.ContactId,
            request.Direction,
            request.Status,
            request.StartDate,
            request.EndDate,
            request.Skip,
            request.Take,
            cancellationToken);

        var totalCount = await _callLogRepository.GetTotalCountAsync(
            request.CustomerId,
            request.ContactId,
            request.Direction,
            request.Status,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        var callLogDtos = callLogs.Select(c => new CallLogDto(
            c.Id,
            c.TenantId,
            c.CallNumber,
            c.Direction,
            c.CallType,
            c.Status,
            c.StartTime,
            c.EndTime,
            c.DurationSeconds,
            c.WaitTimeSeconds,
            c.RingTimeSeconds,
            c.CallerNumber,
            c.CalledNumber,
            c.Extension,
            c.ForwardedTo,
            c.CustomerId,
            c.ContactId,
            c.LeadId,
            c.OpportunityId,
            c.TicketId,
            c.AgentUserId,
            c.AgentName,
            c.QueueName,
            c.Outcome,
            c.OutcomeDescription,
            c.FollowUpRequired,
            c.FollowUpDate,
            c.FollowUpNote,
            c.HasRecording,
            c.RecordingUrl,
            c.RecordingFileSize,
            c.Transcript,
            c.QualityScore,
            c.CustomerSatisfaction,
            c.QualityNotes,
            c.Notes,
            c.Summary,
            c.Tags,
            c.ExternalCallId,
            c.PbxType,
            c.CampaignId
        )).ToList();

        return Result<GetCallLogsResponse>.Success(new GetCallLogsResponse(callLogDtos, totalCount));
    }
}
