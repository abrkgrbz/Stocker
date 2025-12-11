using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class TerritoryDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TerritoryType TerritoryType { get; set; }
    public bool IsActive { get; set; }

    // Hierarchy
    public Guid? ParentTerritoryId { get; set; }
    public int HierarchyLevel { get; set; }
    public string? HierarchyPath { get; set; }

    // Geographic
    public string? Country { get; set; }
    public string? CountryCode { get; set; }
    public string? Region { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? PostalCodeRange { get; set; }
    public string? GeoCoordinates { get; set; }

    // Targets
    public decimal? SalesTarget { get; set; }
    public int? TargetYear { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? PotentialValue { get; set; }

    // Assignment
    public Guid? AssignedSalesTeamId { get; set; }
    public int? PrimarySalesRepId { get; set; }
    public string? PrimarySalesRepName { get; set; }

    // Statistics
    public int CustomerCount { get; set; }
    public int OpportunityCount { get; set; }
    public decimal TotalSales { get; set; }
    public DateTime? StatsUpdatedAt { get; set; }

    // Assignments
    public List<TerritoryAssignmentDto> Assignments { get; set; } = new();
}

public class TerritoryAssignmentDto
{
    public Guid Id { get; set; }
    public Guid TerritoryId { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TerritoryAssignmentType AssignmentType { get; set; }
    public decimal? ResponsibilityPercentage { get; set; }
}
