using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class CampaignDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignType Type { get; set; }
    public CampaignStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal BudgetedCost { get; set; }
    public decimal ActualCost { get; set; }
    public decimal ExpectedRevenue { get; set; }
    public decimal ActualRevenue { get; set; }
    public string? TargetAudience { get; set; }
    public int TargetLeads { get; set; }
    public int ActualLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public string? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public decimal ConversionRate => ActualLeads > 0 ? (decimal)ConvertedLeads / ActualLeads * 100 : 0;
    public decimal ROI => ActualCost > 0 ? (ActualRevenue - ActualCost) / ActualCost * 100 : 0;
    public int MemberCount { get; set; }
    public List<CampaignMemberDto> TopMembers { get; set; } = new();

    // Email campaign performance metrics
    public int? TotalRecipients { get; set; }
    public int? DeliveredCount { get; set; }
    public int? OpenedCount { get; set; }
    public int? ClickedCount { get; set; }
    public int? SentCount { get; set; }
    public int? ResponseCount { get; set; }
    public int? ConvertedCount { get; set; }
    public string? TargetSegmentName { get; set; }
    public string? CustomerName { get; set; }
}

public class CampaignMemberDto
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public Guid? ContactId { get; set; }
    public string? ContactName { get; set; }
    public CampaignMemberStatus Status { get; set; }
    public bool HasResponded { get; set; }
    public DateTime? RespondedDate { get; set; }
    public bool IsConverted { get; set; }
    public DateTime? ConvertedDate { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public class CampaignRoiDto
{
    public Guid CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public decimal BudgetedCost { get; set; }
    public decimal ActualCost { get; set; }
    public decimal ExpectedRevenue { get; set; }
    public decimal ActualRevenue { get; set; }
    public decimal GrossProfit => ActualRevenue - ActualCost;
    public decimal ROI => ActualCost > 0 ? GrossProfit / ActualCost * 100 : 0;
    public decimal CostPerLead => ActualLeads > 0 ? ActualCost / ActualLeads : 0;
    public decimal CostPerConversion => ConvertedLeads > 0 ? ActualCost / ConvertedLeads : 0;
    public decimal RevenuePerConversion => ConvertedLeads > 0 ? ActualRevenue / ConvertedLeads : 0;
    public int ActualLeads { get; set; }
    public int ConvertedLeads { get; set; }
}

public class CampaignStatisticsDto
{
    public Guid CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public int TotalMembers { get; set; }
    public int RespondedMembers { get; set; }
    public int ConvertedMembers { get; set; }
    public decimal ResponseRate { get; set; }
    public decimal ConversionRate { get; set; }
    public Dictionary<CampaignMemberStatus, int> MembersByStatus { get; set; } = new();
    public List<DailyCampaignActivityDto> DailyActivity { get; set; } = new();
    public List<ChannelPerformanceDto> ChannelPerformance { get; set; } = new();
}

public class DailyCampaignActivityDto
{
    public DateTime Date { get; set; }
    public int NewMembers { get; set; }
    public int Responses { get; set; }
    public int Conversions { get; set; }
}

public class ChannelPerformanceDto
{
    public string Channel { get; set; } = string.Empty;
    public int Leads { get; set; }
    public int Conversions { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal Cost { get; set; }
    public decimal Revenue { get; set; }
    public decimal ROI { get; set; }
}

public class BulkImportResultDto
{
    public int TotalRecords { get; set; }
    public int SuccessfulImports { get; set; }
    public int FailedImports { get; set; }
    public List<string> Errors { get; set; } = new();
}