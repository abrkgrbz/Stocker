using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class SurveyResponseDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public SurveyType SurveyType { get; set; }
    public string SurveyName { get; set; } = string.Empty;
    public SurveyResponseStatus Status { get; set; }

    // Relationships
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? TicketId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? CampaignId { get; set; }

    // Respondent Information
    public string? RespondentName { get; set; }
    public string? RespondentEmail { get; set; }
    public string? RespondentPhone { get; set; }
    public bool IsAnonymous { get; set; }

    // NPS
    public int? NpsScore { get; set; }
    public NpsCategory? NpsCategory { get; set; }

    // CSAT
    public int? CsatScore { get; set; }

    // CES
    public int? CesScore { get; set; }

    // Overall Scoring
    public decimal? OverallSatisfaction { get; set; }
    public bool? WouldRecommend { get; set; }
    public bool? WouldRepurchase { get; set; }

    // Time Information
    public DateTime? SentDate { get; set; }
    public DateTime? StartedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public int? CompletionTimeSeconds { get; set; }

    // Feedback
    public string? OverallComment { get; set; }
    public string? ImprovementSuggestion { get; set; }
    public string? Praise { get; set; }
    public string? Complaint { get; set; }

    // Follow-up
    public bool FollowUpRequired { get; set; }
    public bool FollowUpDone { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string? FollowUpNote { get; set; }
    public int? AssignedToUserId { get; set; }

    // Technical
    public SurveySource Source { get; set; }
    public string? DeviceType { get; set; }
    public string? IpAddress { get; set; }
    public string? Language { get; set; }

    // Answers
    public List<SurveyAnswerDto> Answers { get; set; } = new();
}

public class SurveyAnswerDto
{
    public Guid Id { get; set; }
    public string QuestionId { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string? Answer { get; set; }
    public int? Score { get; set; }
    public string? AnswerType { get; set; }
    public int SortOrder { get; set; }
}
