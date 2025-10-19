namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Categories for document classification in CRM
/// </summary>
public enum DocumentCategory
{
    /// <summary>
    /// General documents
    /// </summary>
    General = 0,

    /// <summary>
    /// Legal contracts, agreements
    /// </summary>
    Contract = 1,

    /// <summary>
    /// Financial invoices, receipts
    /// </summary>
    Invoice = 2,

    /// <summary>
    /// Sales proposals, quotes
    /// </summary>
    Proposal = 3,

    /// <summary>
    /// Product presentations, brochures
    /// </summary>
    Presentation = 4,

    /// <summary>
    /// Email attachments
    /// </summary>
    Email = 5,

    /// <summary>
    /// Meeting notes, minutes
    /// </summary>
    MeetingNotes = 6,

    /// <summary>
    /// Customer support tickets, requests
    /// </summary>
    SupportTicket = 7,

    /// <summary>
    /// Identity documents (ID, passport)
    /// </summary>
    IdentityDocument = 8,

    /// <summary>
    /// Certificates, licenses
    /// </summary>
    Certificate = 9,

    /// <summary>
    /// Reports, analysis
    /// </summary>
    Report = 10,

    /// <summary>
    /// Marketing materials
    /// </summary>
    Marketing = 11,

    /// <summary>
    /// Product images, photos
    /// </summary>
    Image = 12,

    /// <summary>
    /// Other uncategorized documents
    /// </summary>
    Other = 99
}
