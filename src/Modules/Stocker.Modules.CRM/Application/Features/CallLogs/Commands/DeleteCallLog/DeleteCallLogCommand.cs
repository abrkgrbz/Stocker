using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.DeleteCallLog;

public record DeleteCallLogCommand(Guid Id) : IRequest<Result<bool>>;
