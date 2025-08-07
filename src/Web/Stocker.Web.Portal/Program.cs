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

// Add HttpClient for API calls
builder.Services.AddHttpClient<IApiService, ApiService>(client =>
{
    var configuration = builder.Configuration;
    var apiBaseUrl = configuration["ApiSettings:BaseUrl"] ?? "http://localhost:5104";
    client.BaseAddress = new Uri(apiBaseUrl);
});

// Add separate HttpClient for AuthService
builder.Services.AddScoped(sp => new HttpClient());
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
app.MapFallbackToPage("/_Host");

app.Run();
