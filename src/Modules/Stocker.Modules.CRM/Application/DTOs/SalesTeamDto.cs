using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class SalesTeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }

    // Manager Information
    public int? TeamLeaderId { get; set; }
    public string? TeamLeaderName { get; set; }
    public Guid? ParentTeamId { get; set; }
    public string? ParentTeamName { get; set; }

    // Target Information
    public decimal? SalesTarget { get; set; }
    public string? TargetPeriod { get; set; }
    public string Currency { get; set; } = "TRY";

    // Territory Information
    public Guid? TerritoryId { get; set; }
    public string? TerritoryNames { get; set; }

    // Communication
    public string? TeamEmail { get; set; }
    public string? CommunicationChannel { get; set; }

    // Statistics
    public int ActiveMemberCount { get; set; }
    public int TotalMemberCount { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SalesTeamMemberDto
{
    public Guid Id { get; set; }
    public Guid SalesTeamId { get; set; }
    public string? SalesTeamName { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public SalesTeamRole Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime JoinedDate { get; set; }
    public DateTime? LeftDate { get; set; }
    public decimal? IndividualTarget { get; set; }
    public decimal? CommissionRate { get; set; }
}
