using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Duyuru entity'si
/// </summary>
public class Announcement : BaseEntity
{
    public string Title { get; private set; }
    public string Content { get; private set; }
    public AnnouncementType Type { get; private set; }
    public AnnouncementPriority Priority { get; private set; }
    public DateTime PublishDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public int? DepartmentId { get; private set; }
    public int AuthorId { get; private set; }
    public bool IsPublished { get; private set; }
    public bool IsPinned { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public int ViewCount { get; private set; }
    public bool RequiresAcknowledgment { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual Department? Department { get; private set; }
    public virtual Employee Author { get; private set; } = null!;
    public virtual ICollection<AnnouncementAcknowledgment> Acknowledgments { get; private set; }

    protected Announcement()
    {
        Title = string.Empty;
        Content = string.Empty;
        Acknowledgments = new List<AnnouncementAcknowledgment>();
    }

    public Announcement(
        string title,
        string content,
        int authorId,
        AnnouncementType type = AnnouncementType.General,
        AnnouncementPriority priority = AnnouncementPriority.Normal,
        int? departmentId = null)
    {
        Title = title;
        Content = content;
        AuthorId = authorId;
        Type = type;
        Priority = priority;
        DepartmentId = departmentId;
        PublishDate = DateTime.UtcNow;
        IsPublished = false;
        IsPinned = false;
        IsActive = true;
        ViewCount = 0;
        Acknowledgments = new List<AnnouncementAcknowledgment>();
    }

    public void Update(
        string title,
        string content,
        AnnouncementType type,
        AnnouncementPriority priority,
        int? departmentId)
    {
        Title = title;
        Content = content;
        Type = type;
        Priority = priority;
        DepartmentId = departmentId;
    }

    public void SetExpiryDate(DateTime? expiryDate)
    {
        ExpiryDate = expiryDate;
    }

    public void SetAttachment(string? attachmentUrl)
    {
        AttachmentUrl = attachmentUrl;
    }

    public void Publish()
    {
        IsPublished = true;
        PublishDate = DateTime.UtcNow;
    }

    public void Unpublish()
    {
        IsPublished = false;
    }

    public void Pin()
    {
        IsPinned = true;
    }

    public void Unpin()
    {
        IsPinned = false;
    }

    public void IncrementViewCount()
    {
        ViewCount++;
    }

    public void SetRequiresAcknowledgment(bool requires)
    {
        RequiresAcknowledgment = requires;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public bool IsExpired()
    {
        return ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    }

    public bool IsVisible()
    {
        return IsActive && IsPublished && !IsExpired();
    }
}

/// <summary>
/// Duyuru türü
/// </summary>
public enum AnnouncementType
{
    /// <summary>
    /// Genel
    /// </summary>
    General = 1,

    /// <summary>
    /// Politika
    /// </summary>
    Policy = 2,

    /// <summary>
    /// Etkinlik
    /// </summary>
    Event = 3,

    /// <summary>
    /// Acil
    /// </summary>
    Urgent = 4,

    /// <summary>
    /// Eğitim
    /// </summary>
    Training = 5,

    /// <summary>
    /// Kutlama
    /// </summary>
    Celebration = 6,

    /// <summary>
    /// Sistem
    /// </summary>
    System = 7
}

/// <summary>
/// Duyuru önceliği
/// </summary>
public enum AnnouncementPriority
{
    /// <summary>
    /// Düşük
    /// </summary>
    Low = 1,

    /// <summary>
    /// Normal
    /// </summary>
    Normal = 2,

    /// <summary>
    /// Yüksek
    /// </summary>
    High = 3,

    /// <summary>
    /// Kritik
    /// </summary>
    Critical = 4
}
