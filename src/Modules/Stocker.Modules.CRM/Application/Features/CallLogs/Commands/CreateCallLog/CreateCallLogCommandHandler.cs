using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.CreateCallLog;

public class CreateCallLogCommandHandler : IRequestHandler<CreateCallLogCommand, Result<Guid>>
{
    private readonly ICallLogRepository _callLogRepository;

    public CreateCallLogCommandHandler(ICallLogRepository callLogRepository)
    {
        _callLogRepository = callLogRepository;
    }

    public async Task<Result<Guid>> Handle(CreateCallLogCommand request, CancellationToken cancellationToken)
    {
        var callLog = new CallLog(
            request.TenantId,
            request.CallNumber,
            request.Direction,
            request.CallerNumber,
            request.CalledNumber,
            request.StartTime ?? DateTime.UtcNow);

        if (request.CallType.HasValue)
            callLog.SetCallType(request.CallType.Value);

        if (request.CustomerId.HasValue)
            callLog.RelateToCustomer(request.CustomerId.Value);

        if (request.ContactId.HasValue)
            callLog.RelateToContact(request.ContactId.Value);

        if (request.LeadId.HasValue)
            callLog.RelateToLead(request.LeadId.Value);

        if (request.OpportunityId.HasValue)
            callLog.RelateToOpportunity(request.OpportunityId.Value);

        if (request.AgentUserId.HasValue)
            callLog.SetAgent(request.AgentUserId.Value, request.AgentName);

        if (!string.IsNullOrEmpty(request.Notes))
            callLog.SetNotes(request.Notes);

        var createdCallLog = await _callLogRepository.CreateAsync(callLog, cancellationToken);
        return Result<Guid>.Success(createdCallLog.Id);
    }
}
