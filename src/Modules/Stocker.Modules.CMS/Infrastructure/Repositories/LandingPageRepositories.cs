using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class TestimonialRepository : ITestimonialRepository
{
    private readonly CMSDbContext _context;

    public TestimonialRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Testimonial?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Testimonials.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Testimonial>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Testimonials
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Testimonial>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Testimonials
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Testimonial>> GetFeaturedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Testimonials
            .Where(t => t.IsActive && t.IsFeatured)
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Testimonial> AddAsync(Testimonial entity, CancellationToken cancellationToken = default)
    {
        await _context.Testimonials.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Testimonial entity, CancellationToken cancellationToken = default)
    {
        _context.Testimonials.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Testimonials.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class PricingPlanRepository : IPricingPlanRepository
{
    private readonly CMSDbContext _context;

    public PricingPlanRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<PricingPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.PricingPlans.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<PricingPlan?> GetByIdWithFeaturesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.PricingPlans
            .Include(p => p.Features)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<PricingPlan>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PricingPlans
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<PricingPlan>> GetAllWithFeaturesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PricingPlans
            .Include(p => p.Features.OrderBy(f => f.SortOrder))
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<PricingPlan>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PricingPlans
            .Include(p => p.Features.Where(f => f.IsActive).OrderBy(f => f.SortOrder))
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<PricingPlan> AddAsync(PricingPlan entity, CancellationToken cancellationToken = default)
    {
        await _context.PricingPlans.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(PricingPlan entity, CancellationToken cancellationToken = default)
    {
        _context.PricingPlans.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.PricingPlans.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class PricingFeatureRepository : IPricingFeatureRepository
{
    private readonly CMSDbContext _context;

    public PricingFeatureRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<PricingFeature?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.PricingFeatures.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<PricingFeature>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        return await _context.PricingFeatures
            .Where(f => f.PlanId == planId)
            .OrderBy(f => f.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<PricingFeature> AddAsync(PricingFeature entity, CancellationToken cancellationToken = default)
    {
        await _context.PricingFeatures.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(PricingFeature entity, CancellationToken cancellationToken = default)
    {
        _context.PricingFeatures.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.PricingFeatures.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class FeatureRepository : IFeatureRepository
{
    private readonly CMSDbContext _context;

    public FeatureRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Feature?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Features.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Feature>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Features
            .OrderBy(f => f.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Feature>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Features
            .Where(f => f.IsActive)
            .OrderBy(f => f.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Feature>> GetFeaturedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Features
            .Where(f => f.IsActive && f.IsFeatured)
            .OrderBy(f => f.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Feature>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await _context.Features
            .Where(f => f.IsActive && f.Category == category)
            .OrderBy(f => f.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Feature> AddAsync(Feature entity, CancellationToken cancellationToken = default)
    {
        await _context.Features.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Feature entity, CancellationToken cancellationToken = default)
    {
        _context.Features.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Features.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class IndustryRepository : IIndustryRepository
{
    private readonly CMSDbContext _context;

    public IndustryRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Industry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Industries.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Industry?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Industries
            .FirstOrDefaultAsync(i => i.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<Industry>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Industries
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Industry>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Industries
            .Where(i => i.IsActive)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Industry> AddAsync(Industry entity, CancellationToken cancellationToken = default)
    {
        await _context.Industries.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Industry entity, CancellationToken cancellationToken = default)
    {
        _context.Industries.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Industries.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class IntegrationRepository : IIntegrationRepository
{
    private readonly CMSDbContext _context;

    public IntegrationRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Integration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Integrations.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Integration?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Integrations
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<Integration?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Integrations
            .FirstOrDefaultAsync(i => i.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<Integration>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Integrations
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Integration>> GetAllWithItemsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Integrations
            .Include(i => i.Items.OrderBy(item => item.SortOrder))
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Integration>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Integrations
            .Include(i => i.Items.Where(item => item.IsActive).OrderBy(item => item.SortOrder))
            .Where(i => i.IsActive)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Integration> AddAsync(Integration entity, CancellationToken cancellationToken = default)
    {
        await _context.Integrations.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Integration entity, CancellationToken cancellationToken = default)
    {
        _context.Integrations.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Integrations.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class IntegrationItemRepository : IIntegrationItemRepository
{
    private readonly CMSDbContext _context;

    public IntegrationItemRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<IntegrationItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.IntegrationItems.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<IntegrationItem>> GetByIntegrationIdAsync(Guid integrationId, CancellationToken cancellationToken = default)
    {
        return await _context.IntegrationItems
            .Where(i => i.IntegrationId == integrationId)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IntegrationItem> AddAsync(IntegrationItem entity, CancellationToken cancellationToken = default)
    {
        await _context.IntegrationItems.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(IntegrationItem entity, CancellationToken cancellationToken = default)
    {
        _context.IntegrationItems.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.IntegrationItems.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class StatRepository : IStatRepository
{
    private readonly CMSDbContext _context;

    public StatRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Stat?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Stats.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Stat>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Stats
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Stat>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Stats
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Stat>> GetBySectionAsync(string section, CancellationToken cancellationToken = default)
    {
        return await _context.Stats
            .Where(s => s.IsActive && s.Section == section)
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Stat> AddAsync(Stat entity, CancellationToken cancellationToken = default)
    {
        await _context.Stats.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Stat entity, CancellationToken cancellationToken = default)
    {
        _context.Stats.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Stats.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class PartnerRepository : IPartnerRepository
{
    private readonly CMSDbContext _context;

    public PartnerRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Partner?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Partners.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Partner>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Partners
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Partner>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Partners
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Partner>> GetFeaturedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Partners
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Partner> AddAsync(Partner entity, CancellationToken cancellationToken = default)
    {
        await _context.Partners.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Partner entity, CancellationToken cancellationToken = default)
    {
        _context.Partners.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Partners.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class AchievementRepository : IAchievementRepository
{
    private readonly CMSDbContext _context;

    public AchievementRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<Achievement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Achievements.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Achievement>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Achievements
            .OrderBy(a => a.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Achievement>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Achievements
            .Where(a => a.IsActive)
            .OrderBy(a => a.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Achievement> AddAsync(Achievement entity, CancellationToken cancellationToken = default)
    {
        await _context.Achievements.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Achievement entity, CancellationToken cancellationToken = default)
    {
        _context.Achievements.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.Achievements.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
