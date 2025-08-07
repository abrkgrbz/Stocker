using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantStatistics;

public class GetTenantStatisticsQueryHandler : IRequestHandler<GetTenantStatisticsQuery, Result<TenantStatisticsDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<GetTenantStatisticsQueryHandler> _logger;

    public GetTenantStatisticsQueryHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<GetTenantStatisticsQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<TenantStatisticsDto>> Handle(GetTenantStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _unitOfWork.Tenants().GetByIdAsync(request.TenantId, cancellationToken);
        
        if (tenant == null)
        {
            return Result.Failure<TenantStatisticsDto>(
                Error.NotFound("Tenant.NotFound", $"Tenant with ID {request.TenantId} not found"));
        }

        // TODO: Implement actual statistics gathering from various repositories
        // For now, returning mock data
        var statistics = new TenantStatisticsDto
        {
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            
            // User Statistics (mock data)
            TotalUsers = 15,
            ActiveUsers = 12,
            InactiveUsers = 3,
            
            // Product Statistics (mock data)
            TotalProducts = 250,
            ActiveProducts = 230,
            
            // Stock Statistics (mock data)
            TotalStockValue = 125000.50m,
            LowStockItems = 15,
            OutOfStockItems = 5,
            
            // Activity Statistics
            LastLoginDate = DateTime.UtcNow.AddHours(-2),
            LastActivityDate = DateTime.UtcNow.AddMinutes(-30),
            
            // Subscription Information
            // TODO: Get package name from active subscription
            PackageName = "Standard", // Mock data for now
            SubscriptionStatus = tenant.IsActive ? "Active" : "Inactive",
            SubscriptionEndDate = DateTime.UtcNow.AddMonths(3), // Mock data
            
            // Storage Information (mock data)
            StorageUsedBytes = 536870912, // 512 MB
            StorageLimitBytes = 5368709120 // 5 GB
        };

        _logger.LogInformation("Retrieved statistics for tenant {TenantId}", request.TenantId);

        return Result.Success(statistics);
    }
}