using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class Note : TenantEntity
{
    public string Title { get; private set; }
    public string Content { get; private set; }
    public NoteType Type { get; private set; }
    public bool IsPinned { get; private set; }
    public bool IsPrivate { get; private set; }

    // Specific relationships
    public Guid? CustomerId { get; private set; }
    public Guid? ContactId { get; private set; }
    public Guid? LeadId { get; private set; }
    public Guid? OpportunityId { get; private set; }
    public Guid? DealId { get; private set; }
    public Guid? ActivityId { get; private set; }
    
    // User tracking
    public int CreatedById { get; private set; }
    public int? LastModifiedById { get; private set; }
    
    // Attachments
    public string? AttachmentUrls { get; private set; }
    
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Opportunity? Opportunity { get; private set; }
    public virtual Deal? Deal { get; private set; }
    public virtual Activity? Activity { get; private set; }
    
    protected Note() : base() { }
    
    public Note(
        Guid tenantId,
        string title,
        string content,
        NoteType type,
        int createdById) : base(Guid.NewGuid(), tenantId)
    {
        Title = title;
        Content = content;
        Type = type;
        CreatedById = createdById;
        IsPinned = false;
        IsPrivate = false;
    }
    
    public void UpdateContent(string title, string content, int modifiedById)
    {
        Title = title;
        Content = content;
        LastModifiedById = modifiedById;
    }
    
    public void SetType(NoteType type)
    {
        Type = type;
    }
    
    public void Pin()
    {
        IsPinned = true;
    }
    
    public void Unpin()
    {
        IsPinned = false;
    }
    
    public void MakePrivate()
    {
        IsPrivate = true;
    }
    
    public void MakePublic()
    {
        IsPrivate = false;
    }

    public void RelateToCustomer(Guid customerId)
    {
        CustomerId = customerId;
        // Clear other relationships
        ContactId = null;
        LeadId = null;
        OpportunityId = null;
        DealId = null;
        ActivityId = null;
    }

    public void RelateToContact(Guid contactId)
    {
        ContactId = contactId;
        // Clear other relationships
        CustomerId = null;
        LeadId = null;
        OpportunityId = null;
        DealId = null;
        ActivityId = null;
    }

    public void RelateToLead(Guid leadId)
    {
        LeadId = leadId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        OpportunityId = null;
        DealId = null;
        ActivityId = null;
    }

    public void RelateToOpportunity(Guid opportunityId)
    {
        OpportunityId = opportunityId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        LeadId = null;
        DealId = null;
        ActivityId = null;
    }

    public void RelateToDeal(Guid dealId)
    {
        DealId = dealId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        LeadId = null;
        OpportunityId = null;
        ActivityId = null;
    }

    public void RelateToActivity(Guid activityId)
    {
        ActivityId = activityId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        LeadId = null;
        OpportunityId = null;
        DealId = null;
    }

    public void AddAttachment(string attachmentUrl)
    {
        if (string.IsNullOrEmpty(AttachmentUrls))
        {
            AttachmentUrls = attachmentUrl;
        }
        else
        {
            AttachmentUrls += ";" + attachmentUrl;
        }
    }
    
    public List<string> GetAttachmentUrls()
    {
        if (string.IsNullOrEmpty(AttachmentUrls))
            return new List<string>();
            
        return AttachmentUrls.Split(';').ToList();
    }
}