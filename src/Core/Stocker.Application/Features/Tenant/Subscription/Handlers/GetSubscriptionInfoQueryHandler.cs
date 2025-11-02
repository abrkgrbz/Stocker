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

        if (subscription == null)
        {
            throw new InvalidOperationException("Aktif bir abonelik bulunamadı.");
        }

        // Get current user count from tenant database
        var currentUserCount = await _userRepository.GetTenantUserCountAsync(request.TenantId, cancellationToken);
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
