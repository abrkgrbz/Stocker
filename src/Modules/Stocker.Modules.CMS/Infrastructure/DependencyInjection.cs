using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.Modules.CMS.Infrastructure.Repositories;
using Stocker.Modules.CMS.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCMSInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        var connectionString = configuration.GetConnectionString("MasterConnection");

        services.AddDbContext<CMSDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", CMSDbContext.Schema);
            }));

        // Register CMSUnitOfWork following Pattern A (direct implementation)
        services.AddScoped<CMSUnitOfWork>();
        services.AddScoped<ICMSUnitOfWork>(sp => sp.GetRequiredService<CMSUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<CMSUnitOfWork>());

        // Core Repositories
        services.AddScoped<ICMSPageRepository, CMSPageRepository>();
        services.AddScoped<IBlogRepository, BlogRepository>();
        services.AddScoped<IFAQRepository, FAQRepository>();
        services.AddScoped<ICMSSettingRepository, CMSSettingRepository>();

        // Landing Page Repositories
        services.AddScoped<ITestimonialRepository, TestimonialRepository>();
        services.AddScoped<IPricingPlanRepository, PricingPlanRepository>();
        services.AddScoped<IPricingFeatureRepository, PricingFeatureRepository>();
        services.AddScoped<IFeatureRepository, FeatureRepository>();
        services.AddScoped<IIndustryRepository, IndustryRepository>();
        services.AddScoped<IIntegrationRepository, IntegrationRepository>();
        services.AddScoped<IIntegrationItemRepository, IntegrationItemRepository>();
        services.AddScoped<IStatRepository, StatRepository>();
        services.AddScoped<IPartnerRepository, PartnerRepository>();
        services.AddScoped<IAchievementRepository, AchievementRepository>();

        // Company Page Repositories
        services.AddScoped<ITeamMemberRepository, TeamMemberRepository>();
        services.AddScoped<ICompanyValueRepository, CompanyValueRepository>();
        services.AddScoped<IContactInfoRepository, ContactInfoRepository>();
        services.AddScoped<ISocialLinkRepository, SocialLinkRepository>();

        // Documentation Repositories
        services.AddScoped<IDocCategoryRepository, DocCategoryRepository>();
        services.AddScoped<IDocArticleRepository, DocArticleRepository>();

        return services;
    }
}
