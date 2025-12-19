using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CMS.Interfaces;

/// <summary>
/// Unit of Work interface specific to the CMS (Content Management System) module.
/// Provides access to CMS-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in CMS handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across CMS operations
/// </summary>
/// <remarks>
/// NOTE: CMS module is stored in master database (not tenant-specific)
/// So there's no TenantId property unlike other module UnitOfWorks.
///
/// Implementation: <see cref="Infrastructure.Persistence.CMSUnitOfWork"/>
/// Pattern: Implements IUnitOfWork directly (avoids circular dependency)
/// </remarks>
public interface ICMSUnitOfWork : IUnitOfWork
{
    #region Core CMS Repositories

    /// <summary>
    /// Gets the CMS Page repository.
    /// </summary>
    ICMSPageRepository Pages { get; }

    /// <summary>
    /// Gets the Blog repository.
    /// </summary>
    IBlogRepository Blog { get; }

    /// <summary>
    /// Gets the FAQ repository.
    /// </summary>
    IFAQRepository FAQ { get; }

    /// <summary>
    /// Gets the CMS Setting repository.
    /// </summary>
    ICMSSettingRepository Settings { get; }

    #endregion

    #region Landing Page Repositories

    /// <summary>
    /// Gets the Testimonial repository.
    /// </summary>
    ITestimonialRepository Testimonials { get; }

    /// <summary>
    /// Gets the Pricing Plan repository.
    /// </summary>
    IPricingPlanRepository PricingPlans { get; }

    /// <summary>
    /// Gets the Pricing Feature repository.
    /// </summary>
    IPricingFeatureRepository PricingFeatures { get; }

    /// <summary>
    /// Gets the Feature repository.
    /// </summary>
    IFeatureRepository Features { get; }

    /// <summary>
    /// Gets the Industry repository.
    /// </summary>
    IIndustryRepository Industries { get; }

    /// <summary>
    /// Gets the Integration repository.
    /// </summary>
    IIntegrationRepository Integrations { get; }

    /// <summary>
    /// Gets the Integration Item repository.
    /// </summary>
    IIntegrationItemRepository IntegrationItems { get; }

    /// <summary>
    /// Gets the Stat repository.
    /// </summary>
    IStatRepository Stats { get; }

    /// <summary>
    /// Gets the Partner repository.
    /// </summary>
    IPartnerRepository Partners { get; }

    /// <summary>
    /// Gets the Achievement repository.
    /// </summary>
    IAchievementRepository Achievements { get; }

    #endregion

    #region Company Page Repositories

    /// <summary>
    /// Gets the Team Member repository.
    /// </summary>
    ITeamMemberRepository TeamMembers { get; }

    /// <summary>
    /// Gets the Company Value repository.
    /// </summary>
    ICompanyValueRepository CompanyValues { get; }

    /// <summary>
    /// Gets the Contact Info repository.
    /// </summary>
    IContactInfoRepository ContactInfo { get; }

    /// <summary>
    /// Gets the Social Link repository.
    /// </summary>
    ISocialLinkRepository SocialLinks { get; }

    #endregion

    #region Documentation Repositories

    /// <summary>
    /// Gets the Doc Category repository.
    /// </summary>
    IDocCategoryRepository DocCategories { get; }

    /// <summary>
    /// Gets the Doc Article repository.
    /// </summary>
    IDocArticleRepository DocArticles { get; }

    #endregion
}
