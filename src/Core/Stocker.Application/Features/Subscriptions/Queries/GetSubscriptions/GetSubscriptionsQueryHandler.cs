using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Persistence.Contexts;
using Stocker.Application.DTOs.Subscription;
using AutoMapper;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptions;

public class GetSubscriptionsQueryHandler : IRequestHandler<GetSubscriptionsQuery, Result<List<SubscriptionDto>>>
{
    private readonly MasterDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<GetSubscriptionsQueryHandler> _logger;

    public GetSubscriptionsQueryHandler(
        MasterDbContext context,
        IMapper mapper,
        ILogger<GetSubscriptionsQueryHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<SubscriptionDto>>> Handle(GetSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Subscriptions
                .Include(s => s.Tenant)
                .Include(s => s.Package)
                .Include(s => s.Modules)
                .Include(s => s.Usages)
                .AsQueryable();

            // Apply filters
            if (request.TenantId.HasValue)
            {
                query = query.Where(s => s.TenantId == request.TenantId.Value);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(s => s.Status == request.Status.Value);
            }

            if (request.AutoRenew.HasValue)
            {
                query = query.Where(s => s.AutoRenew == request.AutoRenew.Value);
            }

            var subscriptions = await query
                .OrderByDescending(s => s.StartDate)
                .ToListAsync(cancellationToken);

            var subscriptionDtos = _mapper.Map<List<SubscriptionDto>>(subscriptions);

            // Populate additional fields
            foreach (var dto in subscriptionDtos)
            {
                var subscription = subscriptions.First(s => s.Id == dto.Id);
                dto.TenantName = subscription.Tenant?.Name ?? string.Empty;
                dto.PackageName = subscription.Package?.Name ?? string.Empty;
            }

            return Result<List<SubscriptionDto>>.Success(subscriptionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscriptions");
            return Result<List<SubscriptionDto>>.Failure(Error.Failure("Subscriptions.GetFailed", "Failed to get subscriptions"));
        }
    }
}