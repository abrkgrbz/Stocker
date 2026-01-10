namespace Stocker.Modules.CRM.Domain.Services;

/// <summary>
/// CRM notification service interface for sending real-time notifications.
/// </summary>
public interface ICrmNotificationService
{
    #region Lead Notifications

    /// <summary>
    /// Send notification when a new lead is assigned to a user.
    /// </summary>
    Task SendLeadAssignedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a lead is converted to a customer.
    /// </summary>
    Task SendLeadConvertedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        Guid customerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Deal Notifications

    /// <summary>
    /// Send notification when a deal is won.
    /// </summary>
    Task SendDealWonAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        decimal value,
        string currency,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a deal is lost.
    /// </summary>
    Task SendDealLostAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        decimal value,
        string lostReason,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a deal becomes rotten (no activity).
    /// </summary>
    Task SendDealRottenAlertAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        int daysSinceLastActivity,
        int ownerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Activity Notifications

    /// <summary>
    /// Send notification when an activity is overdue.
    /// </summary>
    Task SendActivityOverdueAsync(
        Guid tenantId,
        Guid activityId,
        string subject,
        DateTime dueDate,
        int daysOverdue,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Opportunity Notifications

    /// <summary>
    /// Send notification when opportunity close date is approaching.
    /// </summary>
    Task SendOpportunityCloseDateApproachingAsync(
        Guid tenantId,
        Guid opportunityId,
        string opportunityName,
        DateTime expectedCloseDate,
        int daysRemaining,
        int ownerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Campaign Notifications

    /// <summary>
    /// Send notification when a campaign is launched.
    /// </summary>
    Task SendCampaignLaunchedAsync(
        Guid tenantId,
        Guid campaignId,
        string campaignName,
        int targetMemberCount,
        CancellationToken cancellationToken = default);

    #endregion

    #region Workflow Notifications

    /// <summary>
    /// Send notification when a workflow execution fails.
    /// </summary>
    Task SendWorkflowExecutionFailedAsync(
        Guid tenantId,
        Guid workflowId,
        string workflowName,
        Guid executionId,
        string errorMessage,
        CancellationToken cancellationToken = default);

    #endregion

    #region Loyalty Notifications

    /// <summary>
    /// Send notification when loyalty tier changes.
    /// </summary>
    Task SendLoyaltyTierChangedAsync(
        Guid tenantId,
        Guid customerId,
        string customerName,
        string oldTier,
        string newTier,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when loyalty points are about to expire.
    /// </summary>
    Task SendLoyaltyPointsExpiringAsync(
        Guid tenantId,
        Guid customerId,
        string customerName,
        int pointsExpiring,
        DateTime expiryDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Quote Notifications

    /// <summary>
    /// Send notification when a quote is accepted by customer.
    /// </summary>
    Task SendQuoteAcceptedAsync(
        Guid tenantId,
        Guid quoteId,
        string quoteNumber,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a quote is expiring soon.
    /// </summary>
    Task SendQuoteExpiringSoonAsync(
        Guid tenantId,
        Guid quoteId,
        string quoteNumber,
        int ownerId,
        DateTime expiryDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a quote is converted to order.
    /// </summary>
    Task SendQuoteConvertedAsync(
        Guid tenantId,
        Guid quoteId,
        string quoteNumber,
        Guid? convertedToId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Contract Notifications

    /// <summary>
    /// Send notification when a contract is signed.
    /// </summary>
    Task SendContractSignedAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a contract is renewed.
    /// </summary>
    Task SendContractRenewedAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        Guid newContractId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a contract is expiring soon.
    /// </summary>
    Task SendContractExpiringSoonAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        int ownerId,
        DateTime expiryDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Ticket Notifications

    /// <summary>
    /// Send notification when a ticket is assigned.
    /// </summary>
    Task SendTicketAssignedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string subject,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a ticket is escalated.
    /// </summary>
    Task SendTicketEscalatedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string subject,
        int escalatedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a ticket is resolved.
    /// </summary>
    Task SendTicketResolvedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        int resolvedById,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a ticket SLA is breached.
    /// </summary>
    Task SendTicketSlaBreachedAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string slaType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a ticket SLA warning is triggered.
    /// </summary>
    Task SendTicketSlaWarningAsync(
        Guid tenantId,
        Guid ticketId,
        string ticketNumber,
        string slaType,
        int minutesUntilBreach,
        CancellationToken cancellationToken = default);

    #endregion

    #region Meeting Notifications

    /// <summary>
    /// Send notification when a meeting is cancelled.
    /// </summary>
    Task SendMeetingCancelledAsync(
        Guid tenantId,
        Guid meetingId,
        string subject,
        int organizerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a meeting reminder is due.
    /// </summary>
    Task SendMeetingReminderAsync(
        Guid tenantId,
        Guid meetingId,
        string subject,
        DateTime startTime,
        int minutesUntilStart,
        CancellationToken cancellationToken = default);

    #endregion

    #region Task Notifications

    /// <summary>
    /// Send notification when a task is assigned.
    /// </summary>
    Task SendTaskAssignedAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a task is completed.
    /// </summary>
    Task SendTaskCompletedAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int completedById,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a task is overdue.
    /// </summary>
    Task SendTaskOverdueAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        int daysOverdue,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a task reminder is due.
    /// </summary>
    Task SendTaskReminderAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a task due date is approaching.
    /// </summary>
    Task SendTaskDueDateApproachingAsync(
        Guid tenantId,
        Guid taskId,
        string subject,
        int assignedToUserId,
        int daysUntilDue,
        CancellationToken cancellationToken = default);

    #endregion

    #region Reminder Notifications

    /// <summary>
    /// Send reminder notification to a user.
    /// </summary>
    Task SendReminderDueAsync(
        Guid tenantId,
        Guid reminderId,
        string subject,
        int userId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Note Notifications

    /// <summary>
    /// Send notification when a user is mentioned in a note.
    /// </summary>
    Task SendUserMentionedInNoteAsync(
        Guid tenantId,
        Guid noteId,
        int mentionedUserId,
        int mentionedById,
        CancellationToken cancellationToken = default);

    #endregion

    #region Document Notifications

    /// <summary>
    /// Send notification when a document is shared.
    /// </summary>
    Task SendDocumentSharedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int sharedWithUserId,
        int sharedById,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when document approval is requested.
    /// </summary>
    Task SendDocumentApprovalRequestedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int approverId,
        int requestedById,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a document is approved.
    /// </summary>
    Task SendDocumentApprovedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int uploadedById,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a document is rejected.
    /// </summary>
    Task SendDocumentRejectedAsync(
        Guid tenantId,
        Guid documentId,
        string fileName,
        int uploadedById,
        string? rejectionReason,
        CancellationToken cancellationToken = default);

    #endregion

    #region Account Notifications

    /// <summary>
    /// Send notification when an account is assigned.
    /// </summary>
    Task SendAccountAssignedAsync(
        Guid tenantId,
        Guid accountId,
        string accountName,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when an account is marked as key account.
    /// </summary>
    Task SendAccountMarkedAsKeyAccountAsync(
        Guid tenantId,
        Guid accountId,
        string accountName,
        CancellationToken cancellationToken = default);

    #endregion

    #region Territory Notifications

    /// <summary>
    /// Send notification when a user is assigned to a territory.
    /// </summary>
    Task SendTerritoryUserAssignedAsync(
        Guid tenantId,
        Guid territoryId,
        string territoryName,
        int assignedUserId,
        string role,
        CancellationToken cancellationToken = default);

    #endregion

    #region Sales Team Notifications

    /// <summary>
    /// Send notification when a member is added to sales team.
    /// </summary>
    Task SendSalesTeamMemberAddedAsync(
        Guid tenantId,
        Guid teamId,
        string teamName,
        int memberId,
        string role,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when sales team manager changes.
    /// </summary>
    Task SendSalesTeamManagerChangedAsync(
        Guid tenantId,
        Guid teamId,
        string teamName,
        int newManagerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when sales team reaches quota.
    /// </summary>
    Task SendSalesTeamQuotaReachedAsync(
        Guid tenantId,
        Guid teamId,
        string teamName,
        decimal quotaAmount,
        decimal achievedAmount,
        CancellationToken cancellationToken = default);

    #endregion

    #region Referral Notifications

    /// <summary>
    /// Send notification when a referral is converted.
    /// </summary>
    Task SendReferralConvertedAsync(
        Guid tenantId,
        Guid referralId,
        string referralCode,
        Guid referrerId,
        string newCustomerName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when referral reward is earned.
    /// </summary>
    Task SendReferralRewardEarnedAsync(
        Guid tenantId,
        Guid referralId,
        Guid referrerId,
        string rewardType,
        decimal? rewardAmount,
        CancellationToken cancellationToken = default);

    #endregion

    #region Call Log Notifications

    /// <summary>
    /// Send notification when a call is missed.
    /// </summary>
    Task SendCallMissedAsync(
        Guid tenantId,
        Guid callLogId,
        string callNumber,
        string callerNumber,
        string? customerName,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a call is transferred.
    /// </summary>
    Task SendCallTransferredAsync(
        Guid tenantId,
        Guid callLogId,
        string callNumber,
        int transferredToUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when a call is scheduled.
    /// </summary>
    Task SendCallScheduledAsync(
        Guid tenantId,
        Guid callLogId,
        string callNumber,
        DateTime scheduledTime,
        string? customerName,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Competitor Notifications

    /// <summary>
    /// Send notification when competitor threat level changes.
    /// </summary>
    Task SendCompetitorThreatLevelChangedAsync(
        Guid tenantId,
        Guid competitorId,
        string competitorName,
        string oldThreatLevel,
        string newThreatLevel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when competitor intelligence report is created.
    /// </summary>
    Task SendCompetitorIntelligenceReportAsync(
        Guid tenantId,
        Guid competitorId,
        string competitorName,
        string reportType,
        CancellationToken cancellationToken = default);

    #endregion

    #region Pipeline Notifications

    /// <summary>
    /// Send notification when deal stage changes.
    /// </summary>
    Task SendDealStageChangedAsync(
        Guid tenantId,
        Guid dealId,
        string dealName,
        string oldStageName,
        string newStageName,
        decimal? amount,
        int changedById,
        CancellationToken cancellationToken = default);

    #endregion

    #region Lead Scoring Notifications

    /// <summary>
    /// Send notification when lead score threshold is reached.
    /// </summary>
    Task SendLeadScoreThresholdReachedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        int score,
        string thresholdName,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when lead is qualified by score.
    /// </summary>
    Task SendLeadQualifiedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        int score,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when lead grade changes.
    /// </summary>
    Task SendLeadGradeChangedAsync(
        Guid tenantId,
        Guid leadId,
        string leadName,
        string oldGrade,
        string newGrade,
        int ownerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Product Interest Notifications

    /// <summary>
    /// Send notification when product interest is converted to opportunity.
    /// </summary>
    Task SendProductInterestConvertedAsync(
        Guid tenantId,
        Guid productInterestId,
        string productName,
        Guid opportunityId,
        decimal? estimatedValue,
        int convertedById,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification for product interest follow-up.
    /// </summary>
    Task SendProductInterestFollowUpAsync(
        Guid tenantId,
        Guid productInterestId,
        string productName,
        DateTime followUpDate,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Survey Notifications

    /// <summary>
    /// Send notification when a survey is completed.
    /// </summary>
    Task SendSurveyCompletedAsync(
        Guid tenantId,
        Guid surveyResponseId,
        string surveyType,
        string? customerName,
        int? overallScore,
        int? npsScore,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send alert when a detractor response is received (NPS 0-6).
    /// </summary>
    Task SendDetractorAlertAsync(
        Guid tenantId,
        Guid surveyResponseId,
        Guid? customerId,
        string? customerName,
        int npsScore,
        string? feedback,
        int ownerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when survey follow-up is required.
    /// </summary>
    Task SendSurveyFollowUpRequiredAsync(
        Guid tenantId,
        Guid surveyResponseId,
        string surveyType,
        string? customerName,
        string followUpReason,
        string priority,
        int assignedToUserId,
        CancellationToken cancellationToken = default);

    #endregion
}
