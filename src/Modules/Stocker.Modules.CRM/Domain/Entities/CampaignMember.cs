using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class CampaignMember : TenantEntity
{
    public Guid CampaignId { get; private set; }
    public Guid? ContactId { get; private set; }
    public Guid? LeadId { get; private set; }
    public CampaignMemberStatus Status { get; private set; }
    public DateTime? RespondedDate { get; private set; }
    public DateTime? FirstOpenDate { get; private set; }
    public DateTime? LastOpenDate { get; private set; }
    public int OpenCount { get; private set; }
    public DateTime? FirstClickDate { get; private set; }
    public DateTime? LastClickDate { get; private set; }
    public int ClickCount { get; private set; }
    public DateTime? UnsubscribedDate { get; private set; }
    public DateTime? BouncedDate { get; private set; }
    public string? BounceReason { get; private set; }
    public bool HasConverted { get; private set; }
    public DateTime? ConvertedDate { get; private set; }
    public Guid? ConvertedOpportunityId { get; private set; }
    
    public Campaign Campaign { get; private set; }
    public Contact? Contact { get; private set; }
    public Lead? Lead { get; private set; }
    public Opportunity? ConvertedOpportunity { get; private set; }
    
    protected CampaignMember() : base() { }
    
    public CampaignMember(
        Guid tenantId,
        Guid campaignId,
        Guid? contactId = null,
        Guid? leadId = null) : base(Guid.NewGuid(), tenantId)
    {
        if (contactId == null && leadId == null)
            throw new ArgumentException("Either ContactId or LeadId must be provided");
            
        if (contactId != null && leadId != null)
            throw new ArgumentException("Cannot have both ContactId and LeadId");
            
        CampaignId = campaignId;
        ContactId = contactId;
        LeadId = leadId;
        Status = CampaignMemberStatus.Sent;
        OpenCount = 0;
        ClickCount = 0;
        HasConverted = false;
    }
    
    public void MarkAsReceived()
    {
        if (Status < CampaignMemberStatus.Received)
            Status = CampaignMemberStatus.Received;
    }
    
    public void RecordOpen()
    {
        var now = DateTime.UtcNow;
        
        if (FirstOpenDate == null)
        {
            FirstOpenDate = now;
            Status = CampaignMemberStatus.Opened;
        }
        
        LastOpenDate = now;
        OpenCount++;
    }
    
    public void RecordClick()
    {
        var now = DateTime.UtcNow;
        
        if (FirstClickDate == null)
        {
            FirstClickDate = now;
            Status = CampaignMemberStatus.Clicked;
        }
        
        LastClickDate = now;
        ClickCount++;
    }
    
    public void MarkAsResponded()
    {
        RespondedDate = DateTime.UtcNow;
        Status = CampaignMemberStatus.Responded;
    }
    
    public void MarkAsConverted(Guid opportunityId)
    {
        HasConverted = true;
        ConvertedDate = DateTime.UtcNow;
        ConvertedOpportunityId = opportunityId;
        Status = CampaignMemberStatus.Converted;
    }
    
    public void MarkAsUnsubscribed()
    {
        UnsubscribedDate = DateTime.UtcNow;
        Status = CampaignMemberStatus.Unsubscribed;
    }
    
    public void MarkAsBounced(string reason)
    {
        BouncedDate = DateTime.UtcNow;
        BounceReason = reason;
        Status = CampaignMemberStatus.Bounced;
    }
    
    public decimal CalculateEngagementScore()
    {
        decimal score = 0;
        
        // Base points for actions
        if (Status >= CampaignMemberStatus.Received) score += 1;
        if (Status >= CampaignMemberStatus.Opened) score += 2;
        if (Status >= CampaignMemberStatus.Clicked) score += 5;
        if (Status >= CampaignMemberStatus.Responded) score += 10;
        if (Status >= CampaignMemberStatus.Converted) score += 20;
        
        // Additional points for engagement frequency
        score += OpenCount * 0.5m;
        score += ClickCount * 2;
        
        // Negative points for unsubscribe or bounce
        if (Status == CampaignMemberStatus.Unsubscribed) score -= 10;
        if (Status == CampaignMemberStatus.Bounced) score -= 5;
        
        return Math.Max(0, score);
    }
}