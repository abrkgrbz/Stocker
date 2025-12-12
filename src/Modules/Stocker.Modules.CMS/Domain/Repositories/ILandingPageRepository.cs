using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface ITestimonialRepository
{
    Task<Testimonial?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Testimonial>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Testimonial>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Testimonial>> GetFeaturedAsync(CancellationToken cancellationToken = default);
    Task<Testimonial> AddAsync(Testimonial entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Testimonial entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IPricingPlanRepository
{
    Task<PricingPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PricingPlan?> GetByIdWithFeaturesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<PricingPlan>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PricingPlan>> GetAllWithFeaturesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PricingPlan>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<PricingPlan> AddAsync(PricingPlan entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(PricingPlan entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IPricingFeatureRepository
{
    Task<PricingFeature?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<PricingFeature>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<PricingFeature> AddAsync(PricingFeature entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(PricingFeature entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IFeatureRepository
{
    Task<Feature?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Feature>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Feature>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Feature>> GetFeaturedAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Feature>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<Feature> AddAsync(Feature entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Feature entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IIndustryRepository
{
    Task<Industry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Industry?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<Industry>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Industry>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Industry> AddAsync(Industry entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Industry entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IIntegrationRepository
{
    Task<Integration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Integration?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Integration?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<Integration>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Integration>> GetAllWithItemsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Integration>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Integration> AddAsync(Integration entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Integration entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IIntegrationItemRepository
{
    Task<IntegrationItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<IntegrationItem>> GetByIntegrationIdAsync(Guid integrationId, CancellationToken cancellationToken = default);
    Task<IntegrationItem> AddAsync(IntegrationItem entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(IntegrationItem entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IStatRepository
{
    Task<Stat?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Stat>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Stat>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Stat>> GetBySectionAsync(string section, CancellationToken cancellationToken = default);
    Task<Stat> AddAsync(Stat entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Stat entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IPartnerRepository
{
    Task<Partner?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Partner>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Partner>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Partner>> GetFeaturedAsync(CancellationToken cancellationToken = default);
    Task<Partner> AddAsync(Partner entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Partner entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IAchievementRepository
{
    Task<Achievement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Achievement>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Achievement>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Achievement> AddAsync(Achievement entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Achievement entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
