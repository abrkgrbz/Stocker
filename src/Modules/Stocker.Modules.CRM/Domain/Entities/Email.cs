using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents an email in the CRM system
/// </summary>
public class Email : TenantAggregateRoot
{
    private readonly List<EmailRecipient> _recipients = new();
    private readonly List<EmailAttachment> _attachments = new();

    /// <summary>
    /// Gets the email subject
    /// </summary>
    public string Subject { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the email body
    /// </summary>
    public string Body { get; private set; } = string.Empty;

    /// <summary>
    /// Gets whether the body is HTML
    /// </summary>
    public bool IsHtml { get; private set; }

    /// <summary>
    /// Gets the from address
    /// </summary>
    public string FromAddress { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the from name
    /// </summary>
    public string? FromName { get; private set; }

    /// <summary>
    /// Gets the reply-to address
    /// </summary>
    public string? ReplyToAddress { get; private set; }

    /// <summary>
    /// Gets the email status
    /// </summary>
    public EmailStatus Status { get; private set; }

    /// <summary>
    /// Gets the communication direction
    /// </summary>
    public CommunicationDirection Direction { get; private set; }

    /// <summary>
    /// Gets the related entity type
    /// </summary>
    public RelatedEntityType? RelatedEntityType { get; private set; }

    /// <summary>
    /// Gets the related entity ID
    /// </summary>
    public Guid? RelatedEntityId { get; private set; }

    /// <summary>
    /// Gets the parent email ID (for threads)
    /// </summary>
    public Guid? ParentEmailId { get; private set; }

    /// <summary>
    /// Gets the parent email
    /// </summary>
    public Email? ParentEmail { get; private set; }

    /// <summary>
    /// Gets the owner user ID
    /// </summary>
    public Guid OwnerId { get; private set; }

    /// <summary>
    /// Gets the sent date
    /// </summary>
    public DateTime? SentDate { get; private set; }

    /// <summary>
    /// Gets the received date
    /// </summary>
    public DateTime? ReceivedDate { get; private set; }

    /// <summary>
    /// Gets the read date
    /// </summary>
    public DateTime? ReadDate { get; private set; }

    /// <summary>
    /// Gets the scheduled send date
    /// </summary>
    public DateTime? ScheduledSendDate { get; private set; }

    /// <summary>
    /// Gets the message ID
    /// </summary>
    public string? MessageId { get; private set; }

    /// <summary>
    /// Gets the thread ID
    /// </summary>
    public string? ThreadId { get; private set; }

    /// <summary>
    /// Gets the importance
    /// </summary>
    public string? Importance { get; private set; }

    /// <summary>
    /// Gets the bounce reason
    /// </summary>
    public string? BounceReason { get; private set; }

    /// <summary>
    /// Gets the email template ID
    /// </summary>
    public Guid? EmailTemplateId { get; private set; }

    /// <summary>
    /// Gets the campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    /// <summary>
    /// Gets the tracking ID
    /// </summary>
    public string? TrackingId { get; private set; }

    /// <summary>
    /// Gets whether opens are tracked
    /// </summary>
    public bool TrackOpens { get; private set; }

    /// <summary>
    /// Gets whether clicks are tracked
    /// </summary>
    public bool TrackClicks { get; private set; }

    /// <summary>
    /// Gets the open count
    /// </summary>
    public int OpenCount { get; private set; }

    /// <summary>
    /// Gets the click count
    /// </summary>
    public int ClickCount { get; private set; }

    /// <summary>
    /// Gets the recipients
    /// </summary>
    public IReadOnlyList<EmailRecipient> Recipients => _recipients.AsReadOnly();

    /// <summary>
    /// Gets the attachments
    /// </summary>
    public IReadOnlyList<EmailAttachment> Attachments => _attachments.AsReadOnly();

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
    private Email() : base()
    {
    }

    /// <summary>
    /// Creates a new email
    /// </summary>
    public static Result<Email> Create(
        Guid tenantId,
        string subject,
        string body,
        string fromAddress,
        Guid ownerId,
        CommunicationDirection direction,
        bool isHtml = true)
    {
        if (string.IsNullOrWhiteSpace(subject))
            return Result<Email>.Failure(Error.Validation("Email.Subject", "Subject is required"));

        if (string.IsNullOrWhiteSpace(body))
            return Result<Email>.Failure(Error.Validation("Email.Body", "Body is required"));

        if (string.IsNullOrWhiteSpace(fromAddress))
            return Result<Email>.Failure(Error.Validation("Email.FromAddress", "From address is required"));

        if (!IsValidEmail(fromAddress))
            return Result<Email>.Failure(Error.Validation("Email.FromAddress", "Invalid email format"));

        if (ownerId == Guid.Empty)
            return Result<Email>.Failure(Error.Validation("Email.OwnerId", "Owner is required"));

        var email = new Email
        {
            Id = Guid.NewGuid(),
            Subject = subject,
            Body = body,
            IsHtml = isHtml,
            FromAddress = fromAddress.ToLowerInvariant(),
            Status = EmailStatus.Draft,
            Direction = direction,
            OwnerId = ownerId,
            TrackOpens = false,
            TrackClicks = false,
            OpenCount = 0,
            ClickCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        email.SetTenantId(tenantId);
        email.GenerateTrackingId();

        return Result<Email>.Success(email);
    }

    /// <summary>
    /// Adds a recipient
    /// </summary>
    public Result AddRecipient(string emailAddress, string? name, RecipientType type)
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only add recipients to draft emails"));

        if (string.IsNullOrWhiteSpace(emailAddress))
            return Result.Failure(Error.Validation("Email.Recipient", "Email address is required"));

        if (!IsValidEmail(emailAddress))
            return Result.Failure(Error.Validation("Email.Recipient", "Invalid email format"));

        if (_recipients.Any(r => r.EmailAddress.Equals(emailAddress, StringComparison.OrdinalIgnoreCase) && r.Type == type))
            return Result.Failure(Error.Conflict("Email.Recipient", $"Recipient already exists as {type}"));

        var recipient = EmailRecipient.Create(emailAddress, name, type);
        _recipients.Add(recipient);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes a recipient
    /// </summary>
    public Result RemoveRecipient(Guid recipientId)
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only remove recipients from draft emails"));

        var recipient = _recipients.FirstOrDefault(r => r.Id == recipientId);
        if (recipient == null)
            return Result.Failure(Error.NotFound("Email.Recipient", "Recipient not found"));

        _recipients.Remove(recipient);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds an attachment
    /// </summary>
    public Result AddAttachment(string fileName, string fileUrl, long fileSize, string contentType)
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only add attachments to draft emails"));

        if (string.IsNullOrWhiteSpace(fileName))
            return Result.Failure(Error.Validation("Email.Attachment", "File name is required"));

        if (string.IsNullOrWhiteSpace(fileUrl))
            return Result.Failure(Error.Validation("Email.Attachment", "File URL is required"));

        var attachment = EmailAttachment.Create(fileName, fileUrl, fileSize, contentType);
        _attachments.Add(attachment);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets related entity
    /// </summary>
    public Result SetRelatedEntity(RelatedEntityType entityType, Guid entityId)
    {
        if (entityId == Guid.Empty)
            return Result.Failure(Error.Validation("Email.RelatedEntity", "Invalid entity ID"));

        RelatedEntityType = entityType;
        RelatedEntityId = entityId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets email template
    /// </summary>
    public Result SetEmailTemplate(Guid templateId)
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only set template for draft emails"));

        if (templateId == Guid.Empty)
            return Result.Failure(Error.Validation("Email.Template", "Invalid template ID"));

        EmailTemplateId = templateId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Schedules email send
    /// </summary>
    public Result ScheduleSend(DateTime sendDate)
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only schedule draft emails"));

        if (sendDate <= DateTime.UtcNow)
            return Result.Failure(Error.Validation("Email.ScheduledDate", "Scheduled date must be in the future"));

        if (!_recipients.Any(r => r.Type == RecipientType.To))
            return Result.Failure(Error.Validation("Email.Recipients", "At least one 'To' recipient is required"));

        ScheduledSendDate = sendDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sends the email
    /// </summary>
    public Result Send()
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only send draft emails"));

        if (!_recipients.Any(r => r.Type == RecipientType.To))
            return Result.Failure(Error.Validation("Email.Recipients", "At least one 'To' recipient is required"));

        Status = EmailStatus.Sent;
        SentDate = DateTime.UtcNow;
        GenerateMessageId();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Marks as delivered
    /// </summary>
    public Result MarkAsDelivered()
    {
        if (Status != EmailStatus.Sent)
            return Result.Failure(Error.Conflict("Email.Status", "Only sent emails can be marked as delivered"));

        Status = EmailStatus.Delivered;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Marks as read
    /// </summary>
    public Result MarkAsRead()
    {
        if (Status != EmailStatus.Delivered && Status != EmailStatus.Sent)
            return Result.Failure(Error.Conflict("Email.Status", "Email must be sent or delivered"));

        Status = EmailStatus.Read;
        ReadDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Marks as bounced
    /// </summary>
    public Result MarkAsBounced(string reason)
    {
        if (Status != EmailStatus.Sent)
            return Result.Failure(Error.Conflict("Email.Status", "Only sent emails can bounce"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("Email.BounceReason", "Bounce reason is required"));

        Status = EmailStatus.Bounced;
        BounceReason = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Records an open
    /// </summary>
    public void RecordOpen()
    {
        if (!TrackOpens) return;
        
        OpenCount++;
        if (ReadDate == null)
        {
            ReadDate = DateTime.UtcNow;
            Status = EmailStatus.Read;
        }
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Records a click
    /// </summary>
    public void RecordClick()
    {
        if (!TrackClicks) return;
        
        ClickCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Enables tracking
    /// </summary>
    public Result EnableTracking(bool trackOpens, bool trackClicks)
    {
        if (Status != EmailStatus.Draft)
            return Result.Failure(Error.Conflict("Email.Status", "Can only enable tracking for draft emails"));

        TrackOpens = trackOpens;
        TrackClicks = trackClicks;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Creates a reply
    /// </summary>
    public Result<Email> CreateReply(string body, Guid ownerId, bool replyAll = false)
    {
        var reply = new Email
        {
            Id = Guid.NewGuid(),
            Subject = Subject.StartsWith("Re:") ? Subject : $"Re: {Subject}",
            Body = body,
            IsHtml = IsHtml,
            FromAddress = FromAddress,
            FromName = FromName,
            Status = EmailStatus.Draft,
            Direction = CommunicationDirection.Outbound,
            ParentEmailId = Id,
            ThreadId = ThreadId ?? GenerateThreadId(),
            OwnerId = ownerId,
            RelatedEntityType = RelatedEntityType,
            RelatedEntityId = RelatedEntityId,
            TrackOpens = TrackOpens,
            TrackClicks = TrackClicks,
            CreatedAt = DateTime.UtcNow
        };

        reply.SetTenantId(TenantId);
        reply.GenerateTrackingId();

        // Add original sender as recipient
        reply._recipients.Add(EmailRecipient.Create(FromAddress, FromName, RecipientType.To));

        // If reply all, add other recipients
        if (replyAll)
        {
            foreach (var recipient in _recipients.Where(r => r.Type == RecipientType.To || r.Type == RecipientType.Cc))
            {
                if (!recipient.EmailAddress.Equals(FromAddress, StringComparison.OrdinalIgnoreCase))
                {
                    reply._recipients.Add(EmailRecipient.Create(
                        recipient.EmailAddress, 
                        recipient.Name, 
                        RecipientType.Cc));
                }
            }
        }

        return Result<Email>.Success(reply);
    }

    /// <summary>
    /// Generates tracking ID
    /// </summary>
    private void GenerateTrackingId()
    {
        TrackingId = $"TRK-{Guid.NewGuid().ToString("N")[..12].ToUpper()}";
    }

    /// <summary>
    /// Generates message ID
    /// </summary>
    private void GenerateMessageId()
    {
        MessageId = $"<{Guid.NewGuid()}@stocker.crm>";
    }

    /// <summary>
    /// Generates thread ID
    /// </summary>
    private string GenerateThreadId()
    {
        return $"THR-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
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
/// Represents an email recipient
/// </summary>
public class EmailRecipient
{
    public Guid Id { get; private set; }
    public string EmailAddress { get; private set; } = string.Empty;
    public string? Name { get; private set; }
    public RecipientType Type { get; private set; }

    private EmailRecipient() { }

    public static EmailRecipient Create(string emailAddress, string? name, RecipientType type)
    {
        return new EmailRecipient
        {
            Id = Guid.NewGuid(),
            EmailAddress = emailAddress.ToLowerInvariant(),
            Name = name,
            Type = type
        };
    }
}

/// <summary>
/// Represents an email attachment
/// </summary>
public class EmailAttachment
{
    public Guid Id { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string FileUrl { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string ContentType { get; private set; } = string.Empty;

    private EmailAttachment() { }

    public static EmailAttachment Create(string fileName, string fileUrl, long fileSize, string contentType)
    {
        return new EmailAttachment
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            FileUrl = fileUrl,
            FileSize = fileSize,
            ContentType = contentType
        };
    }
}

/// <summary>
/// Recipient type
/// </summary>
public enum RecipientType
{
    To,
    Cc,
    Bcc
}