using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a support ticket in the CRM system
/// </summary>
public class Ticket : TenantAggregateRoot
{
    private readonly List<TicketComment> _comments = new();
    private readonly List<TicketAttachment> _attachments = new();
    private readonly List<Guid> _watchers = new();

    /// <summary>
    /// Gets the ticket number
    /// </summary>
    public string TicketNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the subject
    /// </summary>
    public string Subject { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the description
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the ticket type
    /// </summary>
    public TicketType Type { get; private set; }

    /// <summary>
    /// Gets the ticket status
    /// </summary>
    public TicketStatus Status { get; private set; }

    /// <summary>
    /// Gets the priority
    /// </summary>
    public TicketPriority Priority { get; private set; }

    /// <summary>
    /// Gets the account ID
    /// </summary>
    public Guid? AccountId { get; private set; }

    /// <summary>
    /// Gets the account
    /// </summary>
    public Account? Account { get; private set; }

    /// <summary>
    /// Gets the contact ID
    /// </summary>
    public Guid? ContactId { get; private set; }

    /// <summary>
    /// Gets the contact
    /// </summary>
    public Contact? Contact { get; private set; }

    /// <summary>
    /// Gets the requester email
    /// </summary>
    public string RequesterEmail { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the requester name
    /// </summary>
    public string RequesterName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the assigned to user ID
    /// </summary>
    public Guid? AssignedToId { get; private set; }

    /// <summary>
    /// Gets the owner user ID
    /// </summary>
    public Guid OwnerId { get; private set; }

    /// <summary>
    /// Gets the category
    /// </summary>
    public string? Category { get; private set; }

    /// <summary>
    /// Gets the subcategory
    /// </summary>
    public string? SubCategory { get; private set; }

    /// <summary>
    /// Gets the product ID
    /// </summary>
    public Guid? ProductId { get; private set; }

    /// <summary>
    /// Gets the SLA ID
    /// </summary>
    public Guid? SlaId { get; private set; }

    /// <summary>
    /// Gets the due date
    /// </summary>
    public DateTime? DueDate { get; private set; }

    /// <summary>
    /// Gets the first response date
    /// </summary>
    public DateTime? FirstResponseDate { get; private set; }

    /// <summary>
    /// Gets the resolution date
    /// </summary>
    public DateTime? ResolutionDate { get; private set; }

    /// <summary>
    /// Gets the closed date
    /// </summary>
    public DateTime? ClosedDate { get; private set; }

    /// <summary>
    /// Gets the reopened count
    /// </summary>
    public int ReopenedCount { get; private set; }

    /// <summary>
    /// Gets the escalation level
    /// </summary>
    public int EscalationLevel { get; private set; }

    /// <summary>
    /// Gets whether it's escalated
    /// </summary>
    public bool IsEscalated { get; private set; }

    /// <summary>
    /// Gets the resolution
    /// </summary>
    public string? Resolution { get; private set; }

    /// <summary>
    /// Gets the satisfaction rating
    /// </summary>
    public int? SatisfactionRating { get; private set; }

    /// <summary>
    /// Gets the satisfaction comment
    /// </summary>
    public string? SatisfactionComment { get; private set; }

    /// <summary>
    /// Gets the source
    /// </summary>
    public string? Source { get; private set; }

    /// <summary>
    /// Gets the comments
    /// </summary>
    public IReadOnlyList<TicketComment> Comments => _comments.AsReadOnly();

    /// <summary>
    /// Gets the attachments
    /// </summary>
    public IReadOnlyList<TicketAttachment> Attachments => _attachments.AsReadOnly();

    /// <summary>
    /// Gets the watchers
    /// </summary>
    public IReadOnlyList<Guid> Watchers => _watchers.AsReadOnly();

    /// <summary>
    /// Gets the created date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last modified date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Ticket() : base()
    {
    }

    /// <summary>
    /// Creates a new ticket
    /// </summary>
    public static Result<Ticket> Create(
        Guid tenantId,
        string subject,
        string description,
        string requesterEmail,
        string requesterName,
        Guid ownerId,
        TicketType type = TicketType.Question,
        TicketPriority priority = TicketPriority.Normal)
    {
        if (string.IsNullOrWhiteSpace(subject))
            return Result<Ticket>.Failure(Error.Validation("Ticket.Subject", "Subject is required"));

        if (string.IsNullOrWhiteSpace(description))
            return Result<Ticket>.Failure(Error.Validation("Ticket.Description", "Description is required"));

        if (string.IsNullOrWhiteSpace(requesterEmail))
            return Result<Ticket>.Failure(Error.Validation("Ticket.RequesterEmail", "Requester email is required"));

        if (!IsValidEmail(requesterEmail))
            return Result<Ticket>.Failure(Error.Validation("Ticket.RequesterEmail", "Invalid email format"));

        if (ownerId == Guid.Empty)
            return Result<Ticket>.Failure(Error.Validation("Ticket.OwnerId", "Owner is required"));

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            TicketNumber = GenerateTicketNumber(),
            Subject = subject,
            Description = description,
            RequesterEmail = requesterEmail.ToLowerInvariant(),
            RequesterName = requesterName,
            Type = type,
            Status = TicketStatus.New,
            Priority = priority,
            OwnerId = ownerId,
            EscalationLevel = 0,
            IsEscalated = false,
            ReopenedCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        ticket.SetTenantId(tenantId);

        // Set initial due date based on priority
        ticket.SetDueDateByPriority();

        return Result<Ticket>.Success(ticket);
    }

    /// <summary>
    /// Updates ticket details
    /// </summary>
    public Result UpdateDetails(
        string subject,
        string description,
        TicketType type,
        TicketPriority priority)
    {
        if (string.IsNullOrWhiteSpace(subject))
            return Result.Failure(Error.Validation("Ticket.Subject", "Subject is required"));

        if (string.IsNullOrWhiteSpace(description))
            return Result.Failure(Error.Validation("Ticket.Description", "Description is required"));

        Subject = subject;
        Description = description;
        Type = type;
        
        var oldPriority = Priority;
        Priority = priority;
        
        // Update due date if priority changed
        if (oldPriority != priority && Status != TicketStatus.Resolved && Status != TicketStatus.Closed)
        {
            SetDueDateByPriority();
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Assigns ticket to user
    /// </summary>
    public Result AssignTo(Guid userId)
    {
        if (userId == Guid.Empty)
            return Result.Failure(Error.Validation("Ticket.AssignedTo", "Invalid user ID"));

        if (Status == TicketStatus.Closed)
            return Result.Failure(Error.Conflict("Ticket.Status", "Cannot assign closed tickets"));

        AssignedToId = userId;
        
        if (Status == TicketStatus.New)
        {
            Status = TicketStatus.Open;
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates ticket status
    /// </summary>
    public Result UpdateStatus(TicketStatus status)
    {
        if (Status == TicketStatus.Closed && status != TicketStatus.Closed)
        {
            ReopenedCount++;
        }

        var oldStatus = Status;
        Status = status;

        switch (status)
        {
            case TicketStatus.Resolved:
                ResolutionDate = DateTime.UtcNow;
                break;
            case TicketStatus.Closed:
                ClosedDate = DateTime.UtcNow;
                break;
            case TicketStatus.Open:
                if (oldStatus == TicketStatus.New && FirstResponseDate == null)
                {
                    FirstResponseDate = DateTime.UtcNow;
                }
                break;
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds a comment
    /// </summary>
    public Result AddComment(string text, Guid userId, bool isInternal = false)
    {
        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure(Error.Validation("Ticket.Comment", "Comment text is required"));

        if (Status == TicketStatus.Closed)
            return Result.Failure(Error.Conflict("Ticket.Status", "Cannot add comments to closed tickets"));

        var comment = TicketComment.Create(text, userId, isInternal);
        _comments.Add(comment);

        // Set first response date if this is the first response
        if (!isInternal && FirstResponseDate == null && userId != OwnerId)
        {
            FirstResponseDate = DateTime.UtcNow;
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds an attachment
    /// </summary>
    public Result AddAttachment(string fileName, string fileUrl, long fileSize, string contentType)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return Result.Failure(Error.Validation("Ticket.Attachment", "File name is required"));

        if (string.IsNullOrWhiteSpace(fileUrl))
            return Result.Failure(Error.Validation("Ticket.Attachment", "File URL is required"));

        var attachment = TicketAttachment.Create(fileName, fileUrl, fileSize, contentType);
        _attachments.Add(attachment);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Resolves the ticket
    /// </summary>
    public Result Resolve(string resolution)
    {
        if (string.IsNullOrWhiteSpace(resolution))
            return Result.Failure(Error.Validation("Ticket.Resolution", "Resolution is required"));

        if (Status == TicketStatus.Closed)
            return Result.Failure(Error.Conflict("Ticket.Status", "Ticket is already closed"));

        Status = TicketStatus.Resolved;
        Resolution = resolution;
        ResolutionDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Closes the ticket
    /// </summary>
    public Result Close()
    {
        if (Status != TicketStatus.Resolved)
            return Result.Failure(Error.Conflict("Ticket.Status", "Ticket must be resolved before closing"));

        Status = TicketStatus.Closed;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Reopens the ticket
    /// </summary>
    public Result Reopen(string reason)
    {
        if (Status != TicketStatus.Resolved && Status != TicketStatus.Closed)
            return Result.Failure(Error.Conflict("Ticket.Status", "Can only reopen resolved or closed tickets"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("Ticket.Reopen", "Reopen reason is required"));

        Status = TicketStatus.Open;
        ReopenedCount++;
        ResolutionDate = null;
        ClosedDate = null;
        Resolution = null;

        // Add reopen comment
        var comment = TicketComment.Create($"Ticket reopened: {reason}", OwnerId, true);
        _comments.Add(comment);

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Escalates the ticket
    /// </summary>
    public Result Escalate(int level)
    {
        if (level <= EscalationLevel)
            return Result.Failure(Error.Validation("Ticket.Escalation", "New escalation level must be higher"));

        if (Status == TicketStatus.Closed || Status == TicketStatus.Resolved)
            return Result.Failure(Error.Conflict("Ticket.Status", "Cannot escalate resolved or closed tickets"));

        EscalationLevel = level;
        IsEscalated = true;
        Priority = TicketPriority.High; // Auto-increase priority on escalation
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds satisfaction rating
    /// </summary>
    public Result AddSatisfactionRating(int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            return Result.Failure(Error.Validation("Ticket.Rating", "Rating must be between 1 and 5"));

        if (Status != TicketStatus.Closed && Status != TicketStatus.Resolved)
            return Result.Failure(Error.Conflict("Ticket.Status", "Can only rate resolved or closed tickets"));

        SatisfactionRating = rating;
        SatisfactionComment = comment;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds a watcher
    /// </summary>
    public Result AddWatcher(Guid userId)
    {
        if (userId == Guid.Empty)
            return Result.Failure(Error.Validation("Ticket.Watcher", "Invalid user ID"));

        if (_watchers.Contains(userId))
            return Result.Failure(Error.Conflict("Ticket.Watcher", "User is already watching"));

        _watchers.Add(userId);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets due date by priority
    /// </summary>
    private void SetDueDateByPriority()
    {
        DueDate = Priority switch
        {
            TicketPriority.Critical => DateTime.UtcNow.AddHours(4),
            TicketPriority.High => DateTime.UtcNow.AddHours(8),
            TicketPriority.Normal => DateTime.UtcNow.AddDays(1),
            TicketPriority.Low => DateTime.UtcNow.AddDays(3),
            _ => DateTime.UtcNow.AddDays(1)
        };
    }

    /// <summary>
    /// Generates ticket number
    /// </summary>
    private static string GenerateTicketNumber()
    {
        return $"TKT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }

    /// <summary>
    /// Validates email format
    /// </summary>
    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// Represents a comment on a ticket
/// </summary>
public class TicketComment
{
    public Guid Id { get; private set; }
    public string Text { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public bool IsInternal { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private TicketComment() { }

    public static TicketComment Create(string text, Guid userId, bool isInternal)
    {
        return new TicketComment
        {
            Id = Guid.NewGuid(),
            Text = text,
            UserId = userId,
            IsInternal = isInternal,
            CreatedAt = DateTime.UtcNow
        };
    }
}

/// <summary>
/// Represents an attachment on a ticket
/// </summary>
public class TicketAttachment
{
    public Guid Id { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string FileUrl { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public DateTime UploadedAt { get; private set; }

    private TicketAttachment() { }

    public static TicketAttachment Create(string fileName, string fileUrl, long fileSize, string contentType)
    {
        return new TicketAttachment
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            FileUrl = fileUrl,
            FileSize = fileSize,
            ContentType = contentType,
            UploadedAt = DateTime.UtcNow
        };
    }
}