using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;

namespace Stocker.Identity.Services;

/// <summary>
/// Service responsible for user management operations
/// </summary>
public class UserManagementService : IUserManagementService
{
    private readonly MasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<UserManagementService> _logger;

    public UserManagementService(
        MasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory,
        IPasswordService passwordService,
        ILogger<UserManagementService> logger)
    {
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
        _passwordService = passwordService;
        _logger = logger;
    }

    public async Task<MasterUser?> FindMasterUserAsync(string usernameOrEmail)
    {
        return await _masterContext.MasterUsers
            .Include(u => u.UserTenants) 
            .Include(u => u.RefreshTokens)
            .Include(x=>x.LoginHistory)
            .FirstOrDefaultAsync(u => u.Username == usernameOrEmail || u.Email.Value == usernameOrEmail);
    }

    public async Task<TenantUser?> FindTenantUserAsync(Guid tenantId, string username)
    {
        await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
        return await tenantContext.TenantUsers
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Username == username && u.TenantId == tenantId);
    }

    public async Task<MasterUser> CreateMasterUserAsync(
        string username,
        string email,
        string password,
        string firstName,
        string lastName,
        string? phoneNumber = null,
        UserType userType = UserType.TenantOwner)
    {
        // Check if user already exists
        var existingUser = await _masterContext.MasterUsers
            .AnyAsync(u => u.Username == username || u.Email.Value == email);

        if (existingUser)
        {
            throw new InvalidOperationException("Username or email already exists");
        }

        // Create value objects
        var emailResult = Email.Create(email);
        if (!emailResult.IsSuccess)
        {
            throw new ArgumentException(emailResult.Error.Description);
        }

        PhoneNumber? phoneNumberValue = null;
        if (!string.IsNullOrWhiteSpace(phoneNumber))
        {
            var phoneResult = PhoneNumber.Create(phoneNumber);
            if (!phoneResult.IsSuccess)
            {
                throw new ArgumentException(phoneResult.Error.Description);
            }
            phoneNumberValue = phoneResult.Value;
        }

        // Create master user with plain password (it will hash internally)
        var masterUser = MasterUser.Create(
            username: username,
            email: emailResult.Value,
            plainPassword: password,
            firstName: firstName,
            lastName: lastName,
            userType: userType,
            phoneNumber: phoneNumberValue
        );

        _masterContext.MasterUsers.Add(masterUser);
        await _masterContext.SaveChangesAsync();

        _logger.LogInformation("Created new master user {Username} with type {UserType}", username, userType);

        return masterUser;
    }

    public async Task EnsureTenantUserExistsAsync(MasterUser masterUser, Guid tenantId)
    {
        try
        {
            await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
            
            // Check if user already exists in this tenant
            var existingTenantUser = await tenantContext.TenantUsers
                .FirstOrDefaultAsync(u => u.MasterUserId == masterUser.Id && u.TenantId == tenantId);

            if (existingTenantUser != null)
            {
                return;
            }

            // Verify tenant exists
            var tenant = await _masterContext.Tenants.FindAsync(tenantId);
            if (tenant == null)
            {
                _logger.LogWarning("Tenant {TenantId} not found", tenantId);
                return;
            }

            // Create tenant user
            var tenantUser = TenantUser.Create(
                tenantId: tenantId,
                masterUserId: masterUser.Id,
                username: masterUser.Username,
                email: masterUser.Email,
                firstName: masterUser.FirstName,
                lastName: masterUser.LastName,
                phone: masterUser.PhoneNumber
            );

            // Assign default role if applicable
            if (masterUser.Username.Equals("tenantadmin", StringComparison.OrdinalIgnoreCase))
            {
                var adminRole = await tenantContext.Roles
                    .FirstOrDefaultAsync(r => r.Name == "Administrator" && r.TenantId == tenantId);

                if (adminRole != null)
                {
                    tenantUser.AssignRole(adminRole.Id);
                }
            }

            tenantContext.TenantUsers.Add(tenantUser);
            await tenantContext.SaveChangesAsync();

            // Add tenant relationship to master user
            if (!masterUser.UserTenants.Any(ut => ut.TenantId == tenantId))
            {
                masterUser.AddTenant(tenantId, true);
                await _masterContext.SaveChangesAsync();
            }

            _logger.LogInformation(
                "Created TenantUser for MasterUser {Username} in tenant {TenantId}", 
                masterUser.Username, 
                tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to ensure TenantUser exists for MasterUser {UserId} in tenant {TenantId}", 
                masterUser.Id, 
                tenantId);
            throw;
        }
    }

    public async Task UpdateLastLoginAsync(MasterUser user)
    {
        user.RecordSuccessfulLogin();   
        //_masterContext.MasterUsers.Update(user);
        await _masterContext.SaveChangesAsync();
    }

    public async Task UpdateLastLoginAsync(TenantUser user)
    {
        user.RecordLogin();
        await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(user.TenantId);
        tenantContext.TenantUsers.Update(user);
        await tenantContext.SaveChangesAsync();
    }
}

public interface IUserManagementService
{
    Task<MasterUser?> FindMasterUserAsync(string usernameOrEmail);
    Task<TenantUser?> FindTenantUserAsync(Guid tenantId, string username);
    Task<MasterUser> CreateMasterUserAsync(
        string username,
        string email,
        string password,
        string firstName,
        string lastName,
        string? phoneNumber = null,
        UserType userType = UserType.TenantOwner);
    Task EnsureTenantUserExistsAsync(MasterUser masterUser, Guid tenantId);
    Task UpdateLastLoginAsync(MasterUser user);
    Task UpdateLastLoginAsync(TenantUser user);
}