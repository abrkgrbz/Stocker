using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Repositories;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Implements resource-level authorization for Sales module.
/// Ensures users can only access resources they are authorized to view/modify
/// based on territory assignments and ownership.
/// </summary>
public class ResourceAuthorizationService : IResourceAuthorizationService
{
    private readonly ICurrentUserService _currentUser;
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<ResourceAuthorizationService> _logger;

    private static readonly HashSet<string> ManagerRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "FirmaYoneticisi",
        "SistemYoneticisi",
        "SatisYoneticisi",
        "SalesManager"
    };

    public ResourceAuthorizationService(
        ICurrentUserService currentUser,
        ISalesUnitOfWork unitOfWork,
        ILogger<ResourceAuthorizationService> logger)
    {
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public bool IsManager()
    {
        if (_currentUser.IsSuperAdmin)
            return true;

        var role = _currentUser.Role;
        return role != null && ManagerRoles.Contains(role);
    }

    public async Task<Result<bool>> CanAccessSalesOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        if (IsManager())
            return Result<bool>.Success(true);

        var userId = _currentUser.UserId;
        if (userId == null)
            return Result<bool>.Failure(Error.Unauthorized("Auth.NoUser", "Kullanıcı kimliği bulunamadı."));

        var order = await _unitOfWork.SalesOrders.GetByIdAsync(orderId, cancellationToken);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Order.NotFound", "Sipariş bulunamadı."));

        // Check 1: User is the assigned sales person
        if (order.SalesPersonId == userId.Value)
            return Result<bool>.Success(true);

        // Check 2: Order is in user's assigned territory
        if (order.TerritoryId.HasValue)
        {
            var userTerritories = await GetUserTerritoryIdsAsync(cancellationToken);
            if (userTerritories.Contains(order.TerritoryId.Value))
                return Result<bool>.Success(true);
        }

        _logger.LogWarning(
            "User {UserId} attempted to access SalesOrder {OrderId} without authorization",
            userId, orderId);

        return Result<bool>.Success(false);
    }

    public async Task<Result<bool>> CanModifySalesOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        if (IsManager())
            return Result<bool>.Success(true);

        var userId = _currentUser.UserId;
        if (userId == null)
            return Result<bool>.Failure(Error.Unauthorized("Auth.NoUser", "Kullanıcı kimliği bulunamadı."));

        var order = await _unitOfWork.SalesOrders.GetByIdAsync(orderId, cancellationToken);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Order.NotFound", "Sipariş bulunamadı."));

        // Only the assigned sales person can modify
        if (order.SalesPersonId == userId.Value)
            return Result<bool>.Success(true);

        _logger.LogWarning(
            "User {UserId} attempted to modify SalesOrder {OrderId} without authorization",
            userId, orderId);

        return Result<bool>.Success(false);
    }

    public async Task<IReadOnlyList<Guid>> GetUserTerritoryIdsAsync(CancellationToken cancellationToken = default)
    {
        if (IsManager())
            return Array.Empty<Guid>();

        var userId = _currentUser.UserId;
        if (userId == null)
            return Array.Empty<Guid>();

        var territories = await _unitOfWork.SalesTerritories.GetBySalesRepresentativeAsync(
            userId.Value, cancellationToken);

        return territories.Select(t => t.Id).ToList();
    }
}
