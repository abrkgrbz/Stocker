using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;

namespace Stocker.API.Configuration;

public static class ApiVersioningConfiguration
{
    public static IServiceCollection AddApiVersioningConfiguration(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            // Varsayılan API versiyonu
            options.DefaultApiVersion = new ApiVersion(1, 0);
            
            // Client versiyon belirtmezse varsayılanı kullan
            options.AssumeDefaultVersionWhenUnspecified = true;
            
            // API versiyonunu response header'da göster
            options.ReportApiVersions = true;
            
            // Versiyonlama stratejisi (URL path, query string, header, media type)
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new QueryStringApiVersionReader("api-version"),
                new HeaderApiVersionReader("X-API-Version"),
                new MediaTypeApiVersionReader("version")
            );
        });

        services.AddVersionedApiExplorer(options =>
        {
            // Version format: 'v'major[.minor][-status]
            options.GroupNameFormat = "'v'VVV";
            
            // URL'de version parametresini değiştir
            options.SubstituteApiVersionInUrl = true;
        });

        // Swagger için versiyonlama desteği
        services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        
        return services;
    }
}

public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider;

    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
    {
        _provider = provider;
    }

    public void Configure(SwaggerGenOptions options)
    {
        foreach (var description in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(description.GroupName, CreateInfoForApiVersion(description));
        }
    }

    private static OpenApiInfo CreateInfoForApiVersion(ApiVersionDescription description)
    {
        var text = new StringBuilder("Stocker API ");
        var info = new OpenApiInfo
        {
            Title = "Stocker API",
            Version = description.ApiVersion.ToString(),
            Description = "Enterprise Resource Planning (ERP) System API",
            Contact = new OpenApiContact
            {
                Name = "Stocker Team",
                Email = "support@stoocker.app",
                Url = new Uri("https://stoocker.app")
            },
            License = new OpenApiLicense
            {
                Name = "Use under license",
                Url = new Uri("https://stoocker.app/license")
            }
        };

        if (description.IsDeprecated)
        {
            text.Append(" This API version has been deprecated.");
            info.Description += " **This API version has been deprecated.**";
        }

        return info;
    }
}