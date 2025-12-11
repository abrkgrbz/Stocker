using MediatR;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogsByCustomer;

public class GetCallLogsByCustomerQueryHandler : IRequestHandler<GetCallLogsByCustomerQuery, Result<List<CallLogDto>>>
{
    private readonly ICallLogRepository _callLogRepository;

    public GetCallLogsByCustomerQueryHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<List<CallLogDto>>> Handle(GetCallLogsByCustomerQuery request, CancellationToken cancellationToken)
    {
        var callLogs = await _callLogRepository.GetByCustomerIdAsync(request.CustomerId, cancellationToken);

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

        return Result<List<CallLogDto>>.Success(callLogDtos);
    }
}
