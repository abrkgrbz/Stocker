using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.CreateCallLog;

public record CreateCallLogCommand(
    Guid TenantId,
    string CallNumber,
    CallDirection Direction,
    string CallerNumber,
    string CalledNumber,
    DateTime? StartTime = null,
    CallType? CallType = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    Guid? OpportunityId = null,
    int? AgentUserId = null,
    string? AgentName = null,
    string? Notes = null) : IRequest<Result<Guid>>;
