using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Queries.GetReminders;

public record GetRemindersQuery(
    Guid UserId,
    bool? PendingOnly = null,
    int? Skip = null,
    int? Take = null,
    Guid? AssignedToUserId = null) : IRequest<Result<GetRemindersResponse>>;
