using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region SurveyResponse Events

/// <summary>
/// Raised when a survey is sent to customer
/// </summary>
public sealed record SurveySentDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    string SurveyName,
    Guid? CustomerId,
    Guid? ContactId,
    string? RespondentEmail,
    int SentById) : DomainEvent;

/// <summary>
/// Raised when a survey is started by respondent
/// </summary>
public sealed record SurveyStartedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    string SurveyName,
    string? RespondentName,
    string? RespondentEmail) : DomainEvent;

/// <summary>
/// Raised when a survey is completed
/// </summary>
public sealed record SurveyCompletedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    string SurveyName,
    Guid? CustomerId,
    string? CustomerName,
    int? OverallScore,
    int? NpsScore,
    int TotalQuestions,
    int AnsweredQuestions) : DomainEvent;

/// <summary>
/// Raised when NPS score is recorded
/// </summary>
public sealed record NpsScoreRecordedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    Guid? CustomerId,
    string? CustomerName,
    int NpsScore,
    string NpsCategory,
    string? Feedback) : DomainEvent;

/// <summary>
/// Raised when customer satisfaction score is recorded
/// </summary>
public sealed record CsatScoreRecordedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    Guid? CustomerId,
    string? CustomerName,
    int CsatScore,
    int MaxScore,
    Guid? TicketId,
    string? Feedback) : DomainEvent;

/// <summary>
/// Raised when a detractor response is received (NPS 0-6)
/// </summary>
public sealed record DetractorResponseReceivedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    Guid? CustomerId,
    string? CustomerName,
    int NpsScore,
    string? Feedback,
    int? OwnerId) : DomainEvent;

/// <summary>
/// Raised when a promoter response is received (NPS 9-10)
/// </summary>
public sealed record PromoterResponseReceivedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    Guid? CustomerId,
    string? CustomerName,
    int NpsScore,
    string? Feedback) : DomainEvent;

/// <summary>
/// Raised when survey response requires follow-up
/// </summary>
public sealed record SurveyFollowUpRequiredDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    Guid? CustomerId,
    string? CustomerName,
    string FollowUpReason,
    string Priority,
    int? AssignedToUserId) : DomainEvent;

/// <summary>
/// Raised when survey response is analyzed
/// </summary>
public sealed record SurveyResponseAnalyzedDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    string? Sentiment,
    List<string> KeyThemes,
    List<string> ActionItems) : DomainEvent;

/// <summary>
/// Raised when survey expires without response
/// </summary>
public sealed record SurveyExpiredDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    string SurveyName,
    Guid? CustomerId,
    string? RespondentEmail,
    DateTime ExpiryDate) : DomainEvent;

/// <summary>
/// Raised when survey reminder is sent
/// </summary>
public sealed record SurveyReminderSentDomainEvent(
    Guid SurveyResponseId,
    Guid TenantId,
    string SurveyType,
    string SurveyName,
    string? RespondentEmail,
    int ReminderNumber) : DomainEvent;

#endregion
