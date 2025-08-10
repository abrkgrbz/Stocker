using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Web;
using Stocker.Web.Portal.Services;
using Blazored.LocalStorage;

var builder = WebApplication.CreateBuilder(args);

// Kestrel'i tüm network interface'lerde dinleyecek şekilde yapılandır
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5232); // HTTP
});

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// Add Authentication & Authorization
builder.Services.AddAuthorizationCore();
builder.Services.AddBlazoredLocalStorage(config =>
{
    config.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Add HttpClient for API calls with SSL bypass for development
builder.Services.AddHttpClient<IApiService, ApiService>(client =>
{
    var configuration = builder.Configuration;
    var apiBaseUrl = configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7021";
    client.BaseAddress = new Uri(apiBaseUrl);
})
.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
});

// Add separate HttpClient for AuthService with SSL bypass
builder.Services.AddScoped(sp => 
{
    var handler = new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
    };
    return new HttpClient(handler);
});
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<CustomAuthStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(provider => provider.GetRequiredService<CustomAuthStateProvider>());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.MapBlazorHub();
app.MapRazorPages(); 
app.MapFallbackToPage("/_Host");

app.Run();
