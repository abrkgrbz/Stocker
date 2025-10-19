using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class CustomerSegmentDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public SegmentType Type { get; set; }
    public string? Criteria { get; set; }
    public SegmentColor Color { get; set; }
    public bool IsActive { get; set; }
    public int MemberCount { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? LastModifiedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CustomerSegmentMemberDto
{
    public Guid Id { get; set; }
    public Guid SegmentId { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime AddedAt { get; set; }
    public SegmentMembershipReason Reason { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
}

public class CustomerTagDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public string Tag { get; set; } = string.Empty;
    public string? Color { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
