using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class CompetitorDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public ThreatLevel ThreatLevel { get; set; }

    // Company Information
    public string? Website { get; set; }
    public string? Headquarters { get; set; }
    public int? FoundedYear { get; set; }
    public string? EmployeeCount { get; set; }
    public string? AnnualRevenue { get; set; }
    public decimal? MarketShare { get; set; }

    // Market Information
    public string? TargetMarkets { get; set; }
    public string? Industries { get; set; }
    public string? GeographicCoverage { get; set; }
    public string? CustomerSegments { get; set; }

    // Pricing Information
    public string? PricingStrategy { get; set; }
    public string? PriceRange { get; set; }
    public PriceComparison? PriceComparison { get; set; }

    // Sales & Marketing
    public string? SalesChannels { get; set; }
    public string? MarketingStrategy { get; set; }
    public string? KeyMessage { get; set; }
    public string? SocialMediaLinks { get; set; }

    // Contact Information
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Analysis Information
    public string? SwotSummary { get; set; }
    public string? CompetitiveStrategy { get; set; }
    public string? WinStrategy { get; set; }
    public string? LossReasons { get; set; }
    public DateTime? LastAnalysisDate { get; set; }
    public string? AnalyzedBy { get; set; }

    // Statistics
    public int EncounterCount { get; set; }
    public int WinCount { get; set; }
    public int LossCount { get; set; }
    public decimal WinRate { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? Tags { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
