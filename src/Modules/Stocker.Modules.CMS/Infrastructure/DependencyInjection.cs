using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.Modules.CMS.Infrastructure.Repositories;

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

        // Repositories
        services.AddScoped<ICMSPageRepository, CMSPageRepository>();
        services.AddScoped<IBlogRepository, BlogRepository>();
        services.AddScoped<IFAQRepository, FAQRepository>();
        services.AddScoped<ICMSSettingRepository, CMSSettingRepository>();

        return services;
    }
}
