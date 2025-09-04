using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class LeadStatisticsDto
{
    public int TotalLeads { get; set; }
    public int NewLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int DisqualifiedLeads { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal QualificationRate { get; set; }
    public Dictionary<LeadStatus, int> LeadsByStatus { get; set; } = new();
    public Dictionary<LeadRating, int> LeadsByRating { get; set; } = new();
    public Dictionary<string, int> LeadsBySource { get; set; } = new();
    public List<MonthlyLeadDto> MonthlyLeads { get; set; } = new();
}

public class MonthlyLeadDto
{
    public string Month { get; set; } = string.Empty;
    public int NewLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int ConvertedLeads { get; set; }
}