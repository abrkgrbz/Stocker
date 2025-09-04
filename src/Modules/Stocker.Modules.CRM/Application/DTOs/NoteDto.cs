namespace Stocker.Modules.CRM.Application.DTOs;

public class NoteDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? LeadId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? DealId { get; set; }
    public bool IsPinned { get; set; }
    public string? CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}