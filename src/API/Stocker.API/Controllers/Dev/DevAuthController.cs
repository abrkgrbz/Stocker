using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Extensions;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Extensions;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Identity.Services;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Dev;

/// <summary>
/// Development-only controller for local testing and debugging.
/// This controller is ONLY available in Development environment.
/// </summary>
[ApiController]
[Route("api/dev")]
[ApiExplorerSettings(GroupName = "public")]
[SwaggerTag("Development - Local development helpers (Development environment only)")]
public class DevAuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DevAuthController> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly IWebHostEnvironment _environment;
    private readonly IPasswordHasher _passwordHasher;

    public DevAuthController(
        IMediator mediator,
        IConfiguration configuration,
        ILogger<DevAuthController> logger,
        IMasterDbContext masterContext,
        IWebHostEnvironment environment,
        IPasswordHasher passwordHasher)
    {
        _mediator = mediator;
        _configuration = configuration;
        _logger = logger;
        _masterContext = masterContext;
        _environment = environment;
        _passwordHasher = passwordHasher;
    }

    /// <summary>
    /// Check if development mode is enabled
    /// </summary>
    [HttpGet("status")]
    [AllowAnonymous]
    public IActionResult GetDevStatus()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        return Ok(new
        {
            environment = _environment.EnvironmentName,
            isDevelopment = true,
            skipEmailVerification = _configuration.GetValue<bool>("Development:SkipEmailVerification"),
            skipTenantSubdomainCheck = _configuration.GetValue<bool>("Development:SkipTenantSubdomainCheck"),
            autoCreateDevTenant = _configuration.GetValue<bool>("Development:AutoCreateDevTenant"),
            devTenantCode = _configuration.GetValue<string>("Development:DevTenant:Code")
        });
    }

    /// <summary>
    /// Quick login for development - bypasses email verification and tenant subdomain checks
    /// </summary>
    [HttpPost("quick-login")]
    [AllowAnonymous]
    public async Task<IActionResult> QuickLogin([FromBody] DevLoginRequest request)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        _logger.LogInformation("Dev quick login attempt for: {Email}", request.Email);

        // Try normal login first
        var loginCommand = new LoginCommand
        {
            Email = request.Email,
            Password = request.Password
        };

        var result = await _mediator.Send(loginCommand);

        if (result.IsSuccess)
        {
            Response.SetAuthCookies(result.Value.AccessToken, result.Value.RefreshToken, result.Value.ExpiresAt);
            _logger.LogInformation("Dev login successful for: {Email}", request.Email);

            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Development login successful"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description,
            hint = "Use /api/dev/seed-tenant to create a dev tenant first"
        });
    }

    /// <summary>
    /// Create or get development tenant with test user
    /// </summary>
    [HttpPost("seed-tenant")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedDevTenant()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var devTenantCode = _configuration.GetValue<string>("Development:DevTenant:Code") ?? "demo";
        var devTenantName = _configuration.GetValue<string>("Development:DevTenant:Name") ?? "Demo Sirket";
        var devEmail = _configuration.GetValue<string>("Development:DevTenant:Email") ?? "demo@localhost.com";
        var devPassword = _configuration.GetValue<string>("Development:DevTenant:Password") ?? "Demo123456";

        _logger.LogInformation("Seeding dev tenant: {TenantCode}", devTenantCode);

        try
        {
            // Check if tenant already exists
            var existingTenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Code == devTenantCode);

            if (existingTenant != null)
            {
                // Check if user exists
                var existingUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Email.Value == devEmail);

                if (existingUser != null)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Dev tenant already exists",
                        tenant = new
                        {
                            id = existingTenant.Id,
                            code = existingTenant.Code,
                            name = existingTenant.Name,
                            isActive = existingTenant.IsActive
                        },
                        user = new
                        {
                            id = existingUser.Id,
                            email = existingUser.Email.Value,
                            isEmailVerified = existingUser.IsEmailVerified
                        },
                        credentials = new
                        {
                            email = devEmail,
                            password = devPassword
                        }
                    });
                }
            }

            // Create value objects
            var emailResult = Email.Create(devEmail);
            if (emailResult.IsFailure)
            {
                return BadRequest(new { success = false, message = emailResult.Error.Description });
            }

            var connectionStringValue = _configuration.GetConnectionString("TenantConnection")
                ?? "Host=localhost;Database=stocker_demo;Username=stocker_admin;Password=LocalDev123!";
            var connectionStringResult = ConnectionString.Create(connectionStringValue);
            if (connectionStringResult.IsFailure)
            {
                return BadRequest(new { success = false, message = connectionStringResult.Error.Description });
            }

            // Create new tenant using factory method
            Domain.Master.Entities.Tenant? tenant = existingTenant;
            if (tenant == null)
            {
                tenant = Domain.Master.Entities.Tenant.Create(
                    name: devTenantName,
                    code: devTenantCode,
                    databaseName: $"stocker_{devTenantCode}",
                    connectionString: connectionStringResult.Value,
                    contactEmail: emailResult.Value,
                    isActive: true
                );

                _masterContext.Tenants.Add(tenant);
                await _masterContext.SaveChangesAsync(CancellationToken.None);
                _logger.LogInformation("Created dev tenant: {TenantCode} with ID: {TenantId}", devTenantCode, tenant.Id);
            }

            // Create user using factory method
            var user = MasterUser.Create(
                username: devEmail,
                email: emailResult.Value,
                plainPassword: devPassword,
                firstName: "Demo",
                lastName: "User",
                userType: UserType.SistemYoneticisi
            );

            // Mark email as verified and activate for dev
            user.VerifyEmail();

            _masterContext.MasterUsers.Add(user);
            await _masterContext.SaveChangesAsync(CancellationToken.None);

            _logger.LogInformation("Created dev user: {Email} for tenant: {TenantCode}", devEmail, devTenantCode);

            return Ok(new
            {
                success = true,
                message = "Dev tenant and user created successfully",
                tenant = new
                {
                    id = tenant.Id,
                    code = tenant.Code,
                    name = tenant.Name,
                    isActive = tenant.IsActive
                },
                user = new
                {
                    id = user.Id,
                    email = devEmail,
                    userType = user.UserType.ToString()
                },
                credentials = new
                {
                    email = devEmail,
                    password = devPassword
                },
                nextStep = "Use POST /api/dev/quick-login with these credentials"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed dev tenant");
            return BadRequest(new
            {
                success = false,
                message = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }

    /// <summary>
    /// Get list of all tenants (dev only)
    /// </summary>
    [HttpGet("tenants")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllTenants()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var tenants = await _masterContext.Tenants
            .Select(t => new
            {
                t.Id,
                t.Code,
                t.Name,
                t.IsActive,
                t.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            count = tenants.Count,
            data = tenants
        });
    }

    /// <summary>
    /// Get list of all users (dev only)
    /// </summary>
    [HttpGet("users")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllUsers()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var users = await _masterContext.MasterUsers
            .Select(u => new
            {
                u.Id,
                Email = u.Email.Value,
                u.FirstName,
                u.LastName,
                u.UserType,
                u.IsEmailVerified,
                u.IsActive,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            count = users.Count,
            data = users
        });
    }

    /// <summary>
    /// Assign a user to a tenant (dev only) - adds entry to TenantUserEmails
    /// </summary>
    [HttpPost("assign-user-to-tenant")]
    [AllowAnonymous]
    public async Task<IActionResult> AssignUserToTenant([FromBody] AssignUserRequest request)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        _logger.LogInformation("Assigning user {Email} to tenant {TenantCode}", request.Email, request.TenantCode);

        try
        {
            // Find tenant
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Code == request.TenantCode);

            if (tenant == null)
            {
                return NotFound(new { success = false, message = $"Tenant '{request.TenantCode}' not found" });
            }

            // Check if user exists
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == request.Email);

            if (user == null)
            {
                return NotFound(new { success = false, message = $"User '{request.Email}' not found" });
            }

            // Check if already assigned
            var existingAssignment = await _masterContext.TenantUserEmails
                .FirstOrDefaultAsync(e => e.TenantId == tenant.Id && e.Email.Value == request.Email);

            if (existingAssignment != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "User already assigned to tenant",
                    tenantId = tenant.Id,
                    tenantCode = tenant.Code,
                    email = request.Email
                });
            }

            // Create TenantUserEmail entry
            var emailResult = Email.Create(request.Email);
            if (emailResult.IsFailure)
            {
                return BadRequest(new { success = false, message = emailResult.Error.Description });
            }

            // Use user.Id as TenantUserId (for development purposes)
            var tenantUserEmail = TenantUserEmail.Create(emailResult.Value, tenant.Id, user.Id);
            _masterContext.TenantUserEmails.Add(tenantUserEmail);
            await _masterContext.SaveChangesAsync(CancellationToken.None);

            _logger.LogInformation("User {Email} assigned to tenant {TenantCode}", request.Email, request.TenantCode);

            return Ok(new
            {
                success = true,
                message = "User assigned to tenant successfully",
                tenantId = tenant.Id,
                tenantCode = tenant.Code,
                tenantName = tenant.Name,
                email = request.Email
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assign user to tenant");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Initialize tenant database (dev only) - creates database and runs migrations
    /// </summary>
    [HttpPost("init-tenant-db/{tenantCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> InitializeTenantDatabase(string tenantCode)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        _logger.LogInformation("Initializing database for tenant {TenantCode}", tenantCode);

        try
        {
            // Find tenant
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Code == tenantCode);

            if (tenant == null)
            {
                return NotFound(new { success = false, message = $"Tenant '{tenantCode}' not found" });
            }

            // Get migration service
            var migrationService = HttpContext.RequestServices.GetRequiredService<IMigrationService>();

            // Run migrations for tenant
            await migrationService.MigrateTenantDatabaseAsync(tenant.Id);

            // Seed tenant data
            await migrationService.SeedTenantDataAsync(tenant.Id);

            _logger.LogInformation("Database initialized for tenant {TenantCode}", tenantCode);

            return Ok(new
            {
                success = true,
                message = "Tenant database initialized successfully",
                tenantId = tenant.Id,
                tenantCode = tenant.Code
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database for tenant {TenantCode}", tenantCode);
            return BadRequest(new
            {
                success = false,
                message = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }

    /// <summary>
    /// Activate all modules for a tenant (dev only) - bypasses subscription checks
    /// </summary>
    [HttpPost("activate-all-modules/{tenantCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> ActivateAllModules(string tenantCode)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        _logger.LogInformation("Activating all modules for tenant {TenantCode}", tenantCode);

        try
        {
            // Find tenant
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Code == tenantCode);

            if (tenant == null)
            {
                return NotFound(new { success = false, message = $"Tenant '{tenantCode}' not found" });
            }

            // Get tenant db context factory
            var tenantDbContextFactory = HttpContext.RequestServices.GetRequiredService<ITenantDbContextFactory>();
            await using var tenantDbContext = await tenantDbContextFactory.CreateDbContextAsync(tenant.Id);

            // All available modules
            var modules = new Dictionary<string, string>
            {
                ["CRM"] = "CRM Modülü",
                ["Inventory"] = "Stok Yönetimi",
                ["Sales"] = "Satış Modülü",
                ["Purchase"] = "Satın Alma",
                ["Finance"] = "Finans Modülü",
                ["HR"] = "İnsan Kaynakları"
            };

            var activatedModules = new List<string>();

            foreach (var module in modules)
            {
                var existingModule = await tenantDbContext.TenantModules
                    .FirstOrDefaultAsync(m => m.TenantId == tenant.Id && m.ModuleCode == module.Key);

                if (existingModule != null)
                {
                    if (!existingModule.IsEnabled)
                    {
                        existingModule.Enable();
                        activatedModules.Add($"{module.Key} (re-enabled)");
                    }
                    else
                    {
                        activatedModules.Add($"{module.Key} (already active)");
                    }
                }
                else
                {
                    var newModule = Domain.Tenant.Entities.TenantModules.Create(
                        tenantId: tenant.Id,
                        moduleName: module.Value,
                        moduleCode: module.Key,
                        description: $"Dev activated - {module.Value}",
                        isEnabled: true
                    );
                    tenantDbContext.TenantModules.Add(newModule);
                    activatedModules.Add($"{module.Key} (created)");
                }
            }

            await tenantDbContext.SaveChangesAsync(CancellationToken.None);

            _logger.LogInformation("Activated modules for tenant {TenantCode}: {Modules}",
                tenantCode, string.Join(", ", activatedModules));

            return Ok(new
            {
                success = true,
                message = "All modules activated successfully",
                tenantId = tenant.Id,
                tenantCode = tenant.Code,
                activatedModules = activatedModules
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to activate modules for tenant {TenantCode}", tenantCode);
            return BadRequest(new
            {
                success = false,
                message = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }

    /// <summary>
    /// Apply module migrations for a tenant (dev only) - creates CRM, Sales, etc. tables
    /// This is normally done after Setup Wizard but for dev we need to do it manually
    /// </summary>
    [HttpPost("apply-module-migrations/{tenantCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> ApplyModuleMigrations(string tenantCode)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        _logger.LogInformation("Applying module migrations for tenant {TenantCode}", tenantCode);

        try
        {
            // Find tenant
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Code == tenantCode);

            if (tenant == null)
            {
                return NotFound(new { success = false, message = $"Tenant '{tenantCode}' not found" });
            }

            // First, ensure tenant has subscription with modules in master database
            // This is what ApplyModuleMigrationsAsync checks to decide which modules to migrate
            await EnsureDevSubscriptionAsync(tenant.Id);

            // Get migration service
            var migrationService = HttpContext.RequestServices.GetRequiredService<IMigrationService>();

            // Apply module migrations
            var appliedMigrations = await migrationService.ApplyModuleMigrationsAsync(tenant.Id);

            _logger.LogInformation("Applied module migrations for tenant {TenantCode}: {Migrations}",
                tenantCode, string.Join(", ", appliedMigrations));

            return Ok(new
            {
                success = true,
                message = "Module migrations applied successfully",
                tenantId = tenant.Id,
                tenantCode = tenant.Code,
                appliedMigrations = appliedMigrations,
                nextStep = "Now you can use CRM, Sales, and other module endpoints"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to apply module migrations for tenant {TenantCode}", tenantCode);
            return BadRequest(new
            {
                success = false,
                message = ex.Message,
                innerException = ex.InnerException?.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    /// <summary>
    /// Ensures the tenant has a development subscription with all modules enabled
    /// </summary>
    private async Task EnsureDevSubscriptionAsync(Guid tenantId)
    {
        // Check if subscription already exists
        var existingSubscription = await _masterContext.Subscriptions
            .Include(s => s.Modules)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId);

        if (existingSubscription != null && existingSubscription.Modules.Any())
        {
            _logger.LogInformation("Tenant {TenantId} already has subscription with {Count} modules",
                tenantId, existingSubscription.Modules.Count);
            return;
        }

        // Create a development subscription if none exists
        if (existingSubscription == null)
        {
            _logger.LogInformation("Creating development subscription for tenant {TenantId}", tenantId);

            // Get or create a development package
            var devPackage = await _masterContext.Packages
                .FirstOrDefaultAsync(p => p.Name == "Development - All Modules");

            if (devPackage == null)
            {
                // Create package with correct signature
                devPackage = Domain.Master.Entities.Package.Create(
                    name: "Development - All Modules",
                    type: Domain.Master.Enums.PackageType.Kurumsal,
                    basePrice: Domain.Common.ValueObjects.Money.Create(0, "TRY"),
                    limits: Domain.Master.ValueObjects.PackageLimit.Create(999, 999, 999, 999999),
                    description: "Development package with all modules enabled",
                    trialDays: 0,
                    displayOrder: 100,
                    isPublic: false
                );
                _masterContext.Packages.Add(devPackage);
                await _masterContext.SaveChangesAsync(CancellationToken.None);
            }

            // Create subscription with correct signature
            existingSubscription = Domain.Master.Entities.Subscription.Create(
                tenantId: tenantId,
                packageId: devPackage.Id,
                billingCycle: Domain.Master.Enums.BillingCycle.Yillik,
                price: Domain.Common.ValueObjects.Money.Create(0, "TRY"),
                startDate: DateTime.UtcNow,
                trialEndDate: DateTime.UtcNow.AddYears(10)
            );
            _masterContext.Subscriptions.Add(existingSubscription);
            await _masterContext.SaveChangesAsync(CancellationToken.None);
        }

        // Add all modules to the subscription using constructor
        var allModules = new[] { "CRM", "Inventory", "Sales", "Purchase", "Finance", "HR" };
        var existingModuleCodes = existingSubscription.Modules.Select(m => m.ModuleCode).ToHashSet();

        foreach (var moduleCode in allModules)
        {
            if (!existingModuleCodes.Contains(moduleCode))
            {
                // Use constructor instead of static Create method
                var subscriptionModule = new Domain.Master.Entities.SubscriptionModule(
                    subscriptionId: existingSubscription.Id,
                    moduleCode: moduleCode,
                    moduleName: GetModuleName(moduleCode),
                    maxEntities: null
                );
                _masterContext.SubscriptionModules.Add(subscriptionModule);
            }
        }

        await _masterContext.SaveChangesAsync(CancellationToken.None);
        _logger.LogInformation("Development subscription configured with all modules for tenant {TenantId}", tenantId);
    }

    private static string GetModuleName(string moduleCode) => moduleCode switch
    {
        "CRM" => "CRM Modülü",
        "Inventory" => "Stok Yönetimi",
        "Sales" => "Satış Modülü",
        "Purchase" => "Satın Alma",
        "Finance" => "Finans Modülü",
        "HR" => "İnsan Kaynakları",
        _ => moduleCode
    };

    /// <summary>
    /// Full development setup - creates tenant, user, assigns user, runs migrations, and activates modules
    /// One-stop endpoint for complete local dev setup
    /// </summary>
    [HttpPost("full-setup")]
    [AllowAnonymous]
    public async Task<IActionResult> FullDevSetup()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var steps = new List<string>();
        var errors = new List<string>();

        try
        {
            // Step 1: Seed tenant
            _logger.LogInformation("Step 1: Seeding dev tenant...");
            var seedResult = await SeedDevTenant() as ObjectResult;
            steps.Add("✅ Tenant and user created/verified");

            var devTenantCode = _configuration.GetValue<string>("Development:DevTenant:Code") ?? "demo";
            var devEmail = _configuration.GetValue<string>("Development:DevTenant:Email") ?? "demo@localhost.com";

            // Step 2: Assign user to tenant
            _logger.LogInformation("Step 2: Assigning user to tenant...");
            var assignResult = await AssignUserToTenant(new AssignUserRequest
            {
                Email = devEmail,
                TenantCode = devTenantCode
            });
            steps.Add("✅ User assigned to tenant");

            // Step 3: Initialize tenant database
            _logger.LogInformation("Step 3: Initializing tenant database...");
            var initResult = await InitializeTenantDatabase(devTenantCode);
            steps.Add("✅ Tenant database initialized");

            // Step 4: Apply module migrations
            _logger.LogInformation("Step 4: Applying module migrations...");
            var migrationsResult = await ApplyModuleMigrations(devTenantCode);
            steps.Add("✅ Module migrations applied (CRM, Sales, etc.)");

            // Step 5: Activate modules in tenant database
            _logger.LogInformation("Step 5: Activating modules...");
            var activateResult = await ActivateAllModules(devTenantCode);
            steps.Add("✅ All modules activated");

            var devPassword = _configuration.GetValue<string>("Development:DevTenant:Password") ?? "Demo123456";

            return Ok(new
            {
                success = true,
                message = "Full development setup completed!",
                steps = steps,
                credentials = new
                {
                    email = devEmail,
                    password = devPassword,
                    tenantCode = devTenantCode
                },
                nextSteps = new[]
                {
                    "1. Go to http://localhost:3000/login",
                    "2. Enter email: " + devEmail,
                    "3. Select tenant: Demo Şirket",
                    "4. Enter password: " + devPassword,
                    "5. You're in! CRM, Sales, etc. should now work"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Full dev setup failed at step: {Steps}", string.Join(" → ", steps));
            return BadRequest(new
            {
                success = false,
                completedSteps = steps,
                failedAt = steps.Count + 1,
                message = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }
}

public class AssignUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string TenantCode { get; set; } = string.Empty;
}

public class DevLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
