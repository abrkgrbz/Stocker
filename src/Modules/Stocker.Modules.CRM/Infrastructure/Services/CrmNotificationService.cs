using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Services;
using Stocker.SignalR.Models.Notifications;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Modules.CRM.Infrastructure.Services;

/// <summary>
/// SignalR-based implementation of CRM notification service.
/// </summary>
public class CrmNotificationService : ICrmNotificationService
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<CrmNotificationService> _logger;

    public CrmNotificationService(
        INotificationService notificationService,
        ILogger<CrmNotificationService> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    #region Lead Notifications

    public async Task SendLeadAssignedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Lead Atandı",
                Message = $"{leadName} leadı size atandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/leads/{leadId}",
                Icon = "user-plus",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lead_assigned",
                    ["leadId"] = leadId,
                    ["leadName"] = leadName,
                    ["assignedToUserId"] = assignedToUserId
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Lead assigned notification sent for {LeadName} to user {UserId}", leadName, assignedToUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lead assigned notification for {LeadName}", leadName);
        }
    }

    public async Task SendLeadConvertedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Lead Müşteriye Dönüştürüldü",
                Message = $"{leadName} müşteriye dönüştürüldü.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/customers/{customerId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lead_converted",
                    ["leadId"] = leadId,
                    ["leadName"] = leadName,
                    ["customerId"] = customerId
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Lead converted notification sent for {LeadName} in tenant {TenantId}", leadName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lead converted notification for {LeadName}", leadName);
        }
    }

    #endregion

    #region Deal Notifications

    public async Task SendDealWonAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        decimal value,
        string currency,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fırsat Kazanıldı!",
                Message = $"{dealName} fırsatı kazanıldı! Değer: {value:N0} {currency}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/deals/{dealId}",
                Icon = "trophy",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "deal_won",
                    ["dealId"] = dealId,
                    ["dealName"] = dealName,
                    ["value"] = value,
                    ["currency"] = currency,
                    ["ownerId"] = ownerId
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Deal won notification sent for {DealName} in tenant {TenantId}", dealName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send deal won notification for {DealName}", dealName);
        }
    }

    public async Task SendDealLostAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        decimal value,
        string lostReason,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fırsat Kaybedildi",
                Message = $"{dealName} fırsatı kaybedildi. Sebep: {lostReason}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/deals/{dealId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "deal_lost",
                    ["dealId"] = dealId,
                    ["dealName"] = dealName,
                    ["value"] = value,
                    ["lostReason"] = lostReason,
                    ["ownerId"] = ownerId
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Deal lost notification sent for {DealName} to user {OwnerId}", dealName, ownerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send deal lost notification for {DealName}", dealName);
        }
    }

    public async Task SendDealRottenAlertAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        int daysSinceLastActivity,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fırsat Uyarısı",
                Message = $"{dealName} fırsatında {daysSinceLastActivity} gündür aktivite yok!",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/deals/{dealId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "deal_rotten",
                    ["dealId"] = dealId,
                    ["dealName"] = dealName,
                    ["daysSinceLastActivity"] = daysSinceLastActivity,
                    ["ownerId"] = ownerId
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogWarning("Deal rotten alert sent for {DealName} to user {OwnerId}", dealName, ownerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send deal rotten alert for {DealName}", dealName);
        }
    }

    #endregion

    #region Activity Notifications

    public async Task SendActivityOverdueAsync(
        Guid tenantId,
        Guid activityId,
        string subject,
        DateTime dueDate,
        int daysOverdue,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Gecikmiş Aktivite",
                Message = $"'{subject}' aktivitesi {daysOverdue} gün gecikmiş!",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/activities/{activityId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "activity_overdue",
                    ["activityId"] = activityId,
                    ["subject"] = subject,
                    ["dueDate"] = dueDate.ToString("yyyy-MM-dd"),
                    ["daysOverdue"] = daysOverdue
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogWarning("Activity overdue alert sent for {Subject} to user {UserId}", subject, assignedToUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send activity overdue alert for {Subject}", subject);
        }
    }

    #endregion

    #region Opportunity Notifications

    public async Task SendOpportunityCloseDateApproachingAsync(
        Guid tenantId,
        Guid opportunityId,
        string opportunityName,
        DateTime expectedCloseDate,
        int daysRemaining,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fırsat Kapanış Tarihi Yaklaşıyor",
                Message = $"'{opportunityName}' fırsatının kapanış tarihi {daysRemaining} gün içinde!",
                Type = NotificationType.CRM,
                Priority = daysRemaining <= 3 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/crm/opportunities/{opportunityId}",
                Icon = "calendar",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "opportunity_close_date_approaching",
                    ["opportunityId"] = opportunityId,
                    ["opportunityName"] = opportunityName,
                    ["expectedCloseDate"] = expectedCloseDate.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Opportunity close date approaching alert sent for {OpportunityName}", opportunityName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send opportunity close date approaching alert for {OpportunityName}", opportunityName);
        }
    }

    #endregion

    #region Campaign Notifications

    public async Task SendCampaignLaunchedAsync(
        Guid tenantId,
        Guid campaignId,
        string campaignName,
        int targetMemberCount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Kampanya Başlatıldı",
                Message = $"{campaignName} kampanyası {targetMemberCount} hedef kişiye başlatıldı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/campaigns/{campaignId}",
                Icon = "megaphone",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "campaign_launched",
                    ["campaignId"] = campaignId,
                    ["campaignName"] = campaignName,
                    ["targetMemberCount"] = targetMemberCount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Campaign launched notification sent for {CampaignName} in tenant {TenantId}", campaignName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send campaign launched notification for {CampaignName}", campaignName);
        }
    }

    #endregion

    #region Workflow Notifications

    public async Task SendWorkflowExecutionFailedAsync(
        Guid tenantId,
        Guid workflowId,
        string workflowName,
        Guid executionId,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "İş Akışı Hatası",
                Message = $"'{workflowName}' iş akışı başarısız oldu: {errorMessage}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/crm/workflows/{workflowId}/executions/{executionId}",
                Icon = "alert-octagon",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "workflow_execution_failed",
                    ["workflowId"] = workflowId,
                    ["workflowName"] = workflowName,
                    ["executionId"] = executionId,
                    ["errorMessage"] = errorMessage
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogError("Workflow execution failed notification sent for {WorkflowName} in tenant {TenantId}", workflowName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send workflow execution failed notification for {WorkflowName}", workflowName);
        }
    }

    #endregion

    #region Loyalty Notifications

    public async Task SendLoyaltyTierChangedAsync(
        Guid tenantId,
        Guid customerId,
        string customerName,
        string oldTier,
        string newTier,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sadakat Seviyesi Değişti",
                Message = $"{customerName} müşterisi {oldTier} → {newTier} seviyesine geçti.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/customers/{customerId}/loyalty",
                Icon = "award",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "loyalty_tier_changed",
                    ["customerId"] = customerId,
                    ["customerName"] = customerName,
                    ["oldTier"] = oldTier,
                    ["newTier"] = newTier
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Loyalty tier changed notification sent for {CustomerName} in tenant {TenantId}", customerName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send loyalty tier changed notification for {CustomerName}", customerName);
        }
    }

    public async Task SendLoyaltyPointsExpiringAsync(
        Guid tenantId,
        Guid customerId,
        string customerName,
        int pointsExpiring,
        DateTime expiryDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Puanlar Süresi Doluyor",
                Message = $"{customerName} müşterisinin {pointsExpiring} puanı {expiryDate:dd.MM.yyyy} tarihinde sona erecek.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/customers/{customerId}/loyalty",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "loyalty_points_expiring",
                    ["customerId"] = customerId,
                    ["customerName"] = customerName,
                    ["pointsExpiring"] = pointsExpiring,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Loyalty points expiring alert sent for {CustomerName} in tenant {TenantId}", customerName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send loyalty points expiring alert for {CustomerName}", customerName);
        }
    }

    #endregion

    #region Quote Notifications

    public async Task SendQuoteAcceptedAsync(
        Guid tenantId,
        Guid quoteId,
        string quoteNumber,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Kabul Edildi",
                Message = $"{quoteNumber} numaralı teklif müşteri tarafından kabul edildi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/quotes/{quoteId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quote_accepted",
                    ["quoteId"] = quoteId,
                    ["quoteNumber"] = quoteNumber,
                    ["ownerId"] = ownerId
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Quote accepted notification sent for {QuoteNumber}", quoteNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quote accepted notification for {QuoteNumber}", quoteNumber);
        }
    }

    public async Task SendQuoteExpiringSoonAsync(
        Guid tenantId,
        Guid quoteId,
        string quoteNumber,
        int ownerId,
        DateTime expiryDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Süresi Doluyor",
                Message = $"{quoteNumber} numaralı teklifin süresi {expiryDate:dd.MM.yyyy} tarihinde dolacak.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/quotes/{quoteId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quote_expiring_soon",
                    ["quoteId"] = quoteId,
                    ["quoteNumber"] = quoteNumber,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogWarning("Quote expiring soon alert sent for {QuoteNumber}", quoteNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quote expiring soon alert for {QuoteNumber}", quoteNumber);
        }
    }

    public async Task SendQuoteConvertedAsync(
        Guid tenantId,
        Guid quoteId,
        string quoteNumber,
        Guid? convertedToId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Siparişe Dönüştürüldü",
                Message = $"{quoteNumber} numaralı teklif siparişe dönüştürüldü.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/quotes/{quoteId}",
                Icon = "shopping-cart",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quote_converted",
                    ["quoteId"] = quoteId,
                    ["quoteNumber"] = quoteNumber,
                    ["convertedToId"] = convertedToId ?? Guid.Empty
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quote converted notification sent for {QuoteNumber}", quoteNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quote converted notification for {QuoteNumber}", quoteNumber);
        }
    }

    #endregion

    #region Contract Notifications

    public async Task SendContractSignedAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sözleşme İmzalandı",
                Message = $"{contractNumber} numaralı sözleşme imzalandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/contracts/{contractId}",
                Icon = "file-signature",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "contract_signed",
                    ["contractId"] = contractId,
                    ["contractNumber"] = contractNumber,
                    ["ownerId"] = ownerId
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Contract signed notification sent for {ContractNumber}", contractNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contract signed notification for {ContractNumber}", contractNumber);
        }
    }

    public async Task SendContractRenewedAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        Guid newContractId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sözleşme Yenilendi",
                Message = $"{contractNumber} numaralı sözleşme yenilendi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/contracts/{newContractId}",
                Icon = "refresh-cw",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "contract_renewed",
                    ["contractId"] = contractId,
                    ["contractNumber"] = contractNumber,
                    ["newContractId"] = newContractId
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Contract renewed notification sent for {ContractNumber}", contractNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contract renewed notification for {ContractNumber}", contractNumber);
        }
    }

    public async Task SendContractExpiringSoonAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        int ownerId,
        DateTime expiryDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sözleşme Süresi Doluyor",
                Message = $"{contractNumber} numaralı sözleşmenin süresi {expiryDate:dd.MM.yyyy} tarihinde dolacak.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/contracts/{contractId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "contract_expiring_soon",
                    ["contractId"] = contractId,
                    ["contractNumber"] = contractNumber,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogWarning("Contract expiring soon alert sent for {ContractNumber}", contractNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contract expiring soon alert for {ContractNumber}", contractNumber);
        }
    }

    #endregion

    #region Ticket Notifications

    public async Task SendTicketAssignedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string subject,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Destek Talebi Atandı",
                Message = $"{ticketNumber}: {subject}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/tickets/{ticketId}",
                Icon = "ticket",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "ticket_assigned",
                    ["ticketId"] = ticketId,
                    ["ticketNumber"] = ticketNumber,
                    ["subject"] = subject
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Ticket assigned notification sent for {TicketNumber}", ticketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send ticket assigned notification for {TicketNumber}", ticketNumber);
        }
    }

    public async Task SendTicketEscalatedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string subject,
        int escalatedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Destek Talebi Yükseltildi",
                Message = $"{ticketNumber}: {subject} size yükseltildi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/tickets/{ticketId}",
                Icon = "arrow-up-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "ticket_escalated",
                    ["ticketId"] = ticketId,
                    ["ticketNumber"] = ticketNumber,
                    ["subject"] = subject,
                    ["escalatedToUserId"] = escalatedToUserId
                }
            };

            await _notificationService.SendToUserAsync(escalatedToUserId.ToString(), notification);
            _logger.LogWarning("Ticket escalated notification sent for {TicketNumber}", ticketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send ticket escalated notification for {TicketNumber}", ticketNumber);
        }
    }

    public async Task SendTicketResolvedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        int resolvedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Destek Talebi Çözüldü",
                Message = $"{ticketNumber} numaralı destek talebiniz çözüldü.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/tickets/{ticketId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "ticket_resolved",
                    ["ticketId"] = ticketId,
                    ["ticketNumber"] = ticketNumber,
                    ["resolvedById"] = resolvedById
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Ticket resolved notification sent for {TicketNumber}", ticketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send ticket resolved notification for {TicketNumber}", ticketNumber);
        }
    }

    public async Task SendTicketSlaBreachedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string slaType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "SLA İhlali",
                Message = $"{ticketNumber} için {slaType} SLA süresi aşıldı!",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/crm/tickets/{ticketId}",
                Icon = "alert-octagon",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "ticket_sla_breached",
                    ["ticketId"] = ticketId,
                    ["ticketNumber"] = ticketNumber,
                    ["slaType"] = slaType
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogError("Ticket SLA breached notification sent for {TicketNumber}", ticketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send ticket SLA breached notification for {TicketNumber}", ticketNumber);
        }
    }

    public async Task SendTicketSlaWarningAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string slaType,
        int minutesUntilBreach,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "SLA Uyarısı",
                Message = $"{ticketNumber} için {slaType} SLA süresi {minutesUntilBreach} dakika içinde dolacak!",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/tickets/{ticketId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "ticket_sla_warning",
                    ["ticketId"] = ticketId,
                    ["ticketNumber"] = ticketNumber,
                    ["slaType"] = slaType,
                    ["minutesUntilBreach"] = minutesUntilBreach
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Ticket SLA warning notification sent for {TicketNumber}", ticketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send ticket SLA warning notification for {TicketNumber}", ticketNumber);
        }
    }

    #endregion

    #region Meeting Notifications

    public async Task SendMeetingCancelledAsync(
        Guid tenantId,
        Guid meetingId,
        string subject,
        int organizerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Toplantı İptal Edildi",
                Message = $"'{subject}' toplantısı iptal edildi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/meetings/{meetingId}",
                Icon = "calendar-x",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "meeting_cancelled",
                    ["meetingId"] = meetingId,
                    ["subject"] = subject
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Meeting cancelled notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send meeting cancelled notification for {Subject}", subject);
        }
    }

    public async Task SendMeetingReminderAsync(
        Guid tenantId,
        Guid meetingId,
        string subject,
        DateTime startTime,
        int minutesUntilStart,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Toplantı Hatırlatması",
                Message = $"'{subject}' toplantısı {minutesUntilStart} dakika içinde başlayacak.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/meetings/{meetingId}",
                Icon = "bell",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "meeting_reminder",
                    ["meetingId"] = meetingId,
                    ["subject"] = subject,
                    ["startTime"] = startTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                    ["minutesUntilStart"] = minutesUntilStart
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Meeting reminder notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send meeting reminder notification for {Subject}", subject);
        }
    }

    #endregion

    #region Task Notifications

    public async Task SendTaskAssignedAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Görev Atandı",
                Message = $"'{subject}' görevi size atandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/tasks/{taskId}",
                Icon = "clipboard",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "task_assigned",
                    ["taskId"] = taskId,
                    ["subject"] = subject
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Task assigned notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task assigned notification for {Subject}", subject);
        }
    }

    public async Task SendTaskCompletedAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int completedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Görev Tamamlandı",
                Message = $"'{subject}' görevi tamamlandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/tasks/{taskId}",
                Icon = "check-square",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "task_completed",
                    ["taskId"] = taskId,
                    ["subject"] = subject
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Task completed notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task completed notification for {Subject}", subject);
        }
    }

    public async Task SendTaskOverdueAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        int daysOverdue,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Gecikmiş Görev",
                Message = $"'{subject}' görevi {daysOverdue} gün gecikmiş!",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/tasks/{taskId}",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "task_overdue",
                    ["taskId"] = taskId,
                    ["subject"] = subject,
                    ["daysOverdue"] = daysOverdue
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogWarning("Task overdue notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task overdue notification for {Subject}", subject);
        }
    }

    public async Task SendTaskReminderAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Görev Hatırlatması",
                Message = $"'{subject}' görevi için hatırlatma.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/tasks/{taskId}",
                Icon = "bell",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "task_reminder",
                    ["taskId"] = taskId,
                    ["subject"] = subject
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Task reminder notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task reminder notification for {Subject}", subject);
        }
    }

    public async Task SendTaskDueDateApproachingAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        int daysUntilDue,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Görev Bitiş Tarihi Yaklaşıyor",
                Message = $"'{subject}' görevi {daysUntilDue} gün içinde bitiyor.",
                Type = NotificationType.CRM,
                Priority = daysUntilDue <= 1 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/crm/tasks/{taskId}",
                Icon = "calendar",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "task_due_date_approaching",
                    ["taskId"] = taskId,
                    ["subject"] = subject,
                    ["daysUntilDue"] = daysUntilDue
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Task due date approaching notification sent for {Subject}", subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task due date approaching notification for {Subject}", subject);
        }
    }

    #endregion

    #region Reminder Notifications

    public async Task SendReminderDueAsync(
        Guid tenantId,
        Guid reminderId,
        string subject,
        int userId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Hatırlatıcı",
                Message = subject,
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/reminders/{reminderId}",
                Icon = "bell",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "reminder_due",
                    ["reminderId"] = reminderId,
                    ["subject"] = subject
                }
            };

            await _notificationService.SendToUserAsync(userId.ToString(), notification);
            _logger.LogInformation("Reminder due notification sent for '{Subject}' to user {UserId}", subject, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send reminder due notification for '{Subject}'", subject);
        }
    }

    #endregion

    #region Note Notifications

    public async Task SendUserMentionedInNoteAsync(
        Guid tenantId,
        Guid noteId,
        int mentionedUserId,
        int mentionedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Notta Bahsedildiniz",
                Message = "Bir notta sizden bahsedildi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/notes/{noteId}",
                Icon = "at-sign",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "user_mentioned_in_note",
                    ["noteId"] = noteId,
                    ["mentionedById"] = mentionedById
                }
            };

            await _notificationService.SendToUserAsync(mentionedUserId.ToString(), notification);
            _logger.LogInformation("User mentioned in note notification sent to user {UserId}", mentionedUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send user mentioned in note notification");
        }
    }

    #endregion

    #region Document Notifications

    public async Task SendDocumentSharedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int sharedWithUserId,
        int sharedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Doküman Paylaşıldı",
                Message = $"'{fileName}' dokümanı sizinle paylaşıldı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/documents/{documentId}",
                Icon = "file-text",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "document_shared",
                    ["documentId"] = documentId,
                    ["fileName"] = fileName,
                    ["sharedById"] = sharedById
                }
            };

            await _notificationService.SendToUserAsync(sharedWithUserId.ToString(), notification);
            _logger.LogInformation("Document shared notification sent for {FileName}", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send document shared notification for {FileName}", fileName);
        }
    }

    public async Task SendDocumentApprovalRequestedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int approverId,
        int requestedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Doküman Onayı Bekleniyor",
                Message = $"'{fileName}' dokümanı için onayınız bekleniyor.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/documents/{documentId}",
                Icon = "file-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "document_approval_requested",
                    ["documentId"] = documentId,
                    ["fileName"] = fileName,
                    ["requestedById"] = requestedById
                }
            };

            await _notificationService.SendToUserAsync(approverId.ToString(), notification);
            _logger.LogInformation("Document approval requested notification sent for {FileName}", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send document approval requested notification for {FileName}", fileName);
        }
    }

    public async Task SendDocumentApprovedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int uploadedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Doküman Onaylandı",
                Message = $"'{fileName}' dokümanı onaylandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/documents/{documentId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "document_approved",
                    ["documentId"] = documentId,
                    ["fileName"] = fileName
                }
            };

            await _notificationService.SendToUserAsync(uploadedById.ToString(), notification);
            _logger.LogInformation("Document approved notification sent for {FileName}", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send document approved notification for {FileName}", fileName);
        }
    }

    public async Task SendDocumentRejectedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int uploadedById,
        string? rejectionReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = string.IsNullOrEmpty(rejectionReason)
                ? $"'{fileName}' dokümanı reddedildi."
                : $"'{fileName}' dokümanı reddedildi. Sebep: {rejectionReason}";

            var notification = new NotificationMessage
            {
                Title = "Doküman Reddedildi",
                Message = message,
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/documents/{documentId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "document_rejected",
                    ["documentId"] = documentId,
                    ["fileName"] = fileName,
                    ["rejectionReason"] = rejectionReason ?? string.Empty
                }
            };

            await _notificationService.SendToUserAsync(uploadedById.ToString(), notification);
            _logger.LogWarning("Document rejected notification sent for {FileName}", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send document rejected notification for {FileName}", fileName);
        }
    }

    #endregion

    #region Account Notifications

    public async Task SendAccountAssignedAsync(
        Guid tenantId,
        Guid accountId,
        string accountName,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Hesap Atandı",
                Message = $"'{accountName}' hesabı size atandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/accounts/{accountId}",
                Icon = "building",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "account_assigned",
                    ["accountId"] = accountId,
                    ["accountName"] = accountName
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Account assigned notification sent for {AccountName}", accountName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send account assigned notification for {AccountName}", accountName);
        }
    }

    public async Task SendAccountMarkedAsKeyAccountAsync(
        Guid tenantId,
        Guid accountId,
        string accountName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Anahtar Hesap",
                Message = $"'{accountName}' anahtar hesap olarak işaretlendi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/accounts/{accountId}",
                Icon = "star",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "account_marked_as_key_account",
                    ["accountId"] = accountId,
                    ["accountName"] = accountName
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Account marked as key account notification sent for {AccountName}", accountName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send account marked as key account notification for {AccountName}", accountName);
        }
    }

    #endregion

    #region Territory Notifications

    public async Task SendTerritoryUserAssignedAsync(
        Guid tenantId,
        Guid territoryId,
        string territoryName,
        int assignedUserId,
        string role,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Bölgeye Atandınız",
                Message = $"'{territoryName}' bölgesine {role} olarak atandınız.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/territories/{territoryId}",
                Icon = "map",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "territory_user_assigned",
                    ["territoryId"] = territoryId,
                    ["territoryName"] = territoryName,
                    ["role"] = role
                }
            };

            await _notificationService.SendToUserAsync(assignedUserId.ToString(), notification);
            _logger.LogInformation("Territory user assigned notification sent for {TerritoryName}", territoryName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send territory user assigned notification for {TerritoryName}", territoryName);
        }
    }

    #endregion

    #region Sales Team Notifications

    public async Task SendSalesTeamMemberAddedAsync(
        Guid tenantId,
        Guid teamId,
        string teamName,
        int memberId,
        string role,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Satış Ekibine Eklendi",
                Message = $"'{teamName}' satış ekibine {role} olarak eklendiniz.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/sales-teams/{teamId}",
                Icon = "users",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_team_member_added",
                    ["teamId"] = teamId,
                    ["teamName"] = teamName,
                    ["role"] = role
                }
            };

            await _notificationService.SendToUserAsync(memberId.ToString(), notification);
            _logger.LogInformation("Sales team member added notification sent for {TeamName}", teamName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales team member added notification for {TeamName}", teamName);
        }
    }

    public async Task SendSalesTeamManagerChangedAsync(
        Guid tenantId,
        Guid teamId,
        string teamName,
        int newManagerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Satış Ekibi Yöneticisi",
                Message = $"'{teamName}' satış ekibinin yöneticisi oldunuz.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/sales-teams/{teamId}",
                Icon = "user-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_team_manager_changed",
                    ["teamId"] = teamId,
                    ["teamName"] = teamName
                }
            };

            await _notificationService.SendToUserAsync(newManagerId.ToString(), notification);
            _logger.LogInformation("Sales team manager changed notification sent for {TeamName}", teamName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales team manager changed notification for {TeamName}", teamName);
        }
    }

    public async Task SendSalesTeamQuotaReachedAsync(
        Guid tenantId,
        Guid teamId,
        string teamName,
        decimal quotaAmount,
        decimal achievedAmount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Kota Hedefine Ulaşıldı!",
                Message = $"'{teamName}' satış ekibi kota hedefine ulaştı! ({achievedAmount:N0}/{quotaAmount:N0})",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/sales-teams/{teamId}",
                Icon = "target",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_team_quota_reached",
                    ["teamId"] = teamId,
                    ["teamName"] = teamName,
                    ["quotaAmount"] = quotaAmount,
                    ["achievedAmount"] = achievedAmount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales team quota reached notification sent for {TeamName}", teamName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales team quota reached notification for {TeamName}", teamName);
        }
    }

    #endregion

    #region Referral Notifications

    public async Task SendReferralConvertedAsync(
        Guid tenantId,
        Guid referralId,
        string referralCode,
        Guid referrerId,
        string newCustomerName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Referans Dönüştürüldü!",
                Message = $"{newCustomerName} referansınız ile müşteri oldu.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/referrals/{referralId}",
                Icon = "user-plus",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "referral_converted",
                    ["referralId"] = referralId,
                    ["referralCode"] = referralCode,
                    ["newCustomerName"] = newCustomerName
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Referral converted notification sent for code {ReferralCode}", referralCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send referral converted notification for code {ReferralCode}", referralCode);
        }
    }

    public async Task SendReferralRewardEarnedAsync(
        Guid tenantId,
        Guid referralId,
        Guid referrerId,
        string rewardType,
        decimal? rewardAmount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = rewardAmount.HasValue
                ? $"Referans ödülü kazandınız: {rewardAmount:N0} ({rewardType})"
                : $"Referans ödülü kazandınız: {rewardType}";

            var notification = new NotificationMessage
            {
                Title = "Referans Ödülü!",
                Message = message,
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/referrals/{referralId}",
                Icon = "gift",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "referral_reward_earned",
                    ["referralId"] = referralId,
                    ["rewardType"] = rewardType,
                    ["rewardAmount"] = rewardAmount ?? 0
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Referral reward earned notification sent for referral {ReferralId}", referralId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send referral reward earned notification for referral {ReferralId}", referralId);
        }
    }

    #endregion

    #region Call Log Notifications

    public async Task SendCallMissedAsync(
        Guid tenantId,
        Guid callLogId,
        string callNumber,
        string callerNumber,
        string? customerName,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Cevapsız Arama",
                Message = $"{callerNumber} numarasından gelen arama cevaplanmadı{(customerName != null ? $" - {customerName}" : "")}.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/calls/{callLogId}",
                Icon = "phone-missed",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "call_missed",
                    ["callLogId"] = callLogId,
                    ["callNumber"] = callNumber,
                    ["callerNumber"] = callerNumber
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogWarning("Missed call notification sent for {CallNumber}", callNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send missed call notification for {CallNumber}", callNumber);
        }
    }

    public async Task SendCallTransferredAsync(
        Guid tenantId,
        Guid callLogId,
        string callNumber,
        int transferredToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Arama Transfer Edildi",
                Message = $"{callNumber} numaralı arama size transfer edildi.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/calls/{callLogId}",
                Icon = "phone-forwarded",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "call_transferred",
                    ["callLogId"] = callLogId,
                    ["callNumber"] = callNumber
                }
            };

            await _notificationService.SendToUserAsync(transferredToUserId.ToString(), notification);
            _logger.LogInformation("Call transferred notification sent for {CallNumber}", callNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send call transferred notification for {CallNumber}", callNumber);
        }
    }

    public async Task SendCallScheduledAsync(
        Guid tenantId,
        Guid callLogId,
        string callNumber,
        DateTime scheduledTime,
        string? customerName,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Arama Planlandı",
                Message = $"{customerName ?? "Müşteri"} için {scheduledTime:dd.MM.yyyy HH:mm} tarihinde arama planlandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/calls/{callLogId}",
                Icon = "phone-clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "call_scheduled",
                    ["callLogId"] = callLogId,
                    ["scheduledTime"] = scheduledTime
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Call scheduled notification sent for {CallNumber}", callNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send call scheduled notification for {CallNumber}", callNumber);
        }
    }

    #endregion

    #region Competitor Notifications

    public async Task SendCompetitorThreatLevelChangedAsync(
        Guid tenantId,
        Guid competitorId,
        string competitorName,
        string oldThreatLevel,
        string newThreatLevel,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Rakip Tehdit Seviyesi Değişti",
                Message = $"{competitorName} tehdit seviyesi {oldThreatLevel} → {newThreatLevel} olarak değişti.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/competitors/{competitorId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "competitor_threat_changed",
                    ["competitorId"] = competitorId,
                    ["oldThreatLevel"] = oldThreatLevel,
                    ["newThreatLevel"] = newThreatLevel
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Competitor threat level changed notification sent for {CompetitorName}", competitorName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send competitor threat level notification for {CompetitorName}", competitorName);
        }
    }

    public async Task SendCompetitorIntelligenceReportAsync(
        Guid tenantId,
        Guid competitorId,
        string competitorName,
        string reportType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Rakip İstihbarat Raporu",
                Message = $"{competitorName} için yeni {reportType} raporu oluşturuldu.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/competitors/{competitorId}/reports",
                Icon = "file-text",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "competitor_report_created",
                    ["competitorId"] = competitorId,
                    ["reportType"] = reportType
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Competitor intelligence report notification sent for {CompetitorName}", competitorName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send competitor report notification for {CompetitorName}", competitorName);
        }
    }

    #endregion

    #region Pipeline Notifications

    public async Task SendDealStageChangedAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        string oldStageName,
        string newStageName,
        decimal? amount,
        int changedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fırsat Aşaması Değişti",
                Message = $"{dealName}: {oldStageName} → {newStageName}{(amount.HasValue ? $" ({amount:C})" : "")}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/deals/{dealId}",
                Icon = "git-branch",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "deal_stage_changed",
                    ["dealId"] = dealId,
                    ["oldStage"] = oldStageName,
                    ["newStage"] = newStageName,
                    ["amount"] = amount ?? 0
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Deal stage changed notification sent for {DealName}", dealName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send deal stage changed notification for {DealName}", dealName);
        }
    }

    #endregion

    #region Lead Scoring Notifications

    public async Task SendLeadScoreThresholdReachedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        int score,
        string thresholdName,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Lead Puanı Eşiğe Ulaştı",
                Message = $"{leadName} {thresholdName} eşiğine ulaştı (Puan: {score}).",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/leads/{leadId}",
                Icon = "trending-up",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lead_score_threshold",
                    ["leadId"] = leadId,
                    ["score"] = score,
                    ["threshold"] = thresholdName
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Lead score threshold notification sent for {LeadName}", leadName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lead score threshold notification for {LeadName}", leadName);
        }
    }

    public async Task SendLeadQualifiedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        int score,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Lead Nitelikli Olarak İşaretlendi",
                Message = $"{leadName} puanlamaya göre nitelikli olarak işaretlendi (Puan: {score}).",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.High,
                ActionUrl = $"/crm/leads/{leadId}",
                Icon = "star",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lead_qualified",
                    ["leadId"] = leadId,
                    ["score"] = score
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Lead qualified notification sent for {LeadName}", leadName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lead qualified notification for {LeadName}", leadName);
        }
    }

    public async Task SendLeadGradeChangedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        string oldGrade,
        string newGrade,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Lead Derecesi Değişti",
                Message = $"{leadName}: {oldGrade} → {newGrade}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/leads/{leadId}",
                Icon = "award",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lead_grade_changed",
                    ["leadId"] = leadId,
                    ["oldGrade"] = oldGrade,
                    ["newGrade"] = newGrade
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogInformation("Lead grade changed notification sent for {LeadName}", leadName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lead grade changed notification for {LeadName}", leadName);
        }
    }

    #endregion

    #region Product Interest Notifications

    public async Task SendProductInterestConvertedAsync(
        Guid tenantId,
        Guid productInterestId,
        string productName,
        Guid opportunityId,
        decimal? estimatedValue,
        int convertedById,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ürün İlgisi Fırsata Dönüştü",
                Message = $"{productName} ilgisi fırsata dönüştürüldü{(estimatedValue.HasValue ? $" ({estimatedValue:C})" : "")}.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/opportunities/{opportunityId}",
                Icon = "zap",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "product_interest_converted",
                    ["productInterestId"] = productInterestId,
                    ["opportunityId"] = opportunityId,
                    ["estimatedValue"] = estimatedValue ?? 0
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Product interest converted notification sent for {ProductName}", productName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send product interest converted notification for {ProductName}", productName);
        }
    }

    public async Task SendProductInterestFollowUpAsync(
        Guid tenantId,
        Guid productInterestId,
        string productName,
        DateTime followUpDate,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ürün İlgisi Takip Hatırlatması",
                Message = $"{productName} için {followUpDate:dd.MM.yyyy} tarihinde takip planlandı.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/product-interests/{productInterestId}",
                Icon = "calendar",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "product_interest_followup",
                    ["productInterestId"] = productInterestId,
                    ["followUpDate"] = followUpDate
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Product interest follow-up notification sent for {ProductName}", productName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send product interest follow-up notification for {ProductName}", productName);
        }
    }

    #endregion

    #region Survey Notifications

    public async Task SendSurveyCompletedAsync(
        Guid tenantId,
        Guid surveyResponseId,
        string surveyType,
        string? customerName,
        int? overallScore,
        int? npsScore,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Anket Tamamlandı",
                Message = $"{customerName ?? "Müşteri"} anketi tamamladı. Puan: {overallScore ?? npsScore ?? 0}",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/crm/surveys/{surveyResponseId}",
                Icon = "clipboard-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "survey_completed",
                    ["surveyResponseId"] = surveyResponseId,
                    ["surveyType"] = surveyType,
                    ["overallScore"] = overallScore ?? 0,
                    ["npsScore"] = npsScore ?? 0
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Survey completed notification sent for survey {SurveyResponseId}", surveyResponseId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send survey completed notification for {SurveyResponseId}", surveyResponseId);
        }
    }

    public async Task SendDetractorAlertAsync(
        Guid tenantId,
        Guid surveyResponseId,
        Guid? customerId,
        string? customerName,
        int npsScore,
        string? feedback,
        int ownerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⚠️ Detractor Müşteri Uyarısı",
                Message = $"{customerName ?? "Müşteri"} düşük NPS puanı verdi ({npsScore}/10). Acil takip gerekiyor.",
                Type = NotificationType.CRM,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/crm/surveys/{surveyResponseId}",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "detractor_alert",
                    ["surveyResponseId"] = surveyResponseId,
                    ["customerId"] = customerId ?? Guid.Empty,
                    ["npsScore"] = npsScore,
                    ["feedback"] = feedback ?? ""
                }
            };

            await _notificationService.SendToUserAsync(ownerId.ToString(), notification);
            _logger.LogWarning("Detractor alert sent for customer {CustomerName}, NPS: {NpsScore}", customerName, npsScore);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send detractor alert for survey {SurveyResponseId}", surveyResponseId);
        }
    }

    public async Task SendSurveyFollowUpRequiredAsync(
        Guid tenantId,
        Guid surveyResponseId,
        string surveyType,
        string? customerName,
        string followUpReason,
        string priority,
        int assignedToUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Anket Takibi Gerekiyor",
                Message = $"{customerName ?? "Müşteri"} - {followUpReason}",
                Type = NotificationType.CRM,
                Priority = priority == "High" ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/crm/surveys/{surveyResponseId}",
                Icon = "user-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "survey_followup_required",
                    ["surveyResponseId"] = surveyResponseId,
                    ["surveyType"] = surveyType,
                    ["followUpReason"] = followUpReason,
                    ["priority"] = priority
                }
            };

            await _notificationService.SendToUserAsync(assignedToUserId.ToString(), notification);
            _logger.LogInformation("Survey follow-up notification sent for {SurveyResponseId}", surveyResponseId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send survey follow-up notification for {SurveyResponseId}", surveyResponseId);
        }
    }

    #endregion
}
