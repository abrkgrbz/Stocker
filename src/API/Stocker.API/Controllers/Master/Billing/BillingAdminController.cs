using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Admin controller for managing and monitoring all tenant subscriptions.
/// Provides overview of billing across all tenants for platform administrators.
/// </summary>
[SwaggerTag("Master Admin Panel - Billing Administration")]
public class BillingAdminController : MasterControllerBase
{
    private readonly ILemonSqueezyService _lemonSqueezyService;
    private readonly IMasterDbContext _masterContext;

    public BillingAdminController(
        IMediator mediator,
        ILemonSqueezyService lemonSqueezyService,
        IMasterDbContext masterContext,
        ILogger<BillingAdminController> logger)
        : base(mediator, logger)
    {
        _lemonSqueezyService = lemonSqueezyService;
        _masterContext = masterContext;
    }

    #region Subscription Overview

    /// <summary>
    /// Gets all tenant subscriptions with filtering and pagination.
    /// </summary>
    [HttpGet("subscriptions")]
    [SwaggerOperation(Summary = "Tüm abonelikler", Description = "Filtreleme ve sayfalama ile tüm tenant aboneliklerini getirir")]
    [ProducesResponseType(typeof(ApiResponse<SubscriptionsListResponseDto>), 200)]
    public async Task<IActionResult> GetAllSubscriptions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = "createdAt",
        [FromQuery] bool sortDesc = true,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Abonelikler getiriliyor. Sayfa: {Page}, Boyut: {PageSize}, Durum: {Status}",
                page, pageSize, status ?? "tümü");

            var query = _masterContext.LemonSqueezySubscriptions
                .Include(s => s.Tenant)
                .AsQueryable();

            // Filter by status
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<LemonSqueezyStatus>(status, true, out var statusEnum))
            {
                query = query.Where(s => s.Status == statusEnum);
            }

            // Search by tenant name or email
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s =>
                    s.Tenant.Name.Contains(search) ||
                    s.CustomerEmail.Contains(search));
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply sorting
            query = sortBy?.ToLower() switch
            {
                "tenantname" => sortDesc ? query.OrderByDescending(s => s.Tenant.Name) : query.OrderBy(s => s.Tenant.Name),
                "status" => sortDesc ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
                "unitprice" => sortDesc ? query.OrderByDescending(s => s.UnitPrice) : query.OrderBy(s => s.UnitPrice),
                "renewsat" => sortDesc ? query.OrderByDescending(s => s.RenewsAt) : query.OrderBy(s => s.RenewsAt),
                _ => sortDesc ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt)
            };

            // Apply pagination
            var subscriptions = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new SubscriptionAdminDto
                {
                    Id = s.Id,
                    TenantId = s.TenantId,
                    TenantName = s.Tenant.Name,
                    TenantCode = s.Tenant.Code,
                    LsSubscriptionId = s.LsSubscriptionId,
                    LsCustomerId = s.LsCustomerId,
                    CustomerEmail = s.CustomerEmail,
                    Status = s.Status.ToString(),
                    ProductName = s.ProductName,
                    VariantName = s.VariantName,
                    UnitPrice = s.UnitPrice,
                    Currency = s.Currency,
                    BillingInterval = s.BillingInterval,
                    CreatedAt = s.CreatedAt,
                    RenewsAt = s.RenewsAt,
                    EndsAt = s.EndsAt,
                    TrialEndsAt = s.TrialEndsAt,
                    IsCancelled = s.IsCancelled,
                    IsPaused = s.IsPaused,
                    IsActive = s.IsActive
                })
                .ToListAsync(cancellationToken);

            return Ok(new ApiResponse<SubscriptionsListResponseDto>
            {
                Success = true,
                Data = new SubscriptionsListResponseDto
                {
                    Success = true,
                    Subscriptions = subscriptions,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                },
                Message = "Abonelikler başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Abonelikler getirilirken hata oluştu");
            return StatusCode(500, new ApiResponse<SubscriptionsListResponseDto>
            {
                Success = false,
                Message = "Abonelikler getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Gets subscription details for a specific tenant.
    /// </summary>
    [HttpGet("subscriptions/{tenantId:guid}")]
    [SwaggerOperation(Summary = "Tenant abonelik detayı", Description = "Belirli bir tenant için abonelik detaylarını getirir")]
    [ProducesResponseType(typeof(ApiResponse<SubscriptionDetailResponseDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSubscriptionByTenant(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Tenant abonelik detayı getiriliyor. TenantId: {TenantId}", tenantId);

            var subscription = await _masterContext.LemonSqueezySubscriptions
                .Include(s => s.Tenant)
                .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

            if (subscription == null)
            {
                _logger.LogWarning("Tenant için abonelik bulunamadı. TenantId: {TenantId}", tenantId);
                return NotFound(new ApiResponse<SubscriptionDetailResponseDto>
                {
                    Success = false,
                    Message = "Bu tenant için abonelik bulunamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            // Try to get fresh data from Lemon Squeezy
            LsSubscriptionInfo? lsInfo = null;
            try
            {
                var result = await _lemonSqueezyService.GetSubscriptionAsync(
                    subscription.LsSubscriptionId, cancellationToken);
                if (result.IsSuccess)
                {
                    lsInfo = result.Value;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Lemon Squeezy'den abonelik bilgisi alınamadı");
            }

            return Ok(new ApiResponse<SubscriptionDetailResponseDto>
            {
                Success = true,
                Data = new SubscriptionDetailResponseDto
                {
                    Success = true,
                    Subscription = new SubscriptionAdminDetailDto
                    {
                        Id = subscription.Id,
                        TenantId = subscription.TenantId,
                        TenantName = subscription.Tenant.Name,
                        TenantCode = subscription.Tenant.Code,
                        TenantEmail = subscription.Tenant.ContactEmail.Value,
                        LsSubscriptionId = subscription.LsSubscriptionId,
                        LsCustomerId = subscription.LsCustomerId,
                        CustomerEmail = subscription.CustomerEmail,
                        Status = subscription.Status.ToString(),
                        StatusFormatted = lsInfo?.StatusFormatted ?? subscription.Status.ToString(),
                        ProductName = lsInfo?.ProductName ?? subscription.ProductName,
                        VariantName = lsInfo?.VariantName ?? subscription.VariantName,
                        UnitPrice = subscription.UnitPrice,
                        Currency = subscription.Currency,
                        BillingInterval = subscription.BillingInterval,
                        CreatedAt = subscription.CreatedAt,
                        UpdatedAt = subscription.UpdatedAt,
                        RenewsAt = subscription.RenewsAt,
                        EndsAt = subscription.EndsAt,
                        TrialEndsAt = subscription.TrialEndsAt,
                        IsCancelled = subscription.IsCancelled,
                        IsPaused = subscription.IsPaused,
                        IsActive = subscription.IsActive,
                        CardBrand = lsInfo?.CardBrand ?? subscription.CardBrand,
                        CardLastFour = lsInfo?.CardLastFour ?? subscription.CardLastFour,
                        CustomerPortalUrl = subscription.CustomerPortalUrl,
                        UpdatePaymentMethodUrl = subscription.UpdatePaymentMethodUrl
                    }
                },
                Message = "Abonelik detayları başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Abonelik detayı getirilirken hata oluştu. TenantId: {TenantId}", tenantId);
            return StatusCode(500, new ApiResponse<SubscriptionDetailResponseDto>
            {
                Success = false,
                Message = "Abonelik detayı getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Gets billing statistics and summary.
    /// </summary>
    [HttpGet("statistics")]
    [SwaggerOperation(Summary = "Faturalama istatistikleri", Description = "Tüm aboneliklerin özet istatistiklerini getirir")]
    [ProducesResponseType(typeof(ApiResponse<BillingStatisticsResponseDto>), 200)]
    public async Task<IActionResult> GetBillingStatistics(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Faturalama istatistikleri getiriliyor");

            var subscriptions = await _masterContext.LemonSqueezySubscriptions
                .ToListAsync(cancellationToken);

            var activeSubscriptions = subscriptions.Where(s => s.IsActive).ToList();
            var trialSubscriptions = subscriptions.Where(s => s.TrialEndsAt.HasValue && s.TrialEndsAt > DateTime.UtcNow).ToList();
            var cancelledSubscriptions = subscriptions.Where(s => s.IsCancelled).ToList();
            var pausedSubscriptions = subscriptions.Where(s => s.IsPaused).ToList();

            // Calculate MRR (Monthly Recurring Revenue)
            var mrr = activeSubscriptions
                .Where(s => !s.IsCancelled && !s.IsPaused)
                .Sum(s => s.BillingInterval?.ToLower() switch
                {
                    "year" or "yearly" => s.UnitPrice / 12,
                    _ => s.UnitPrice
                });

            // Calculate ARR (Annual Recurring Revenue)
            var arr = mrr * 12;

            // Subscriptions expiring soon (within 7 days)
            var expiringSoon = subscriptions
                .Where(s => s.RenewsAt.HasValue &&
                           s.RenewsAt.Value <= DateTime.UtcNow.AddDays(7) &&
                           s.RenewsAt.Value > DateTime.UtcNow)
                .Count();

            // Group by status
            var statusBreakdown = subscriptions
                .GroupBy(s => s.Status)
                .ToDictionary(g => g.Key.ToString(), g => g.Count());

            // Group by plan
            var planBreakdown = subscriptions
                .Where(s => !string.IsNullOrEmpty(s.VariantName))
                .GroupBy(s => s.VariantName)
                .ToDictionary(g => g.Key!, g => g.Count());

            return Ok(new ApiResponse<BillingStatisticsResponseDto>
            {
                Success = true,
                Data = new BillingStatisticsResponseDto
                {
                    Success = true,
                    Statistics = new BillingStatisticsDto
                    {
                        TotalSubscriptions = subscriptions.Count,
                        ActiveSubscriptions = activeSubscriptions.Count,
                        TrialSubscriptions = trialSubscriptions.Count,
                        CancelledSubscriptions = cancelledSubscriptions.Count,
                        PausedSubscriptions = pausedSubscriptions.Count,
                        ExpiringSoon = expiringSoon,
                        MRR = mrr,
                        ARR = arr,
                        Currency = "USD",
                        StatusBreakdown = statusBreakdown,
                        PlanBreakdown = planBreakdown
                    }
                },
                Message = "İstatistikler başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Faturalama istatistikleri getirilirken hata oluştu");
            return StatusCode(500, new ApiResponse<BillingStatisticsResponseDto>
            {
                Success = false,
                Message = "İstatistikler getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    #endregion

    #region Payment History

    /// <summary>
    /// Gets payment history for a specific tenant.
    /// </summary>
    [HttpGet("payments/{tenantId:guid}")]
    [SwaggerOperation(Summary = "Tenant ödeme geçmişi", Description = "Belirli bir tenant için ödeme geçmişini getirir")]
    [ProducesResponseType(typeof(ApiResponse<PaymentsListResponseDto>), 200)]
    public async Task<IActionResult> GetTenantPayments(
        Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Tenant ödeme geçmişi getiriliyor. TenantId: {TenantId}", tenantId);

            var subscription = await _masterContext.LemonSqueezySubscriptions
                .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

            if (subscription == null)
            {
                return Ok(new ApiResponse<PaymentsListResponseDto>
                {
                    Success = true,
                    Data = new PaymentsListResponseDto
                    {
                        Success = true,
                        Payments = new List<PaymentDto>(),
                        TotalCount = 0,
                        Page = page,
                        PageSize = pageSize,
                        TotalPages = 0
                    },
                    Message = "Tenant için abonelik bulunamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            // Get invoices from Lemon Squeezy
            var invoicesResult = await _lemonSqueezyService.GetSubscriptionInvoicesAsync(
                subscription.LsSubscriptionId, cancellationToken);

            if (!invoicesResult.IsSuccess)
            {
                return Ok(new ApiResponse<PaymentsListResponseDto>
                {
                    Success = true,
                    Data = new PaymentsListResponseDto
                    {
                        Success = true,
                        Payments = new List<PaymentDto>(),
                        TotalCount = 0,
                        Page = page,
                        PageSize = pageSize,
                        TotalPages = 0,
                        Message = "Fatura bilgileri alınamadı"
                    },
                    Message = "Fatura bilgileri alınamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            var allPayments = invoicesResult.Value
                .Select(i => new PaymentDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    Status = i.Status,
                    Amount = i.Total,
                    Currency = i.Currency,
                    InvoiceUrl = i.InvoiceUrl,
                    CreatedAt = i.CreatedAt,
                    PaidAt = i.PaidAt
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToList();

            var totalCount = allPayments.Count;
            var payments = allPayments
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new ApiResponse<PaymentsListResponseDto>
            {
                Success = true,
                Data = new PaymentsListResponseDto
                {
                    Success = true,
                    Payments = payments,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                },
                Message = "Ödeme geçmişi başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ödeme geçmişi getirilirken hata oluştu. TenantId: {TenantId}", tenantId);
            return StatusCode(500, new ApiResponse<PaymentsListResponseDto>
            {
                Success = false,
                Message = "Ödeme geçmişi getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Gets all recent payments across all tenants.
    /// </summary>
    [HttpGet("payments")]
    [SwaggerOperation(Summary = "Tüm ödemeler", Description = "Tüm tenant'lardaki son ödemeleri getirir")]
    [ProducesResponseType(typeof(ApiResponse<AllPaymentsListResponseDto>), 200)]
    public async Task<IActionResult> GetAllRecentPayments(
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Tüm ödemeler getiriliyor. Limit: {Limit}", limit);

            var subscriptions = await _masterContext.LemonSqueezySubscriptions
                .Include(s => s.Tenant)
                .ToListAsync(cancellationToken);

            var allPayments = new List<PaymentWithTenantDto>();

            foreach (var subscription in subscriptions.Take(20)) // Limit to avoid too many API calls
            {
                try
                {
                    var invoicesResult = await _lemonSqueezyService.GetSubscriptionInvoicesAsync(
                        subscription.LsSubscriptionId, cancellationToken);

                    if (invoicesResult.IsSuccess)
                    {
                        var payments = invoicesResult.Value
                            .Select(i => new PaymentWithTenantDto
                            {
                                Id = i.Id,
                                TenantId = subscription.TenantId,
                                TenantName = subscription.Tenant.Name,
                                InvoiceNumber = i.InvoiceNumber,
                                Status = i.Status,
                                Amount = i.Total,
                                Currency = i.Currency,
                                InvoiceUrl = i.InvoiceUrl,
                                CreatedAt = i.CreatedAt,
                                PaidAt = i.PaidAt
                            });

                        allPayments.AddRange(payments);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Abonelik için faturalar alınamadı. SubscriptionId: {SubscriptionId}",
                        subscription.LsSubscriptionId);
                }
            }

            var recentPayments = allPayments
                .OrderByDescending(p => p.CreatedAt)
                .Take(limit)
                .ToList();

            return Ok(new ApiResponse<AllPaymentsListResponseDto>
            {
                Success = true,
                Data = new AllPaymentsListResponseDto
                {
                    Success = true,
                    Payments = recentPayments,
                    TotalCount = recentPayments.Count
                },
                Message = "Ödemeler başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ödemeler getirilirken hata oluştu");
            return StatusCode(500, new ApiResponse<AllPaymentsListResponseDto>
            {
                Success = false,
                Message = "Ödemeler getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    #endregion

    #region Subscription Actions

    /// <summary>
    /// Manually sync subscription data from Lemon Squeezy.
    /// </summary>
    [HttpPost("subscriptions/{tenantId:guid}/sync")]
    [SwaggerOperation(Summary = "Abonelik senkronize et", Description = "Lemon Squeezy'den abonelik verilerini manuel olarak senkronize eder")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SyncSubscription(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Abonelik senkronize ediliyor. TenantId: {TenantId}", tenantId);

            var subscription = await _masterContext.LemonSqueezySubscriptions
                .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

            if (subscription == null)
            {
                _logger.LogWarning("Abonelik bulunamadı. TenantId: {TenantId}", tenantId);
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Abonelik bulunamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            var result = await _lemonSqueezyService.GetSubscriptionAsync(
                subscription.LsSubscriptionId, cancellationToken);

            if (!result.IsSuccess)
            {
                _logger.LogWarning("Lemon Squeezy'den veri alınamadı. TenantId: {TenantId}", tenantId);
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Lemon Squeezy'den veri alınamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            var info = result.Value;

            // Update local subscription data
            subscription.UpdateFromWebhook(
                Enum.TryParse<LemonSqueezyStatus>(info.Status, true, out var status)
                    ? status
                    : subscription.Status,
                info.RenewsAt,
                info.EndsAt,
                info.TrialEndsAt);

            subscription.UpdatePaymentInfo(info.CardBrand, info.CardLastFour);
            subscription.UpdatePortalUrls(info.Urls.CustomerPortal, info.Urls.UpdatePaymentMethod);

            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Abonelik başarıyla senkronize edildi. TenantId: {TenantId}", tenantId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Abonelik verileri senkronize edildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Abonelik senkronize edilirken hata oluştu. TenantId: {TenantId}", tenantId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Senkronizasyon sırasında hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    #endregion
}

#region Admin DTOs

public class SubscriptionsListResponseDto
{
    public bool Success { get; set; }
    public List<SubscriptionAdminDto> Subscriptions { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class SubscriptionAdminDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantCode { get; set; } = string.Empty;
    public string LsSubscriptionId { get; set; } = string.Empty;
    public string LsCustomerId { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ProductName { get; set; }
    public string? VariantName { get; set; }
    public int UnitPrice { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? BillingInterval { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RenewsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public DateTime? TrialEndsAt { get; set; }
    public bool IsCancelled { get; set; }
    public bool IsPaused { get; set; }
    public bool IsActive { get; set; }
}

public class SubscriptionDetailResponseDto
{
    public bool Success { get; set; }
    public SubscriptionAdminDetailDto? Subscription { get; set; }
}

public class SubscriptionAdminDetailDto : SubscriptionAdminDto
{
    public string TenantEmail { get; set; } = string.Empty;
    public string? StatusFormatted { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CardBrand { get; set; }
    public string? CardLastFour { get; set; }
    public string? CustomerPortalUrl { get; set; }
    public string? UpdatePaymentMethodUrl { get; set; }
}

public class BillingStatisticsResponseDto
{
    public bool Success { get; set; }
    public BillingStatisticsDto? Statistics { get; set; }
}

public class BillingStatisticsDto
{
    public int TotalSubscriptions { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int TrialSubscriptions { get; set; }
    public int CancelledSubscriptions { get; set; }
    public int PausedSubscriptions { get; set; }
    public int ExpiringSoon { get; set; }
    public int MRR { get; set; } // Monthly Recurring Revenue
    public int ARR { get; set; } // Annual Recurring Revenue
    public string Currency { get; set; } = "USD";
    public Dictionary<string, int> StatusBreakdown { get; set; } = new();
    public Dictionary<string, int> PlanBreakdown { get; set; } = new();
}

public class PaymentsListResponseDto
{
    public bool Success { get; set; }
    public List<PaymentDto> Payments { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public string? Message { get; set; }
}

public class PaymentDto
{
    public string Id { get; set; } = string.Empty;
    public string? InvoiceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? InvoiceUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class AllPaymentsListResponseDto
{
    public bool Success { get; set; }
    public List<PaymentWithTenantDto> Payments { get; set; } = new();
    public int TotalCount { get; set; }
}

public class PaymentWithTenantDto : PaymentDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
}

#endregion
