using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.CompleteCallLog;

public record CompleteCallLogCommand(
    Guid Id,
    CallOutcome Outcome,
    string? OutcomeDescription = null,
    string? Notes = null,
    string? Summary = null) : IRequest<Result<bool>>;
