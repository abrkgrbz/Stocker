using MediatR;
using Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogsByCustomer;

public record GetCallLogsByCustomerQuery(Guid CustomerId) : IRequest<Result<List<CallLogDto>>>;
