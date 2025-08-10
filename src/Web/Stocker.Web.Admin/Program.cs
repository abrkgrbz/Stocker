using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Stocker.Web.Admin.Components;
using Stocker.Web.Admin.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Add storage
builder.Services.AddScoped<ProtectedLocalStorage>();

// Add HttpClient for API calls with SSL bypass for development
builder.Services.AddHttpClient<IApiService, ApiService>()
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
    });

// Add HttpClient for direct injection with SSL bypass for development
builder.Services.AddScoped(sp => 
{
    var handler = new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
    };
    return new HttpClient(handler) { BaseAddress = new Uri("https://localhost:7021") };
});

// Add application services
builder.Services.AddScoped<IAuthService, AuthService>();

// Add application services
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IPackageService, PackageService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();

// Add logging
builder.Services.AddLogging();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
