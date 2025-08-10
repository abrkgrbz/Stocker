using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Persistence.Contexts;
using Stocker.Application.DTOs.Subscription;
using AutoMapper;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionById;

public class GetSubscriptionByIdQueryHandler : IRequestHandler<GetSubscriptionByIdQuery, Result<SubscriptionDto>>
{
    private readonly MasterDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<GetSubscriptionByIdQueryHandler> _logger;

    public GetSubscriptionByIdQueryHandler(
        MasterDbContext context,
        IMapper mapper,
        ILogger<GetSubscriptionByIdQueryHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<SubscriptionDto>> Handle(GetSubscriptionByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Tenant)
                .Include(s => s.Package)
                .Include(s => s.Modules)
                .Include(s => s.Usages)
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

            if (subscription == null)
            {
                return Result<SubscriptionDto>.Failure(Error.NotFound("Subscription.NotFound", $"Subscription with ID {request.Id} not found"));
            }

            var subscriptionDto = _mapper.Map<SubscriptionDto>(subscription);
            
            // Populate additional fields
            subscriptionDto.TenantName = subscription.Tenant?.Name ?? string.Empty;
            subscriptionDto.PackageName = subscription.Package?.Name ?? string.Empty;

            return Result<SubscriptionDto>.Success(subscriptionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription {SubscriptionId}", request.Id);
            return Result<SubscriptionDto>.Failure(Error.Failure("Subscription.GetFailed", "Failed to get subscription"));
        }
    }
}