using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.SetFollowUp;

public record SetFollowUpCommand(
    Guid Id,
    DateTime FollowUpDate,
    string? FollowUpNote = null) : IRequest<Result<bool>>;
