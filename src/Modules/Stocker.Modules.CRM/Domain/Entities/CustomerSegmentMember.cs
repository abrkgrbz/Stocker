using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class CustomerSegmentMember : TenantEntity
{
    public Guid SegmentId { get; private set; }
    public Guid CustomerId { get; private set; }
    public DateTime AddedAt { get; private set; }
    public SegmentMembershipReason Reason { get; private set; }

    public CustomerSegment? Segment { get; private set; }
    public Customer? Customer { get; private set; }

    protected CustomerSegmentMember() : base() { }

    public CustomerSegmentMember(
        Guid tenantId,
        Guid segmentId,
        Guid customerId,
        SegmentMembershipReason reason) : base(Guid.NewGuid(), tenantId)
    {
        SegmentId = segmentId;
        CustomerId = customerId;
        AddedAt = DateTime.UtcNow;
        Reason = reason;
    }
}
