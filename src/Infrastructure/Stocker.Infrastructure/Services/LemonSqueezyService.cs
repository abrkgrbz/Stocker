using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Stocker.Infrastructure.Services;

public class LemonSqueezyService : ILemonSqueezyService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<LemonSqueezyService> _logger;
    private readonly HttpClient _httpClient;
    private readonly IMasterDbContext _masterContext;
    private readonly ISecretStore _secretStore;

    // Secret names for Azure Key Vault
    private const string SecretName_ApiKey = "lemonsqueezy-api-key";
    private const string SecretName_StoreId = "lemonsqueezy-store-id";
    private const string SecretName_WebhookSecret = "lemonsqueezy-webhook-secret";

    // Cached secrets (loaded lazily)
    private string? _apiKey;
    private string? _storeId;
    private string? _webhookSecret;
    private bool _secretsLoaded;
    private readonly SemaphoreSlim _secretsLock = new(1, 1);

    private const string BaseUrl = "https://api.lemonsqueezy.com/v1";

    public LemonSqueezyService(
        IConfiguration configuration,
        ILogger<LemonSqueezyService> logger,
        IHttpClientFactory httpClientFactory,
        IMasterDbContext masterContext,
        ISecretStore secretStore)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("LemonSqueezy");
        _masterContext = masterContext;
        _secretStore = secretStore;

        // Configure HttpClient base settings (Authorization header will be set per-request)
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.api+json"));
    }

    /// <summary>
    /// Ensures secrets are loaded from Azure Key Vault or fallback to configuration
    /// </summary>
    private async Task EnsureSecretsLoadedAsync(CancellationToken cancellationToken = default)
    {
        if (_secretsLoaded) return;

        await _secretsLock.WaitAsync(cancellationToken);
        try
        {
            if (_secretsLoaded) return;

            _logger.LogInformation("Loading Lemon Squeezy secrets from {Provider}", _secretStore.ProviderName);

            // Try to load from secret store first
            var apiKeySecret = await _secretStore.GetSecretAsync(SecretName_ApiKey, cancellationToken: cancellationToken);
            var storeIdSecret = await _secretStore.GetSecretAsync(SecretName_StoreId, cancellationToken: cancellationToken);
            var webhookSecret = await _secretStore.GetSecretAsync(SecretName_WebhookSecret, cancellationToken: cancellationToken);

            // Use secret store values if available, otherwise fallback to configuration
            _apiKey = apiKeySecret?.Value ?? _configuration["LemonSqueezy:ApiKey"] ?? string.Empty;
            _storeId = storeIdSecret?.Value ?? _configuration["LemonSqueezy:StoreId"] ?? string.Empty;
            _webhookSecret = webhookSecret?.Value ?? _configuration["LemonSqueezy:WebhookSecret"] ?? string.Empty;

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogWarning("Lemon Squeezy API key is not configured in {Provider} or appsettings", _secretStore.ProviderName);
            }
            else
            {
                _logger.LogInformation("Lemon Squeezy secrets loaded successfully from {Source}",
                    apiKeySecret != null ? _secretStore.ProviderName : "configuration");
            }

            _secretsLoaded = true;
        }
        finally
        {
            _secretsLock.Release();
        }
    }

    /// <summary>
    /// Creates an HTTP request with authorization header
    /// </summary>
    private async Task<HttpRequestMessage> CreateAuthorizedRequestAsync(HttpMethod method, string url, CancellationToken cancellationToken)
    {
        await EnsureSecretsLoadedAsync(cancellationToken);

        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        return request;
    }

    /// <summary>
    /// Gets the store ID after ensuring secrets are loaded
    /// </summary>
    private async Task<string> GetStoreIdAsync(CancellationToken cancellationToken)
    {
        await EnsureSecretsLoadedAsync(cancellationToken);
        return _storeId ?? string.Empty;
    }

    /// <summary>
    /// Gets the webhook secret after ensuring secrets are loaded
    /// </summary>
    private async Task<string> GetWebhookSecretAsync(CancellationToken cancellationToken)
    {
        await EnsureSecretsLoadedAsync(cancellationToken);
        return _webhookSecret ?? string.Empty;
    }

    #region Checkout

    public async Task<Result<CheckoutResponse>> CreateCheckoutAsync(CreateCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Creating checkout for tenant {TenantId}, variant {VariantId}",
                request.TenantId, request.VariantId);

            var storeId = await GetStoreIdAsync(cancellationToken);

            var checkoutData = new
            {
                data = new
                {
                    type = "checkouts",
                    attributes = new
                    {
                        checkout_data = new
                        {
                            email = request.CustomerEmail,
                            name = request.CustomerName,
                            custom = new Dictionary<string, string>
                            {
                                ["tenant_id"] = request.TenantId.ToString()
                            }
                        },
                        checkout_options = new
                        {
                            embed = false,
                            media = true,
                            logo = true,
                            desc = true,
                            discount = true,
                            button_color = "#7C3AED" // Purple theme color
                        },
                        product_options = new
                        {
                            enabled_variants = new[] { request.VariantId },
                            redirect_url = request.SuccessUrl,
                            receipt_button_text = "Stoocker'a Dön",
                            receipt_link_url = request.SuccessUrl,
                            receipt_thank_you_note = "Stoocker'a hoş geldiniz! Aboneliğiniz aktif edildi."
                        }
                    },
                    relationships = new
                    {
                        store = new
                        {
                            data = new { type = "stores", id = storeId }
                        },
                        variant = new
                        {
                            data = new { type = "variants", id = request.VariantId }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(checkoutData, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Post, $"{BaseUrl}/checkouts", cancellationToken);
            httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/vnd.api+json");
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create checkout: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure<CheckoutResponse>(
                    Error.Failure("Checkout.Failed", "Ödeme sayfası oluşturulamadı"));
            }

            var lsResponse = JsonSerializer.Deserialize<LsApiResponse<LsCheckoutData>>(responseContent);

            if (lsResponse?.Data?.Attributes == null)
            {
                return Result.Failure<CheckoutResponse>(
                    Error.Failure("Checkout.InvalidResponse", "Geçersiz API yanıtı"));
            }

            var checkoutResponse = new CheckoutResponse
            {
                CheckoutId = lsResponse.Data.Id,
                CheckoutUrl = lsResponse.Data.Attributes.Url,
                ExpiresAt = lsResponse.Data.Attributes.ExpiresAt ?? DateTime.UtcNow.AddHours(24)
            };

            _logger.LogInformation("Checkout created successfully: {CheckoutId}", checkoutResponse.CheckoutId);
            return Result.Success(checkoutResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout for tenant {TenantId}", request.TenantId);
            return Result.Failure<CheckoutResponse>(
                Error.Failure("Checkout.Error", "Ödeme sayfası oluşturulurken bir hata oluştu"));
        }
    }

    #endregion

    #region Subscription Management

    public async Task<Result<LsSubscriptionInfo>> GetSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting subscription info: {SubscriptionId}", subscriptionId);

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Get,
                $"{BaseUrl}/subscriptions/{subscriptionId}?include=product,variant", cancellationToken);
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to get subscription: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure<LsSubscriptionInfo>(
                    Error.NotFound("Subscription.NotFound", "Abonelik bulunamadı"));
            }

            var lsResponse = JsonSerializer.Deserialize<LsApiResponse<LsSubscriptionData>>(responseContent);

            if (lsResponse?.Data?.Attributes == null)
            {
                return Result.Failure<LsSubscriptionInfo>(
                    Error.Failure("Subscription.InvalidResponse", "Geçersiz API yanıtı"));
            }

            var attr = lsResponse.Data.Attributes;
            var info = new LsSubscriptionInfo
            {
                Id = lsResponse.Data.Id,
                Status = attr.Status,
                StatusFormatted = attr.StatusFormatted,
                ProductId = attr.ProductId.ToString(),
                ProductName = attr.ProductName,
                VariantId = attr.VariantId.ToString(),
                VariantName = attr.VariantName,
                CustomerId = attr.CustomerId.ToString(),
                CustomerEmail = attr.UserEmail,
                UnitPrice = attr.UnitPrice,
                Currency = attr.UnitPriceCurrency ?? "TRY",
                BillingInterval = attr.BillingAnchor.ToString(),
                BillingIntervalCount = 1,
                TrialEndsAt = attr.TrialEndsAt,
                RenewsAt = attr.RenewsAt,
                EndsAt = attr.EndsAt,
                CreatedAt = attr.CreatedAt,
                UpdatedAt = attr.UpdatedAt,
                CardBrand = attr.CardBrand,
                CardLastFour = attr.CardLastFour,
                Urls = new LsUrls
                {
                    UpdatePaymentMethod = attr.Urls?.UpdatePaymentMethod,
                    CustomerPortal = attr.Urls?.CustomerPortal
                }
            };

            return Result.Success(info);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription {SubscriptionId}", subscriptionId);
            return Result.Failure<LsSubscriptionInfo>(
                Error.Failure("Subscription.Error", "Abonelik bilgileri alınamadı"));
        }
    }

    public async Task<Result> CancelSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Cancelling subscription: {SubscriptionId}", subscriptionId);

            var request = await CreateAuthorizedRequestAsync(HttpMethod.Delete, $"{BaseUrl}/subscriptions/{subscriptionId}", cancellationToken);
            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to cancel subscription: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure(Error.Failure("Subscription.CancelFailed", "Abonelik iptal edilemedi"));
            }

            _logger.LogInformation("Subscription cancelled successfully: {SubscriptionId}", subscriptionId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling subscription {SubscriptionId}", subscriptionId);
            return Result.Failure(Error.Failure("Subscription.Error", "Abonelik iptal edilirken bir hata oluştu"));
        }
    }

    public async Task<Result> PauseSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Pausing subscription: {SubscriptionId}", subscriptionId);

            var updateData = new
            {
                data = new
                {
                    type = "subscriptions",
                    id = subscriptionId,
                    attributes = new
                    {
                        pause = new
                        {
                            mode = "void" // void = pause immediately, free = pause at end of billing period
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(updateData, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });

            var request = await CreateAuthorizedRequestAsync(HttpMethod.Patch, $"{BaseUrl}/subscriptions/{subscriptionId}", cancellationToken);
            request.Content = new StringContent(json, Encoding.UTF8, "application/vnd.api+json");

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to pause subscription: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure(Error.Failure("Subscription.PauseFailed", "Abonelik duraklatılamadı"));
            }

            _logger.LogInformation("Subscription paused successfully: {SubscriptionId}", subscriptionId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing subscription {SubscriptionId}", subscriptionId);
            return Result.Failure(Error.Failure("Subscription.Error", "Abonelik duraklatılırken bir hata oluştu"));
        }
    }

    public async Task<Result> ResumeSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Resuming subscription: {SubscriptionId}", subscriptionId);

            var updateData = new
            {
                data = new
                {
                    type = "subscriptions",
                    id = subscriptionId,
                    attributes = new
                    {
                        pause = (object?)null // Setting pause to null resumes the subscription
                    }
                }
            };

            var json = JsonSerializer.Serialize(updateData, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });

            var request = await CreateAuthorizedRequestAsync(HttpMethod.Patch, $"{BaseUrl}/subscriptions/{subscriptionId}", cancellationToken);
            request.Content = new StringContent(json, Encoding.UTF8, "application/vnd.api+json");

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to resume subscription: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure(Error.Failure("Subscription.ResumeFailed", "Abonelik devam ettirilemedi"));
            }

            _logger.LogInformation("Subscription resumed successfully: {SubscriptionId}", subscriptionId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming subscription {SubscriptionId}", subscriptionId);
            return Result.Failure(Error.Failure("Subscription.Error", "Abonelik devam ettirilirken bir hata oluştu"));
        }
    }

    public async Task<Result> UpdateSubscriptionAsync(string subscriptionId, UpdateSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Updating subscription: {SubscriptionId}", subscriptionId);

            var attributes = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(request.VariantId))
                attributes["variant_id"] = int.Parse(request.VariantId);

            if (!string.IsNullOrEmpty(request.InvoicingEmail))
                attributes["billing_anchor"] = request.InvoicingEmail;

            var updateData = new
            {
                data = new
                {
                    type = "subscriptions",
                    id = subscriptionId,
                    attributes
                }
            };

            var json = JsonSerializer.Serialize(updateData, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Patch, $"{BaseUrl}/subscriptions/{subscriptionId}", cancellationToken);
            httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/vnd.api+json");

            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to update subscription: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure(Error.Failure("Subscription.UpdateFailed", "Abonelik güncellenemedi"));
            }

            _logger.LogInformation("Subscription updated successfully: {SubscriptionId}", subscriptionId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription {SubscriptionId}", subscriptionId);
            return Result.Failure(Error.Failure("Subscription.Error", "Abonelik güncellenirken bir hata oluştu"));
        }
    }

    #endregion

    #region Customer Portal

    public async Task<Result<string>> GetCustomerPortalUrlAsync(string customerId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting customer portal URL for customer: {CustomerId}", customerId);

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"{BaseUrl}/customers/{customerId}", cancellationToken);
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to get customer: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure<string>(
                    Error.NotFound("Customer.NotFound", "Müşteri bulunamadı"));
            }

            var lsResponse = JsonSerializer.Deserialize<LsApiResponse<LsCustomerData>>(responseContent);
            var portalUrl = lsResponse?.Data?.Attributes?.Urls?.CustomerPortal;

            if (string.IsNullOrEmpty(portalUrl))
            {
                return Result.Failure<string>(
                    Error.Failure("Customer.NoPortalUrl", "Müşteri portalı URL'i bulunamadı"));
            }

            return Result.Success(portalUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer portal URL for customer {CustomerId}", customerId);
            return Result.Failure<string>(
                Error.Failure("Customer.Error", "Müşteri portalı URL'i alınamadı"));
        }
    }

    #endregion

    #region Webhooks

    public async Task<Result> ProcessWebhookAsync(string payload, string signature, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate signature first (using async version to ensure secrets are loaded)
            if (!await ValidateWebhookSignatureAsync(payload, signature, cancellationToken))
            {
                _logger.LogWarning("Invalid webhook signature");
                return Result.Failure(Error.Validation("Webhook.InvalidSignature", "Geçersiz webhook imzası"));
            }

            var webhookEvent = JsonSerializer.Deserialize<LsWebhookEvent>(payload);

            if (webhookEvent == null)
            {
                _logger.LogWarning("Failed to parse webhook payload");
                return Result.Failure(Error.Validation("Webhook.InvalidPayload", "Geçersiz webhook verisi"));
            }

            _logger.LogInformation("Processing webhook event: {EventName}, ID: {EventId}",
                webhookEvent.Meta?.EventName, webhookEvent.Meta?.EventId);

            // Process based on event type
            var eventName = webhookEvent.Meta?.EventName ?? string.Empty;

            switch (eventName)
            {
                case "subscription_created":
                    await HandleSubscriptionCreatedAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_updated":
                    await HandleSubscriptionUpdatedAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_cancelled":
                    await HandleSubscriptionCancelledAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_resumed":
                    await HandleSubscriptionResumedAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_expired":
                    await HandleSubscriptionExpiredAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_paused":
                    await HandleSubscriptionPausedAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_unpaused":
                    await HandleSubscriptionUnpausedAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_payment_success":
                    await HandlePaymentSuccessAsync(webhookEvent, cancellationToken);
                    break;

                case "subscription_payment_failed":
                    await HandlePaymentFailedAsync(webhookEvent, cancellationToken);
                    break;

                case "order_created":
                    await HandleOrderCreatedAsync(webhookEvent, cancellationToken);
                    break;

                default:
                    _logger.LogInformation("Unhandled webhook event: {EventName}", eventName);
                    break;
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return Result.Failure(Error.Failure("Webhook.Error", "Webhook işlenirken bir hata oluştu"));
        }
    }

    public async Task<bool> ValidateWebhookSignatureAsync(string payload, string signature, CancellationToken cancellationToken = default)
    {
        var webhookSecret = await GetWebhookSecretAsync(cancellationToken);

        if (string.IsNullOrEmpty(webhookSecret))
        {
            _logger.LogWarning("Webhook secret is not configured");
            return false;
        }

        try
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(webhookSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            var expectedSignature = Convert.ToHexString(hash).ToLowerInvariant();

            return signature.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating webhook signature");
            return false;
        }
    }

    public bool ValidateWebhookSignature(string payload, string signature)
    {
        // Synchronous wrapper for backward compatibility - uses cached secret
        if (!_secretsLoaded || string.IsNullOrEmpty(_webhookSecret))
        {
            _logger.LogWarning("Webhook secret is not loaded. Use ValidateWebhookSignatureAsync instead.");
            return false;
        }

        try
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            var expectedSignature = Convert.ToHexString(hash).ToLowerInvariant();

            return signature.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating webhook signature");
            return false;
        }
    }

    private async Task HandleSubscriptionCreatedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data?.Attributes == null) return;

        var attr = data.Attributes;

        // Extract tenant ID from custom data (in meta, not attributes)
        var tenantIdStr = webhookEvent.Meta?.CustomData?.TenantId;
        if (!Guid.TryParse(tenantIdStr, out var tenantId))
        {
            _logger.LogWarning("Invalid or missing tenant_id in subscription custom data. Meta: {Meta}",
                webhookEvent.Meta != null ? "exists" : "null");
            return;
        }

        // Check if LemonSqueezy subscription already exists
        var existing = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (existing != null)
        {
            _logger.LogInformation("LemonSqueezy subscription already exists: {SubscriptionId}", data.Id);
            return;
        }

        // Create new LemonSqueezy subscription record
        var lsSubscription = LemonSqueezySubscription.Create(
            tenantId,
            data.Id,
            attr.CustomerId?.ToString() ?? string.Empty,
            attr.ProductId?.ToString() ?? string.Empty,
            attr.VariantId?.ToString() ?? string.Empty);

        // Update with webhook data
        lsSubscription.UpdateFromWebhook(
            MapStatus(attr.Status),
            attr.StatusFormatted ?? string.Empty,
            attr.TrialEndsAt,
            attr.RenewsAt,
            attr.EndsAt,
            attr.CardBrand,
            attr.CardLastFour,
            attr.UnitPrice,
            attr.UnitPriceCurrency ?? "TRY",
            "month", // Default billing interval
            1,
            attr.Urls?.CustomerPortal,
            attr.Urls?.UpdatePaymentMethod,
            webhookEvent.Meta?.EventId ?? string.Empty);

        _masterContext.LemonSqueezySubscriptions.Add(lsSubscription);

        // UPDATE MAIN SUBSCRIPTION - Find and update the tenant's subscription
        await UpdateMainSubscriptionFromLemonSqueezyAsync(
            tenantId,
            attr.VariantId?.ToString(),
            attr.ProductId?.ToString(),
            attr.Status,
            attr.TrialEndsAt,
            attr.UnitPrice,
            attr.UnitPriceCurrency ?? "TRY",
            cancellationToken);

        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created LemonSqueezy subscription for tenant {TenantId}: {SubscriptionId}",
            tenantId, data.Id);
    }

    /// <summary>
    /// Updates the main Subscription entity when a LemonSqueezy subscription is created or updated
    /// </summary>
    private async Task UpdateMainSubscriptionFromLemonSqueezyAsync(
        Guid tenantId,
        string? variantId,
        string? productId,
        string? status,
        DateTime? trialEndsAt,
        decimal? unitPrice,
        string currency,
        CancellationToken cancellationToken)
    {
        try
        {
            // Find the tenant's current subscription
            var subscription = await _masterContext.Subscriptions
                .Include(s => s.Modules)
                .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

            if (subscription == null)
            {
                _logger.LogWarning("No subscription found for tenant {TenantId} to update from LemonSqueezy", tenantId);
                return;
            }

            // Find the package that matches the LemonSqueezy variant
            Package? package = null;
            if (!string.IsNullOrEmpty(variantId))
            {
                package = await _masterContext.Packages
                    .Include(p => p.Modules)
                    .FirstOrDefaultAsync(p => p.LemonSqueezyVariantId == variantId, cancellationToken);
            }

            // If no package found by variant, try by product ID
            if (package == null && !string.IsNullOrEmpty(productId))
            {
                package = await _masterContext.Packages
                    .Include(p => p.Modules)
                    .FirstOrDefaultAsync(p => p.LemonSqueezyProductId == productId, cancellationToken);
            }

            if (package == null)
            {
                _logger.LogWarning("No package found matching LemonSqueezy variant {VariantId} or product {ProductId}. " +
                    "Please configure LemonSqueezyVariantId on your packages.", variantId, productId);

                // Still activate the subscription even without package mapping
                if (status == "active" && subscription.Status == Domain.Master.Enums.SubscriptionStatus.Deneme)
                {
                    subscription.Activate();
                    _logger.LogInformation("Activated subscription {SubscriptionId} for tenant {TenantId} (no package mapping)",
                        subscription.Id, tenantId);
                }
                return;
            }

            // Update subscription with the new package
            var newPrice = Domain.Common.ValueObjects.Money.Create(unitPrice ?? package.BasePrice.Amount, currency);

            // Change to the purchased package
            subscription.ChangePackage(package.Id, newPrice);
            _logger.LogInformation("Changed subscription {SubscriptionId} to package {PackageId} ({PackageName})",
                subscription.Id, package.Id, package.Name);

            // Update modules based on package
            subscription.ClearModules();
            foreach (var packageModule in package.Modules.Where(m => m.IsIncluded))
            {
                subscription.AddModule(packageModule.ModuleCode, packageModule.ModuleName, packageModule.MaxEntities);
            }
            _logger.LogInformation("Updated subscription modules from package. Module count: {Count}",
                package.Modules.Count(m => m.IsIncluded));

            // Activate subscription if it was in trial and LemonSqueezy status is active
            if (status == "active" && subscription.Status == Domain.Master.Enums.SubscriptionStatus.Deneme)
            {
                subscription.Activate();
                _logger.LogInformation("Activated subscription {SubscriptionId} for tenant {TenantId}",
                    subscription.Id, tenantId);
            }
            // Handle trial status from LemonSqueezy
            else if (status == "on_trial" && trialEndsAt.HasValue)
            {
                _logger.LogInformation("Subscription {SubscriptionId} is on trial until {TrialEndDate}",
                    subscription.Id, trialEndsAt.Value);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating main subscription for tenant {TenantId} from LemonSqueezy webhook", tenantId);
            // Don't throw - we still want to save the LemonSqueezy subscription record
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data?.Attributes == null) return;

        var attr = data.Attributes;
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (lsSubscription == null)
        {
            // Subscription not found - this can happen if subscription_created was missed
            // Try to create it from subscription_updated event
            _logger.LogWarning("LemonSqueezy subscription not found for update: {SubscriptionId}. Creating from update event.", data.Id);

            // Extract tenant ID from custom data in meta
            var tenantIdStr = webhookEvent.Meta?.CustomData?.TenantId;
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
            {
                _logger.LogWarning("Invalid or missing tenant_id in subscription_updated custom data");
                return;
            }

            // Create new subscription record using factory method
            lsSubscription = LemonSqueezySubscription.Create(
                tenantId,
                data.Id,
                attr.CustomerId?.ToString() ?? string.Empty,
                attr.ProductId?.ToString() ?? string.Empty,
                attr.VariantId?.ToString() ?? string.Empty);

            // Update with full webhook data
            lsSubscription.UpdateFromWebhook(
                MapStatus(attr.Status),
                attr.StatusFormatted ?? string.Empty,
                attr.TrialEndsAt,
                attr.RenewsAt,
                attr.EndsAt,
                attr.CardBrand,
                attr.CardLastFour,
                attr.UnitPrice,
                attr.UnitPriceCurrency ?? "TRY",
                "month",
                1,
                attr.Urls?.CustomerPortal,
                attr.Urls?.UpdatePaymentMethod,
                webhookEvent.Meta?.EventId ?? string.Empty);

            // Set additional info
            lsSubscription.SetProductInfo(attr.ProductName, attr.VariantName);
            if (!string.IsNullOrEmpty(attr.UserEmail))
                lsSubscription.SetCustomerEmail(attr.UserEmail);

            await _masterContext.LemonSqueezySubscriptions.AddAsync(lsSubscription, cancellationToken);
            _logger.LogInformation("Created LemonSqueezy subscription from update event: {SubscriptionId} for tenant {TenantId}",
                data.Id, tenantId);

            // Update main subscription
            await UpdateMainSubscriptionFromLemonSqueezyAsync(
                tenantId,
                attr.VariantId?.ToString(),
                attr.ProductId?.ToString(),
                attr.Status,
                attr.TrialEndsAt,
                attr.UnitPrice,
                attr.UnitPriceCurrency ?? "TRY",
                cancellationToken);

            await _masterContext.SaveChangesAsync(cancellationToken);
            return;
        }

        lsSubscription.UpdateFromWebhook(
            MapStatus(attr.Status),
            attr.StatusFormatted ?? string.Empty,
            attr.TrialEndsAt,
            attr.RenewsAt,
            attr.EndsAt,
            attr.CardBrand,
            attr.CardLastFour,
            attr.UnitPrice,
            attr.UnitPriceCurrency ?? "TRY",
            "month",
            1,
            attr.Urls?.CustomerPortal,
            attr.Urls?.UpdatePaymentMethod,
            webhookEvent.Meta?.EventId ?? string.Empty);

        // Also update the main subscription
        await UpdateMainSubscriptionFromLemonSqueezyAsync(
            lsSubscription.TenantId,
            attr.VariantId?.ToString(),
            attr.ProductId?.ToString(),
            attr.Status,
            attr.TrialEndsAt,
            attr.UnitPrice,
            attr.UnitPriceCurrency ?? "TRY",
            cancellationToken);

        await _masterContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Updated LemonSqueezy subscription: {SubscriptionId}", data.Id);
    }

    private async Task HandleSubscriptionCancelledAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data == null) return;

        var subscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("Subscription not found for cancellation: {SubscriptionId}", data.Id);
            return;
        }

        subscription.MarkAsCancelled();
        await _masterContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Cancelled subscription: {SubscriptionId}", data.Id);
    }

    private async Task HandleSubscriptionResumedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data == null) return;

        var subscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("Subscription not found for resume: {SubscriptionId}", data.Id);
            return;
        }

        subscription.MarkAsResumed();
        await _masterContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Resumed subscription: {SubscriptionId}", data.Id);
    }

    private async Task HandleSubscriptionExpiredAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data == null) return;

        var subscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("Subscription not found for expiration: {SubscriptionId}", data.Id);
            return;
        }

        subscription.MarkAsExpired();
        await _masterContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Expired subscription: {SubscriptionId}", data.Id);
    }

    private async Task HandleSubscriptionPausedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data == null) return;

        var subscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("Subscription not found for pause: {SubscriptionId}", data.Id);
            return;
        }

        subscription.MarkAsPaused();
        await _masterContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Paused subscription: {SubscriptionId}", data.Id);
    }

    private async Task HandleSubscriptionUnpausedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        await HandleSubscriptionResumedAsync(webhookEvent, cancellationToken);
    }

    private async Task HandlePaymentSuccessAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data?.Attributes == null) return;

        var attr = data.Attributes;
        _logger.LogInformation("Payment successful for subscription: {SubscriptionId}, Amount: {Amount} {Currency}",
            data.Id, attr.UnitPrice, attr.UnitPriceCurrency);

        // Find the LemonSqueezy subscription to get TenantId
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsSubscriptionId == data.Id, cancellationToken);

        if (lsSubscription == null)
        {
            _logger.LogWarning("LemonSqueezy subscription not found for payment: {SubscriptionId}", data.Id);
            return;
        }

        // Find the tenant's subscription in our system
        var subscription = await _masterContext.Subscriptions
            .FirstOrDefaultAsync(s => s.TenantId == lsSubscription.TenantId, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("Subscription not found for tenant {TenantId}", lsSubscription.TenantId);
            return;
        }

        // Activate subscription if it was in trial
        if (subscription.Status == Domain.Master.Enums.SubscriptionStatus.Deneme)
        {
            subscription.Activate();
            _logger.LogInformation("Trial subscription activated for tenant {TenantId}", lsSubscription.TenantId);
        }

        // Create Invoice
        var currency = attr.UnitPriceCurrency ?? "TRY";
        var amount = Domain.Common.ValueObjects.Money.Create(attr.UnitPrice / 100m, currency); // LemonSqueezy sends amount in cents
        var taxRate = 20m; // KDV oranı %20

        var invoice = Domain.Master.Entities.Invoice.Create(
            tenantId: lsSubscription.TenantId,
            subscriptionId: subscription.Id,
            totalAmount: amount,
            taxRate: taxRate,
            issueDate: DateTime.UtcNow,
            dueDate: DateTime.UtcNow.AddDays(30),
            notes: $"LemonSqueezy Payment - {attr.ProductName ?? "Subscription"}"
        );

        // Add invoice item
        invoice.AddItem(
            description: $"{attr.ProductName ?? "Subscription"} - {attr.VariantName ?? "Monthly"}",
            quantity: 1,
            unitPrice: amount
        );

        // Send invoice and mark as paid
        invoice.Send();
        invoice.AddPayment(
            method: Domain.Master.Enums.PaymentMethod.KrediKarti,
            amount: invoice.TotalAmount,
            transactionId: webhookEvent.Meta?.EventId ?? data.Id,
            notes: $"LemonSqueezy payment - Card: {attr.CardBrand ?? "Unknown"} *{attr.CardLastFour ?? "****"}"
        );

        _masterContext.Invoices.Add(invoice);
        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created Invoice {InvoiceNumber} and Payment for tenant {TenantId}, Amount: {Amount}",
            invoice.InvoiceNumber, lsSubscription.TenantId, invoice.TotalAmount);
    }

    private async Task HandlePaymentFailedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data == null) return;

        _logger.LogWarning("Payment failed for subscription: {SubscriptionId}", data.Id);
        // Additional payment failure handling can be added here
        // For example: send email notification, update subscription status, etc.
        await Task.CompletedTask;
    }

    private async Task HandleOrderCreatedAsync(LsWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        var data = webhookEvent.Data;
        if (data?.Attributes == null) return;

        var orderId = data.Attributes.FirstOrderItem?.OrderId?.ToString();
        if (string.IsNullOrEmpty(orderId)) return;

        // Find subscription by customer ID and update order ID
        var customerId = data.Attributes.CustomerId?.ToString();
        if (string.IsNullOrEmpty(customerId)) return;

        var subscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.LsCustomerId == customerId && s.LsOrderId == null, cancellationToken);

        if (subscription != null)
        {
            subscription.SetOrderId(data.Id);
            await _masterContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Updated order ID for subscription: {SubscriptionId}", subscription.LsSubscriptionId);
        }
    }

    private static LemonSqueezyStatus MapStatus(string? status)
    {
        return status?.ToLowerInvariant() switch
        {
            "on_trial" => LemonSqueezyStatus.OnTrial,
            "active" => LemonSqueezyStatus.Active,
            "paused" => LemonSqueezyStatus.Paused,
            "past_due" => LemonSqueezyStatus.PastDue,
            "unpaid" => LemonSqueezyStatus.Unpaid,
            "cancelled" => LemonSqueezyStatus.Cancelled,
            "expired" => LemonSqueezyStatus.Expired,
            _ => LemonSqueezyStatus.Active
        };
    }

    #endregion

    #region Products & Variants

    public async Task<Result<List<LsProduct>>> GetProductsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var storeId = await GetStoreIdAsync(cancellationToken);
            _logger.LogInformation("Getting products for store: {StoreId}", storeId);

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Get,
                $"{BaseUrl}/products?filter[store_id]={storeId}", cancellationToken);
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to get products: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure<List<LsProduct>>(
                    Error.Failure("Products.Failed", "Ürünler alınamadı"));
            }

            var lsResponse = JsonSerializer.Deserialize<LsApiListResponse<LsProductData>>(responseContent);

            var products = lsResponse?.Data?.Select(p => new LsProduct
            {
                Id = p.Id,
                Name = p.Attributes?.Name ?? string.Empty,
                Description = p.Attributes?.Description,
                Status = p.Attributes?.Status ?? string.Empty,
                Price = p.Attributes?.Price ?? 0,
                PriceFormatted = p.Attributes?.PriceFormatted,
                IsSubscription = p.Attributes?.PayModel == "subscription"
            }).ToList() ?? new List<LsProduct>();

            return Result.Success(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products");
            return Result.Failure<List<LsProduct>>(
                Error.Failure("Products.Error", "Ürünler alınırken bir hata oluştu"));
        }
    }

    public async Task<Result<List<LsVariant>>> GetVariantsAsync(string productId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting variants for product: {ProductId}", productId);

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Get,
                $"{BaseUrl}/variants?filter[product_id]={productId}", cancellationToken);
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to get variants: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure<List<LsVariant>>(
                    Error.Failure("Variants.Failed", "Varyantlar alınamadı"));
            }

            var lsResponse = JsonSerializer.Deserialize<LsApiListResponse<LsVariantData>>(responseContent);

            var variants = lsResponse?.Data?.Select(v => new LsVariant
            {
                Id = v.Id,
                ProductId = productId,
                Name = v.Attributes?.Name ?? string.Empty,
                Price = v.Attributes?.Price ?? 0,
                PriceFormatted = v.Attributes?.PriceFormatted,
                Interval = v.Attributes?.Interval,
                IntervalCount = v.Attributes?.IntervalCount,
                IsSubscription = v.Attributes?.IsSubscription ?? false
            }).ToList() ?? new List<LsVariant>();

            return Result.Success(variants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting variants for product {ProductId}", productId);
            return Result.Failure<List<LsVariant>>(
                Error.Failure("Variants.Error", "Varyantlar alınırken bir hata oluştu"));
        }
    }

    #endregion

    #region Invoices

    public async Task<Result<List<LsInvoice>>> GetSubscriptionInvoicesAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting invoices for subscription: {SubscriptionId}", subscriptionId);

            var httpRequest = await CreateAuthorizedRequestAsync(HttpMethod.Get,
                $"{BaseUrl}/subscription-invoices?filter[subscription_id]={subscriptionId}", cancellationToken);
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to get subscription invoices: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return Result.Failure<List<LsInvoice>>(
                    Error.Failure("Invoices.Failed", "Faturalar alınamadı"));
            }

            var lsResponse = JsonSerializer.Deserialize<LsApiListResponse<LsInvoiceData>>(responseContent);

            var invoices = lsResponse?.Data?.Select(i => new LsInvoice
            {
                Id = i.Id,
                InvoiceNumber = i.Attributes?.BillingReason,
                Status = i.Attributes?.Status ?? string.Empty,
                Total = i.Attributes?.Total ?? 0,
                Currency = i.Attributes?.Currency ?? "TRY",
                InvoiceUrl = i.Attributes?.Urls?.InvoiceUrl,
                CreatedAt = i.Attributes?.CreatedAt ?? DateTime.MinValue,
                PaidAt = i.Attributes?.UpdatedAt
            }).ToList() ?? new List<LsInvoice>();

            return Result.Success(invoices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting invoices for subscription {SubscriptionId}", subscriptionId);
            return Result.Failure<List<LsInvoice>>(
                Error.Failure("Invoices.Error", "Faturalar alınırken bir hata oluştu"));
        }
    }

    #endregion
}

#region Lemon Squeezy API DTOs

internal class LsApiResponse<T>
{
    [JsonPropertyName("data")]
    public T? Data { get; set; }
}

internal class LsApiListResponse<T>
{
    [JsonPropertyName("data")]
    public List<T>? Data { get; set; }
}

internal class LsCheckoutData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public LsCheckoutAttributes? Attributes { get; set; }
}

internal class LsCheckoutAttributes
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("expires_at")]
    public DateTime? ExpiresAt { get; set; }
}

internal class LsSubscriptionData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public LsSubscriptionAttributes? Attributes { get; set; }
}

internal class LsSubscriptionAttributes
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("status_formatted")]
    public string? StatusFormatted { get; set; }

    [JsonPropertyName("product_id")]
    public int? ProductId { get; set; }

    [JsonPropertyName("product_name")]
    public string? ProductName { get; set; }

    [JsonPropertyName("variant_id")]
    public int? VariantId { get; set; }

    [JsonPropertyName("variant_name")]
    public string? VariantName { get; set; }

    [JsonPropertyName("customer_id")]
    public int? CustomerId { get; set; }

    [JsonPropertyName("user_email")]
    public string? UserEmail { get; set; }

    [JsonPropertyName("unit_price")]
    public int UnitPrice { get; set; }

    [JsonPropertyName("unit_price_currency")]
    public string? UnitPriceCurrency { get; set; }

    [JsonPropertyName("billing_anchor")]
    public int BillingAnchor { get; set; }

    [JsonPropertyName("trial_ends_at")]
    public DateTime? TrialEndsAt { get; set; }

    [JsonPropertyName("renews_at")]
    public DateTime? RenewsAt { get; set; }

    [JsonPropertyName("ends_at")]
    public DateTime? EndsAt { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("card_brand")]
    public string? CardBrand { get; set; }

    [JsonPropertyName("card_last_four")]
    public string? CardLastFour { get; set; }

    [JsonPropertyName("urls")]
    public LsSubscriptionUrls? Urls { get; set; }

    [JsonPropertyName("custom_data")]
    public LsCustomData? CustomData { get; set; }

    [JsonPropertyName("first_order_item")]
    public LsOrderItem? FirstOrderItem { get; set; }
}

internal class LsSubscriptionUrls
{
    [JsonPropertyName("update_payment_method")]
    public string? UpdatePaymentMethod { get; set; }

    [JsonPropertyName("customer_portal")]
    public string? CustomerPortal { get; set; }
}

internal class LsCustomData
{
    [JsonPropertyName("tenant_id")]
    public string? TenantId { get; set; }
}

internal class LsOrderItem
{
    [JsonPropertyName("order_id")]
    public int? OrderId { get; set; }
}

internal class LsCustomerData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public LsCustomerAttributes? Attributes { get; set; }
}

internal class LsCustomerAttributes
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("urls")]
    public LsCustomerUrls? Urls { get; set; }
}

internal class LsCustomerUrls
{
    [JsonPropertyName("customer_portal")]
    public string? CustomerPortal { get; set; }
}

internal class LsProductData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public LsProductAttributes? Attributes { get; set; }
}

internal class LsProductAttributes
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("price")]
    public int? Price { get; set; }

    [JsonPropertyName("price_formatted")]
    public string? PriceFormatted { get; set; }

    [JsonPropertyName("pay_model")]
    public string? PayModel { get; set; }
}

internal class LsVariantData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public LsVariantAttributes? Attributes { get; set; }
}

internal class LsVariantAttributes
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("price")]
    public int? Price { get; set; }

    [JsonPropertyName("price_formatted")]
    public string? PriceFormatted { get; set; }

    [JsonPropertyName("interval")]
    public string? Interval { get; set; }

    [JsonPropertyName("interval_count")]
    public int? IntervalCount { get; set; }

    [JsonPropertyName("is_subscription")]
    public bool? IsSubscription { get; set; }
}

internal class LsWebhookEvent
{
    [JsonPropertyName("meta")]
    public LsWebhookMeta? Meta { get; set; }

    [JsonPropertyName("data")]
    public LsWebhookData? Data { get; set; }
}

internal class LsWebhookMeta
{
    [JsonPropertyName("event_name")]
    public string? EventName { get; set; }

    [JsonPropertyName("event_id")]
    public string? EventId { get; set; }

    [JsonPropertyName("custom_data")]
    public LsCustomData? CustomData { get; set; }
}

internal class LsWebhookData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("attributes")]
    public LsSubscriptionAttributes? Attributes { get; set; }
}

internal class LsInvoiceData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public LsInvoiceAttributes? Attributes { get; set; }
}

internal class LsInvoiceAttributes
{
    [JsonPropertyName("billing_reason")]
    public string? BillingReason { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("total")]
    public int? Total { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [JsonPropertyName("urls")]
    public LsInvoiceUrls? Urls { get; set; }
}

internal class LsInvoiceUrls
{
    [JsonPropertyName("invoice_url")]
    public string? InvoiceUrl { get; set; }
}

#endregion
