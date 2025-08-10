using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Persistence.Contexts;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Application.DTOs.Subscription;
using AutoMapper;

namespace Stocker.Application.Features.Subscriptions.Commands.CreateSubscription;

public class CreateSubscriptionCommandHandler : IRequestHandler<CreateSubscriptionCommand, Result<SubscriptionDto>>
{
    private readonly MasterDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateSubscriptionCommandHandler> _logger;

    public CreateSubscriptionCommandHandler(
        MasterDbContext context,
        IMapper mapper,
        ILogger<CreateSubscriptionCommandHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<SubscriptionDto>> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate Tenant exists
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<SubscriptionDto>.Failure(Error.NotFound("Tenant.NotFound", $"Tenant with ID {request.TenantId} not found"));
            }

            // Validate Package exists and is active
            var package = await _context.Packages
                .FirstOrDefaultAsync(p => p.Id == request.PackageId && p.IsActive, cancellationToken);

            if (package == null)
            {
                return Result<SubscriptionDto>.Failure(Error.NotFound("Package.NotFound", $"Active package with ID {request.PackageId} not found"));
            }

            // Check if tenant already has an active subscription
            var existingSubscription = await _context.Subscriptions
                .AnyAsync(s => s.TenantId == request.TenantId && 
                    (s.Status == Domain.Master.Enums.SubscriptionStatus.Active || 
                     s.Status == Domain.Master.Enums.SubscriptionStatus.Trial), cancellationToken);

            if (existingSubscription)
            {
                return Result<SubscriptionDto>.Failure(Error.Conflict("Subscription.AlreadyActive", "Tenant already has an active subscription"));
            }

            // Determine price - use custom price if provided, otherwise use package price
            var price = request.CustomPrice.HasValue 
                ? Money.Create(request.CustomPrice.Value, request.Currency)
                : package.BasePrice;

            // Determine start date
            var startDate = request.StartDate ?? DateTime.UtcNow;

            // Calculate trial end date if trial days specified
            DateTime? trialEndDate = null;
            if (request.TrialDays.HasValue && request.TrialDays.Value > 0)
            {
                trialEndDate = startDate.AddDays(request.TrialDays.Value);
            }

            // Create subscription using factory method
            var subscription = Subscription.Create(
                tenantId: request.TenantId,
                packageId: request.PackageId,
                billingCycle: request.BillingCycle,
                price: price,
                startDate: startDate,
                trialEndDate: trialEndDate
            );

            // Set auto-renewal preference
            subscription.SetAutoRenew(request.AutoRenew);

            // Update user count if different from default
            if (request.UserCount > 1)
            {
                subscription.UpdateUserCount(request.UserCount);
            }

            // Add subscription modules from package
            var packageModules = await _context.PackageModules
                .Where(pm => pm.PackageId == request.PackageId && pm.IsIncluded)
                .ToListAsync(cancellationToken);

            foreach (var packageModule in packageModules)
            {
                subscription.AddModule(
                    moduleCode: packageModule.ModuleCode,
                    moduleName: packageModule.ModuleName,
                    maxEntities: packageModule.MaxEntities
                );
            }

            // Add to context and save
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync(cancellationToken);

            // Map to DTO
            var subscriptionDto = _mapper.Map<SubscriptionDto>(subscription);

            _logger.LogInformation("Subscription {SubscriptionId} created for Tenant {TenantId}", subscription.Id, request.TenantId);

            return Result<SubscriptionDto>.Success(subscriptionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription for Tenant {TenantId}", request.TenantId);
            return Result<SubscriptionDto>.Failure(Error.Failure("Subscription.CreateFailed", "Failed to create subscription"));
        }
    }
}