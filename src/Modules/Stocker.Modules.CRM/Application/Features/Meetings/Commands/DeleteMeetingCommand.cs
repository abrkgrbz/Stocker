using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public record DeleteMeetingCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
