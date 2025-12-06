using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Duyuru okundu bilgisi entity'si
/// </summary>
public class AnnouncementAcknowledgment : BaseEntity
{
    public int AnnouncementId { get; private set; }
    public int EmployeeId { get; private set; }
    public DateTime AcknowledgedDate { get; private set; }
    public string? Comments { get; private set; }

    // Navigation Properties
    public virtual Announcement Announcement { get; private set; } = null!;
    public virtual Employee Employee { get; private set; } = null!;

    protected AnnouncementAcknowledgment() { }

    public AnnouncementAcknowledgment(
        int announcementId,
        int employeeId,
        string? comments = null)
    {
        AnnouncementId = announcementId;
        EmployeeId = employeeId;
        AcknowledgedDate = DateTime.UtcNow;
        Comments = comments;
    }

    public void SetComments(string? comments)
    {
        Comments = comments;
    }
}
