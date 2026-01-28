using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
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
            })
            .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

        // Register CMSUnitOfWork following Pattern A (direct implementation)
        services.AddScoped<CMSUnitOfWork>();
        services.AddScoped<ICMSUnitOfWork>(sp => sp.GetRequiredService<CMSUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<CMSUnitOfWork>());

        // IMPORTANT: Repository registrations now delegate to ICMSUnitOfWork
        // to ensure the same DbContext instance is used for both repository operations
        // and SaveChanges(). This fixes the bug where entities were added to one DbContext
        // but SaveChanges() was called on a different DbContext instance.
        //
        // Handlers can use either:
        //   - ICMSUnitOfWork.Pages (recommended for new code)
        //   - ICMSPageRepository (legacy, still supported - now correctly shares DbContext)

        // Core Repositories
        services.AddScoped<ICMSPageRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Pages);
        services.AddScoped<IBlogRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Blog);
        services.AddScoped<IFAQRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().FAQ);
        services.AddScoped<ICMSSettingRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Settings);

        // Landing Page Repositories
        services.AddScoped<ITestimonialRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Testimonials);
        services.AddScoped<IPricingPlanRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().PricingPlans);
        services.AddScoped<IPricingFeatureRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().PricingFeatures);
        services.AddScoped<IFeatureRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Features);
        services.AddScoped<IIndustryRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Industries);
        services.AddScoped<IIntegrationRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Integrations);
        services.AddScoped<IIntegrationItemRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().IntegrationItems);
        services.AddScoped<IStatRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Stats);
        services.AddScoped<IPartnerRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Partners);
        services.AddScoped<IAchievementRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().Achievements);

        // Company Page Repositories
        services.AddScoped<ITeamMemberRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().TeamMembers);
        services.AddScoped<ICompanyValueRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().CompanyValues);
        services.AddScoped<IContactInfoRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().ContactInfo);
        services.AddScoped<ISocialLinkRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().SocialLinks);

        // Documentation Repositories
        services.AddScoped<IDocCategoryRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().DocCategories);
        services.AddScoped<IDocArticleRepository>(sp => sp.GetRequiredService<ICMSUnitOfWork>().DocArticles);

        return services;
    }
}
