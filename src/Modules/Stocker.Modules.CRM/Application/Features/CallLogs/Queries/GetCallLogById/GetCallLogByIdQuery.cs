using MediatR;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogById;

public record GetCallLogByIdQuery(Guid Id) : IRequest<Result<CallLogDto>>;
