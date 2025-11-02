using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Features.Tenant.Subscription.Queries;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Tenant.Subscription.Handlers;

public class GetSubscriptionInfoQueryHandler : IRequestHandler<GetSubscriptionInfoQuery, TenantSubscriptionInfoDto>
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly IUserRepository _userRepository;

    public GetSubscriptionInfoQueryHandler(
        IMasterDbContext masterDbContext,
        IUserRepository userRepository)
    {
        _masterDbContext = masterDbContext;
        _userRepository = userRepository;
    }

    public async Task<TenantSubscriptionInfoDto> Handle(GetSubscriptionInfoQuery request, CancellationToken cancellationToken)
    {
        // Get active subscription with package details
        var subscription = await _masterDbContext.Subscriptions
            .Include(s => s.Package)
            .ThenInclude(p => p.Limits)
            .Where(s => s.TenantId == request.TenantId && s.Status == SubscriptionStatus.Aktif)
            .FirstOrDefaultAsync(cancellationToken);

        // Get current user count from tenant database
        var currentUserCount = await _userRepository.GetTenantUserCountAsync(request.TenantId, cancellationToken);

        // If no subscription exists, return default unlimited subscription info (for testing)
        if (subscription == null)
        {
            return new TenantSubscriptionInfoDto
            {
                SubscriptionId = Guid.Empty,
                PackageName = "Test Mode (No Subscription)",
                PackageType = "Unlimited",
                CurrentUserCount = currentUserCount,
                MaxUsers = 999999, // Unlimited for testing
                CanAddUser = true,
                MaxStorage = 999999,
                MaxProjects = 999999,
                Status = "Active",
                CurrentPeriodEnd = DateTime.UtcNow.AddYears(100),
                IsTrialActive = false,
                TrialEndDate = null
            };
        }

        var maxUsers = subscription.Package.Limits.MaxUsers;

        return new TenantSubscriptionInfoDto
        {
            SubscriptionId = subscription.Id,
            PackageName = subscription.Package.Name,
            PackageType = subscription.Package.Type.ToString(),
            CurrentUserCount = currentUserCount,
            MaxUsers = maxUsers,
            CanAddUser = currentUserCount < maxUsers,
            MaxStorage = subscription.Package.Limits.MaxStorage,
            MaxProjects = subscription.Package.Limits.MaxProjects,
            Status = subscription.Status.ToString(),
            CurrentPeriodEnd = subscription.CurrentPeriodEnd,
            IsTrialActive = subscription.Status == SubscriptionStatus.Deneme,
            TrialEndDate = subscription.TrialEndDate
        };
    }
}
