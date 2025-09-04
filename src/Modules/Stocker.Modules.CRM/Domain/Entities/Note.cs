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
    
    // Polymorphic relationships
    public string? RelatedEntityType { get; private set; }
    public int? RelatedEntityId { get; private set; }
    
    // Specific relationships
    public int? CustomerId { get; private set; }
    public int? ContactId { get; private set; }
    public int? LeadId { get; private set; }
    public int? OpportunityId { get; private set; }
    public int? DealId { get; private set; }
    public int? ActivityId { get; private set; }
    
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
    
    protected Note() { }
    
    public Note(
        Guid tenantId,
        string title,
        string content,
        NoteType type,
        int createdById) : base(tenantId)
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
    
    public void RelateToEntity(string entityType, int entityId)
    {
        RelatedEntityType = entityType;
        RelatedEntityId = entityId;
        
        // Clear specific relationships
        CustomerId = null;
        ContactId = null;
        LeadId = null;
        OpportunityId = null;
        DealId = null;
        ActivityId = null;
        
        // Set specific relationship based on entity type
        switch (entityType.ToLower())
        {
            case "customer":
                CustomerId = entityId;
                break;
            case "contact":
                ContactId = entityId;
                break;
            case "lead":
                LeadId = entityId;
                break;
            case "opportunity":
                OpportunityId = entityId;
                break;
            case "deal":
                DealId = entityId;
                break;
            case "activity":
                ActivityId = entityId;
                break;
        }
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