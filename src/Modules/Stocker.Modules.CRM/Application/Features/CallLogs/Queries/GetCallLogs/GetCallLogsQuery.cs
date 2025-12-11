using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;

public record GetCallLogsQuery(
    Guid? CustomerId = null,
    Guid? ContactId = null,
    CallDirection? Direction = null,
    CallStatus? Status = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int Skip = 0,
    int Take = 100) : IRequest<Result<GetCallLogsResponse>>;
