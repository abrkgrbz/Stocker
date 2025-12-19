using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Interfaces;

/// <summary>
/// Unit of Work interface specific to the CRM (Customer Relationship Management) module.
/// Provides access to CRM-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in CRM handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across CRM operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.CRMUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
///
/// MIGRATION NOTE: This replaces the old CRMUnitOfWork that directly implemented IUnitOfWork.
/// The new implementation inherits from BaseUnitOfWork for consistency.
/// </remarks>
public interface ICRMUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    #region Core Customer Management Repositories

    /// <summary>
    /// Gets the Customer repository.
    /// </summary>
    ICustomerRepository Customers { get; }

    /// <summary>
    /// Gets the Contact repository.
    /// </summary>
    IContactRepository Contacts { get; }

    /// <summary>
    /// Gets the Lead repository.
    /// </summary>
    ILeadRepository Leads { get; }

    /// <summary>
    /// Gets the Deal repository.
    /// </summary>
    IDealRepository Deals { get; }

    #endregion

    #region Customer Segmentation Repositories

    /// <summary>
    /// Gets the Customer Segment repository.
    /// </summary>
    ICustomerSegmentRepository CustomerSegments { get; }

    /// <summary>
    /// Gets the Customer Tag repository.
    /// </summary>
    ICustomerTagRepository CustomerTags { get; }

    #endregion

    #region Document and Workflow Repositories

    /// <summary>
    /// Gets the Document repository.
    /// </summary>
    IDocumentRepository Documents { get; }

    /// <summary>
    /// Gets the Workflow repository.
    /// </summary>
    IWorkflowRepository Workflows { get; }

    /// <summary>
    /// Gets the Workflow Execution repository.
    /// </summary>
    IWorkflowExecutionRepository WorkflowExecutions { get; }

    #endregion

    #region Communication Repositories

    /// <summary>
    /// Gets the Notification repository.
    /// </summary>
    INotificationRepository Notifications { get; }

    /// <summary>
    /// Gets the Reminder repository.
    /// </summary>
    IReminderRepository Reminders { get; }

    /// <summary>
    /// Gets the Call Log repository.
    /// </summary>
    ICallLogRepository CallLogs { get; }

    /// <summary>
    /// Gets the Meeting repository.
    /// </summary>
    IMeetingRepository Meetings { get; }

    #endregion

    #region Sales and Competition Repositories

    /// <summary>
    /// Gets the Competitor repository.
    /// </summary>
    ICompetitorRepository Competitors { get; }

    /// <summary>
    /// Gets the Product Interest repository.
    /// </summary>
    IProductInterestRepository ProductInterests { get; }

    /// <summary>
    /// Gets the Sales Team repository.
    /// </summary>
    ISalesTeamRepository SalesTeams { get; }

    /// <summary>
    /// Gets the Territory repository.
    /// </summary>
    ITerritoryRepository Territories { get; }

    #endregion

    #region Social and Referral Repositories

    /// <summary>
    /// Gets the Social Media Profile repository.
    /// </summary>
    ISocialMediaProfileRepository SocialMediaProfiles { get; }

    /// <summary>
    /// Gets the Referral repository.
    /// </summary>
    IReferralRepository Referrals { get; }

    /// <summary>
    /// Gets the Survey Response repository.
    /// </summary>
    ISurveyResponseRepository SurveyResponses { get; }

    #endregion

    #region Loyalty Repositories

    /// <summary>
    /// Gets the Loyalty Program repository.
    /// </summary>
    ILoyaltyProgramRepository LoyaltyPrograms { get; }

    /// <summary>
    /// Gets the Loyalty Membership repository.
    /// </summary>
    ILoyaltyMembershipRepository LoyaltyMemberships { get; }

    #endregion
}
