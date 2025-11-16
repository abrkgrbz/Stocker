using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Queries.GetReminders;

public class GetRemindersQueryHandler : IRequestHandler<GetRemindersQuery, Result<GetRemindersResponse>>
{
    private readonly IReminderRepository _reminderRepository;

    public GetRemindersQueryHandler(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async System.Threading.Tasks.Task<Result<GetRemindersResponse>> Handle(GetRemindersQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Reminder> reminders;
        int totalCount;

        // If querying by assigned user
        if (request.AssignedToUserId.HasValue)
        {
            if (request.Skip.HasValue && request.Take.HasValue)
            {
                // Get paged results - need to implement for assigned users
                var allReminders = await _reminderRepository.GetByAssignedUserIdAsync(
                    request.AssignedToUserId.Value,
                    request.PendingOnly,
                    cancellationToken);

                totalCount = allReminders.Count;
                reminders = allReminders
                    .Skip(request.Skip.Value)
                    .Take(request.Take.Value)
                    .ToList();
            }
            else
            {
                reminders = await _reminderRepository.GetByAssignedUserIdAsync(
                    request.AssignedToUserId.Value,
                    request.PendingOnly,
                    cancellationToken);
                totalCount = reminders.Count;
            }
        }
        // Query by user (creator)
        else
        {
            if (request.Skip.HasValue && request.Take.HasValue)
            {
                reminders = await _reminderRepository.GetPagedAsync(
                    request.UserId,
                    request.Skip.Value,
                    request.Take.Value,
                    request.PendingOnly,
                    cancellationToken);

                totalCount = await _reminderRepository.GetTotalCountAsync(
                    request.UserId,
                    request.PendingOnly,
                    cancellationToken);
            }
            else
            {
                reminders = await _reminderRepository.GetByUserIdAsync(
                    request.UserId,
                    request.PendingOnly,
                    cancellationToken);
                totalCount = reminders.Count;
            }
        }

        var reminderDtos = reminders.Select(r => new ReminderDto(
            r.Id,
            r.TenantId,
            r.UserId,
            r.Title,
            r.Description,
            r.RemindAt,
            r.Type,
            r.Status,
            r.RelatedEntityId,
            r.RelatedEntityType,
            r.CompletedAt,
            r.SnoozedUntil,
            r.SendEmail,
            r.SendPush,
            r.SendInApp,
            r.RecurrenceType,
            r.RecurrencePattern,
            r.RecurrenceEndDate,
            r.AssignedToUserId,
            r.DueDate,
            r.MeetingStartTime,
            r.MeetingEndTime,
            r.Participants,
            r.CreatedDate
        )).ToList();

        var response = new GetRemindersResponse(reminderDtos, totalCount);
        return Result<GetRemindersResponse>.Success(response);
    }
}
