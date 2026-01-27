using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionHistory;

public class GetSubscriptionHistoryQueryHandler : IRequestHandler<GetSubscriptionHistoryQuery, Result<List<SubscriptionHistoryDto>>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<GetSubscriptionHistoryQueryHandler> _logger;

    public GetSubscriptionHistoryQueryHandler(IMasterDbContext context, ILogger<GetSubscriptionHistoryQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<SubscriptionHistoryDto>>> Handle(GetSubscriptionHistoryQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if subscription exists
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

            if (subscription == null)
            {
                return Result<List<SubscriptionHistoryDto>>.Failure(Error.NotFound("Subscription.NotFound", "Subscription not found"));
            }

            // Get history from security audit logs related to this subscription
            var query = _context.SecurityAuditLogs
                .Where(a => a.Metadata != null && a.Metadata.Contains(request.SubscriptionId.ToString()))
                .OrderByDescending(a => a.Timestamp);

            var limitedQuery = request.Limit.HasValue
                ? query.Take(request.Limit.Value)
                : query.Take(50);

            var auditLogs = await limitedQuery.ToListAsync(cancellationToken);

            var history = auditLogs.Select(a => new SubscriptionHistoryDto(
                Id: a.Id,
                Action: a.Event,
                Description: GetActionDescription(a.Event),
                OldValue: null, // Could parse from metadata if structured
                NewValue: null,
                PerformedBy: a.Email,
                Timestamp: a.Timestamp
            )).ToList();

            // If no audit logs found, create synthetic history from subscription data
            if (!history.Any())
            {
                history = GenerateSyntheticHistory(subscription);
            }

            return Result<List<SubscriptionHistoryDto>>.Success(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription history for {SubscriptionId}", request.SubscriptionId);
            return Result<List<SubscriptionHistoryDto>>.Failure(Error.Failure("Subscription.History.Error", ex.Message));
        }
    }

    private static string GetActionDescription(string action)
    {
        return action.ToLower() switch
        {
            "subscription_created" => "Abonelik oluşturuldu",
            "subscription_activated" => "Abonelik aktif edildi",
            "subscription_suspended" => "Abonelik askıya alındı",
            "subscription_cancelled" => "Abonelik iptal edildi",
            "subscription_renewed" => "Abonelik yenilendi",
            "subscription_upgraded" => "Paket yükseltildi",
            "subscription_downgraded" => "Paket düşürüldü",
            "payment_received" => "Ödeme alındı",
            "payment_failed" => "Ödeme başarısız",
            _ => action
        };
    }

    private static List<SubscriptionHistoryDto> GenerateSyntheticHistory(Domain.Master.Entities.Subscription subscription)
    {
        var history = new List<SubscriptionHistoryDto>
        {
            new SubscriptionHistoryDto(
                Id: Guid.NewGuid(),
                Action: "subscription_created",
                Description: "Abonelik oluşturuldu",
                OldValue: null,
                NewValue: subscription.Status.ToString(),
                PerformedBy: "System",
                Timestamp: subscription.StartDate
            )
        };

        if (subscription.Status == Domain.Master.Enums.SubscriptionStatus.Aktif && subscription.TrialEndDate.HasValue)
        {
            history.Add(new SubscriptionHistoryDto(
                Id: Guid.NewGuid(),
                Action: "subscription_activated",
                Description: "Abonelik aktif edildi",
                OldValue: "Deneme",
                NewValue: "Aktif",
                PerformedBy: "System",
                Timestamp: subscription.TrialEndDate.Value
            ));
        }

        if (subscription.Status == Domain.Master.Enums.SubscriptionStatus.Askida)
        {
            history.Add(new SubscriptionHistoryDto(
                Id: Guid.NewGuid(),
                Action: "subscription_suspended",
                Description: "Abonelik askıya alındı",
                OldValue: "Aktif",
                NewValue: "Askıda",
                PerformedBy: "System",
                Timestamp: subscription.CurrentPeriodStart
            ));
        }

        if (subscription.Status == Domain.Master.Enums.SubscriptionStatus.IptalEdildi && subscription.CancelledAt.HasValue)
        {
            history.Add(new SubscriptionHistoryDto(
                Id: Guid.NewGuid(),
                Action: "subscription_cancelled",
                Description: $"Abonelik iptal edildi: {subscription.CancellationReason ?? "Sebep belirtilmedi"}",
                OldValue: "Aktif",
                NewValue: "İptal Edildi",
                PerformedBy: "System",
                Timestamp: subscription.CancelledAt.Value
            ));
        }

        return history.OrderByDescending(h => h.Timestamp).ToList();
    }
}
