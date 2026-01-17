using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Domain.Entities;

public class CustomerSegment : TenantAggregateRoot
{
    private readonly List<CustomerSegmentMember> _members = new();

    public string Name { get; private set; }
    public string? Description { get; private set; }
    public SegmentType Type { get; private set; }
    public string? Criteria { get; private set; }  // JSON for dynamic segments
    public string Color { get; private set; }  // Hex color string (e.g., "#1890ff")
    public bool IsActive { get; private set; }
    public int MemberCount { get; private set; }
    public Guid CreatedBy { get; private set; }
    public Guid? LastModifiedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual IReadOnlyList<CustomerSegmentMember> Members => _members.AsReadOnly();

    protected CustomerSegment() : base() { }

    public CustomerSegment(
        Guid tenantId,
        string name,
        SegmentType type,
        string color,
        Guid createdBy,
        string? description = null,
        string? criteria = null) : base(Guid.NewGuid(), tenantId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Segment name cannot be empty", nameof(name));

        if (type == SegmentType.Dynamic && string.IsNullOrWhiteSpace(criteria))
            throw new ArgumentException("Dynamic segments must have criteria", nameof(criteria));

        Name = name;
        Description = description;
        Type = type;
        Criteria = criteria;
        Color = color;
        IsActive = true;
        MemberCount = 0;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public Result UpdateDetails(string name, string? description, string color, Guid modifiedBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("CustomerSegment.Name", "Segment name cannot be empty"));

        Name = name;
        Description = description;
        Color = color;
        LastModifiedBy = modifiedBy;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result UpdateCriteria(string criteria, Guid modifiedBy)
    {
        if (Type != SegmentType.Dynamic)
            return Result.Failure(Error.Validation("CustomerSegment.Type", "Only dynamic segments can have criteria updated"));

        if (string.IsNullOrWhiteSpace(criteria))
            return Result.Failure(Error.Validation("CustomerSegment.Criteria", "Criteria cannot be empty for dynamic segments"));

        Criteria = criteria;
        LastModifiedBy = modifiedBy;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result AddMember(Guid customerId, SegmentMembershipReason reason = SegmentMembershipReason.Manual)
    {
        if (_members.Any(m => m.CustomerId == customerId))
            return Result.Failure(Error.Conflict("CustomerSegment.Member", "Customer is already a member of this segment"));

        var member = new CustomerSegmentMember(
            tenantId: TenantId,
            segmentId: Id,
            customerId: customerId,
            reason: reason
        );

        _members.Add(member);
        MemberCount = _members.Count;

        return Result.Success();
    }

    public Result RemoveMember(Guid customerId)
    {
        var member = _members.FirstOrDefault(m => m.CustomerId == customerId);
        if (member == null)
            return Result.Failure(Error.NotFound("CustomerSegment.Member", "Customer is not a member of this segment"));

        _members.Remove(member);
        MemberCount = _members.Count;

        return Result.Success();
    }

    public Result ClearMembers()
    {
        _members.Clear();
        MemberCount = 0;

        return Result.Success();
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public Result RecalculateMembers(IEnumerable<Guid> customerIds)
    {
        if (Type != SegmentType.Dynamic)
            return Result.Failure(Error.Validation("CustomerSegment.Type", "Only dynamic segments can be recalculated"));

        // Clear existing auto-criteria members
        var autoCriteriaMembers = _members.Where(m => m.Reason == SegmentMembershipReason.AutoCriteria).ToList();
        foreach (var member in autoCriteriaMembers)
        {
            _members.Remove(member);
        }

        // Add new members based on criteria evaluation
        foreach (var customerId in customerIds)
        {
            if (!_members.Any(m => m.CustomerId == customerId))
            {
                var member = new CustomerSegmentMember(
                    tenantId: TenantId,
                    segmentId: Id,
                    customerId: customerId,
                    reason: SegmentMembershipReason.AutoCriteria
                );
                _members.Add(member);
            }
        }

        MemberCount = _members.Count;

        return Result.Success();
    }
}
