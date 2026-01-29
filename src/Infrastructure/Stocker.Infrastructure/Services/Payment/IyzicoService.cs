using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Infrastructure.Configuration;
using Stocker.SharedKernel.Results;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Stocker.Infrastructure.Services.Payment;

/// <summary>
/// Iyzico payment gateway service implementation
/// Handles subscriptions, one-time payments, and card management for Turkish customers
/// </summary>
public class IyzicoService : IIyzicoService
{
    private readonly IyzicoOptions _options;
    private readonly ILogger<IyzicoService> _logger;
    private readonly HttpClient _httpClient;
    private readonly IMasterDbContext _masterContext;
    private readonly ISecretStore _secretStore;

    // Secret names for Azure Key Vault
    private const string SecretName_ApiKey = "iyzico-api-key";
    private const string SecretName_SecretKey = "iyzico-secret-key";
    private const string SecretName_WebhookSecret = "iyzico-webhook-secret";

    // Cached secrets
    private string? _apiKey;
    private string? _secretKey;
    private string? _webhookSecret;
    private bool _secretsLoaded;
    private readonly SemaphoreSlim _secretsLock = new(1, 1);

    public IyzicoService(
        IOptions<IyzicoOptions> options,
        ILogger<IyzicoService> logger,
        IHttpClientFactory httpClientFactory,
        IMasterDbContext masterContext,
        ISecretStore secretStore)
    {
        _options = options.Value;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("Iyzico");
        _masterContext = masterContext;
        _secretStore = secretStore;

        _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    #region Secret Management

    private async Task EnsureSecretsLoadedAsync(CancellationToken cancellationToken = default)
    {
        if (_secretsLoaded) return;

        await _secretsLock.WaitAsync(cancellationToken);
        try
        {
            if (_secretsLoaded) return;

            _logger.LogInformation("Loading Iyzico secrets from {Provider}", _secretStore.ProviderName);

            var apiKeySecret = await _secretStore.GetSecretAsync(SecretName_ApiKey, cancellationToken: cancellationToken);
            var secretKeySecret = await _secretStore.GetSecretAsync(SecretName_SecretKey, cancellationToken: cancellationToken);
            var webhookSecret = await _secretStore.GetSecretAsync(SecretName_WebhookSecret, cancellationToken: cancellationToken);

            _apiKey = apiKeySecret?.Value ?? _options.ApiKey;
            _secretKey = secretKeySecret?.Value ?? _options.SecretKey;
            _webhookSecret = webhookSecret?.Value ?? _options.WebhookSecret;

            if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrEmpty(_secretKey))
            {
                _logger.LogWarning("Iyzico API credentials are not configured");
            }
            else
            {
                _logger.LogInformation("Iyzico secrets loaded successfully from {Source}",
                    apiKeySecret != null ? _secretStore.ProviderName : "configuration");
            }

            _secretsLoaded = true;
        }
        finally
        {
            _secretsLock.Release();
        }
    }

    private string GenerateAuthorizationHeader(string requestBody)
    {
        var randomString = GenerateRandomString();
        var hashData = _apiKey + randomString + _secretKey + requestBody;
        var hash = ComputeSha1Base64(hashData);
        var authorizationString = $"{_apiKey}:{hash}";
        return $"IYZWS {Convert.ToBase64String(Encoding.UTF8.GetBytes(authorizationString))}";
    }

    private static string GenerateRandomString()
    {
        return Guid.NewGuid().ToString("N")[..8];
    }

    private static string ComputeSha1Base64(string input)
    {
        using var sha1 = SHA1.Create();
        var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToBase64String(hash);
    }

    #endregion

    #region Checkout

    public async Task<Result<IyzicoCheckoutResponse>> CreateCheckoutFormAsync(IyzicoCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Creating Iyzico checkout form for tenant {TenantId}", request.TenantId);

            var conversationId = Guid.NewGuid().ToString("N");
            var basketId = request.BasketId ?? $"basket_{request.TenantId:N}_{DateTime.UtcNow:yyyyMMddHHmmss}";

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = conversationId,
                ["price"] = request.Price.ToString("F2"),
                ["paidPrice"] = request.Price.ToString("F2"),
                ["currency"] = request.Currency,
                ["basketId"] = basketId,
                ["paymentGroup"] = request.PaymentGroup,
                ["callbackUrl"] = request.CallbackUrl,
                ["enabledInstallments"] = request.EnableInstallment ? Enumerable.Range(1, _options.MaxInstallmentCount).ToArray() : new[] { 1 },
                ["buyer"] = new Dictionary<string, object>
                {
                    ["id"] = request.TenantId.ToString("N"),
                    ["name"] = GetFirstName(request.CustomerName),
                    ["surname"] = GetLastName(request.CustomerName),
                    ["gsmNumber"] = request.CustomerGsmNumber ?? "+905000000000",
                    ["email"] = request.CustomerEmail,
                    ["identityNumber"] = request.CustomerIdentityNumber ?? "11111111111",
                    ["registrationAddress"] = request.BillingAddress?.Address ?? "Adres bilgisi",
                    ["city"] = request.BillingAddress?.City ?? "Istanbul",
                    ["country"] = request.BillingAddress?.Country ?? "Turkey",
                    ["zipCode"] = request.BillingAddress?.ZipCode ?? "34000"
                },
                ["shippingAddress"] = new Dictionary<string, object>
                {
                    ["contactName"] = request.ShippingAddress?.ContactName ?? request.CustomerName,
                    ["city"] = request.ShippingAddress?.City ?? request.BillingAddress?.City ?? "Istanbul",
                    ["country"] = request.ShippingAddress?.Country ?? request.BillingAddress?.Country ?? "Turkey",
                    ["address"] = request.ShippingAddress?.Address ?? request.BillingAddress?.Address ?? "Adres bilgisi",
                    ["zipCode"] = request.ShippingAddress?.ZipCode ?? request.BillingAddress?.ZipCode ?? "34000"
                },
                ["billingAddress"] = new Dictionary<string, object>
                {
                    ["contactName"] = request.BillingAddress?.ContactName ?? request.CustomerName,
                    ["city"] = request.BillingAddress?.City ?? "Istanbul",
                    ["country"] = request.BillingAddress?.Country ?? "Turkey",
                    ["address"] = request.BillingAddress?.Address ?? "Adres bilgisi",
                    ["zipCode"] = request.BillingAddress?.ZipCode ?? "34000"
                },
                ["basketItems"] = request.BasketItems.Select(item => new Dictionary<string, object>
                {
                    ["id"] = item.Id,
                    ["name"] = item.Name,
                    ["category1"] = item.Category1,
                    ["category2"] = item.Category2 ?? item.Category1,
                    ["itemType"] = item.ItemType,
                    ["price"] = item.Price.ToString("F2")
                }).ToList()
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoApiResponse>("/payment/iyzipos/checkoutform/initialize/auth/ecom", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                _logger.LogError("Iyzico checkout form creation failed: {ErrorCode} - {ErrorMessage}", response.ErrorCode, response.ErrorMessage);
                return Result<IyzicoCheckoutResponse>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoCheckoutResponse>.Success(new IyzicoCheckoutResponse
            {
                Token = response.Token ?? string.Empty,
                CheckoutFormContent = response.CheckoutFormContent ?? string.Empty,
                TokenExpireTime = response.TokenExpireTime ?? 0,
                PaymentPageUrl = response.PaymentPageUrl ?? string.Empty
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Iyzico checkout form for tenant {TenantId}", request.TenantId);
            return Result<IyzicoCheckoutResponse>.Failure(Error.Failure("Iyzico.Error", $"Failed to create checkout: {ex.Message}"));
        }
    }

    public async Task<Result<IyzicoPaymentResult>> RetrieveCheckoutFormResultAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Retrieving Iyzico checkout form result for token {Token}", token[..10]);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["token"] = token
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoPaymentResponse>("/payment/iyzipos/checkoutform/auth/ecom/detail", jsonBody, cancellationToken);

            return Result<IyzicoPaymentResult>.Success(new IyzicoPaymentResult
            {
                Success = response.Status == "success" && response.PaymentStatus == "SUCCESS",
                PaymentId = response.PaymentId,
                PaymentTransactionId = response.ItemTransactions?.FirstOrDefault()?.PaymentTransactionId,
                PaidPrice = decimal.TryParse(response.PaidPrice, out var paidPrice) ? paidPrice : null,
                Currency = response.Currency,
                Installment = response.Installment,
                CardAssociation = response.CardAssociation,
                CardFamily = response.CardFamily,
                CardType = response.CardType,
                BinNumber = response.BinNumber,
                LastFourDigits = response.LastFourDigits,
                ErrorCode = response.ErrorCode,
                ErrorMessage = response.ErrorMessage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Iyzico checkout form result");
            return Result<IyzicoPaymentResult>.Failure(Error.Failure("Iyzico.Error", $"Failed to retrieve payment result: {ex.Message}"));
        }
    }

    #endregion

    #region Subscription Management

    public async Task<Result<IyzicoSubscriptionInfo>> CreateSubscriptionAsync(IyzicoCreateSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Creating Iyzico subscription for customer {CustomerReferenceCode}", request.CustomerReferenceCode);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["pricingPlanReferenceCode"] = request.PricingPlanReferenceCode,
                ["subscriptionInitialStatus"] = request.SubscriptionInitialStatus ?? "ACTIVE",
                ["customer"] = new Dictionary<string, object>
                {
                    ["referenceCode"] = request.CustomerReferenceCode
                }
            };

            // Use saved card or new card
            if (!string.IsNullOrEmpty(request.CardToken))
            {
                requestBody["paymentCard"] = new Dictionary<string, object>
                {
                    ["cardToken"] = request.CardToken
                };
            }
            else if (!string.IsNullOrEmpty(request.CardNumber))
            {
                requestBody["paymentCard"] = new Dictionary<string, object>
                {
                    ["cardHolderName"] = request.CardHolderName,
                    ["cardNumber"] = request.CardNumber,
                    ["expireMonth"] = request.ExpireMonth,
                    ["expireYear"] = request.ExpireYear,
                    ["cvc"] = request.Cvc,
                    ["registerCard"] = request.RegisterCard ? 1 : 0
                };
            }

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoSubscriptionResponse>("/v2/subscription/initialize", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                _logger.LogError("Iyzico subscription creation failed: {ErrorCode} - {ErrorMessage}", response.ErrorCode, response.ErrorMessage);
                return Result<IyzicoSubscriptionInfo>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoSubscriptionInfo>.Success(new IyzicoSubscriptionInfo
            {
                ReferenceCode = response.Data?.ReferenceCode ?? string.Empty,
                ParentReferenceCode = response.Data?.ParentReferenceCode ?? string.Empty,
                CustomerReferenceCode = request.CustomerReferenceCode,
                PricingPlanReferenceCode = request.PricingPlanReferenceCode,
                Status = response.Data?.SubscriptionStatus ?? string.Empty,
                StartDate = response.Data?.StartDate,
                EndDate = response.Data?.EndDate,
                TrialStartDate = response.Data?.TrialStartDate,
                TrialEndDate = response.Data?.TrialEndDate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Iyzico subscription");
            return Result<IyzicoSubscriptionInfo>.Failure(Error.Failure("Iyzico.Error", $"Failed to create subscription: {ex.Message}"));
        }
    }

    public async Task<Result<IyzicoSubscriptionInfo>> GetSubscriptionAsync(string subscriptionReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["subscriptionReferenceCode"] = subscriptionReferenceCode
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoSubscriptionResponse>("/v2/subscription/subscriptions/" + subscriptionReferenceCode, jsonBody, cancellationToken, HttpMethod.Get);

            if (response.Status != "success")
            {
                return Result<IyzicoSubscriptionInfo>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoSubscriptionInfo>.Success(new IyzicoSubscriptionInfo
            {
                ReferenceCode = response.Data?.ReferenceCode ?? string.Empty,
                ParentReferenceCode = response.Data?.ParentReferenceCode ?? string.Empty,
                CustomerReferenceCode = response.Data?.CustomerReferenceCode ?? string.Empty,
                PricingPlanReferenceCode = response.Data?.PricingPlanReferenceCode ?? string.Empty,
                Status = response.Data?.SubscriptionStatus ?? string.Empty,
                StartDate = response.Data?.StartDate,
                EndDate = response.Data?.EndDate,
                TrialStartDate = response.Data?.TrialStartDate,
                TrialEndDate = response.Data?.TrialEndDate,
                PlanName = response.Data?.PricingPlanName,
                ProductName = response.Data?.ProductName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting Iyzico subscription {SubscriptionReferenceCode}", subscriptionReferenceCode);
            return Result<IyzicoSubscriptionInfo>.Failure(Error.Failure("Iyzico.Error", $"Failed to get subscription: {ex.Message}"));
        }
    }

    public async Task<Result> CancelSubscriptionAsync(string subscriptionReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Cancelling Iyzico subscription {SubscriptionReferenceCode}", subscriptionReferenceCode);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["subscriptionReferenceCode"] = subscriptionReferenceCode
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoApiResponse>("/v2/subscription/subscriptions/" + subscriptionReferenceCode + "/cancel", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling Iyzico subscription {SubscriptionReferenceCode}", subscriptionReferenceCode);
            return Result.Failure(Error.Failure("Iyzico.Error", $"Failed to cancel subscription: {ex.Message}"));
        }
    }

    public async Task<Result> UpgradeSubscriptionAsync(string subscriptionReferenceCode, string newPricingPlanReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Upgrading Iyzico subscription {SubscriptionReferenceCode} to plan {NewPlanReferenceCode}",
                subscriptionReferenceCode, newPricingPlanReferenceCode);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["subscriptionReferenceCode"] = subscriptionReferenceCode,
                ["newPricingPlanReferenceCode"] = newPricingPlanReferenceCode,
                ["upgradePeriod"] = "NOW", // NOW or END_OF_PERIOD
                ["useTrial"] = false,
                ["resetRecurrenceCount"] = true
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoApiResponse>("/v2/subscription/subscriptions/" + subscriptionReferenceCode + "/upgrade", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upgrading Iyzico subscription");
            return Result.Failure(Error.Failure("Iyzico.Error", $"Failed to upgrade subscription: {ex.Message}"));
        }
    }

    public async Task<Result> DowngradeSubscriptionAsync(string subscriptionReferenceCode, string newPricingPlanReferenceCode, CancellationToken cancellationToken = default)
    {
        // Iyzico treats upgrade and downgrade the same way
        return await UpgradeSubscriptionAsync(subscriptionReferenceCode, newPricingPlanReferenceCode, cancellationToken);
    }

    public async Task<Result> RetrySubscriptionPaymentAsync(string subscriptionReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Retrying payment for Iyzico subscription {SubscriptionReferenceCode}", subscriptionReferenceCode);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["subscriptionReferenceCode"] = subscriptionReferenceCode
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoApiResponse>("/v2/subscription/operation/retry", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying Iyzico subscription payment");
            return Result.Failure(Error.Failure("Iyzico.Error", $"Failed to retry payment: {ex.Message}"));
        }
    }

    #endregion

    #region Customer Management

    public async Task<Result<IyzicoCustomerInfo>> CreateCustomerAsync(IyzicoCreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Creating Iyzico customer for email {Email}", request.Email);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["name"] = request.Name,
                ["surname"] = request.Surname,
                ["email"] = request.Email,
                ["gsmNumber"] = request.GsmNumber ?? "+905000000000",
                ["identityNumber"] = request.IdentityNumber ?? "11111111111",
                ["shippingAddress"] = new Dictionary<string, object>
                {
                    ["contactName"] = request.ShippingContactName ?? $"{request.Name} {request.Surname}",
                    ["city"] = request.ShippingCity ?? "Istanbul",
                    ["country"] = request.ShippingCountry ?? "Turkey",
                    ["address"] = request.ShippingAddress ?? "Adres bilgisi",
                    ["zipCode"] = request.ShippingZipCode ?? "34000"
                },
                ["billingAddress"] = new Dictionary<string, object>
                {
                    ["contactName"] = request.BillingContactName ?? $"{request.Name} {request.Surname}",
                    ["city"] = request.BillingCity ?? "Istanbul",
                    ["country"] = request.BillingCountry ?? "Turkey",
                    ["address"] = request.BillingAddress ?? "Adres bilgisi",
                    ["zipCode"] = request.BillingZipCode ?? "34000"
                }
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoCustomerResponse>("/v2/subscription/customers", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                _logger.LogError("Iyzico customer creation failed: {ErrorCode} - {ErrorMessage}", response.ErrorCode, response.ErrorMessage);
                return Result<IyzicoCustomerInfo>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoCustomerInfo>.Success(new IyzicoCustomerInfo
            {
                ReferenceCode = response.Data?.ReferenceCode ?? string.Empty,
                Email = request.Email,
                Name = request.Name,
                Surname = request.Surname,
                GsmNumber = request.GsmNumber,
                IdentityNumber = request.IdentityNumber,
                CreatedDate = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Iyzico customer");
            return Result<IyzicoCustomerInfo>.Failure(Error.Failure("Iyzico.Error", $"Failed to create customer: {ex.Message}"));
        }
    }

    public async Task<Result<IyzicoCustomerInfo>> GetCustomerAsync(string customerReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var response = await SendRequestAsync<IyzicoCustomerResponse>($"/v2/subscription/customers/{customerReferenceCode}", "{}", cancellationToken, HttpMethod.Get);

            if (response.Status != "success")
            {
                return Result<IyzicoCustomerInfo>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoCustomerInfo>.Success(new IyzicoCustomerInfo
            {
                ReferenceCode = response.Data?.ReferenceCode ?? string.Empty,
                Email = response.Data?.Email ?? string.Empty,
                Name = response.Data?.Name ?? string.Empty,
                Surname = response.Data?.Surname ?? string.Empty,
                GsmNumber = response.Data?.GsmNumber,
                IdentityNumber = response.Data?.IdentityNumber,
                CreatedDate = response.Data?.CreatedDate ?? DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting Iyzico customer {CustomerReferenceCode}", customerReferenceCode);
            return Result<IyzicoCustomerInfo>.Failure(Error.Failure("Iyzico.Error", $"Failed to get customer: {ex.Message}"));
        }
    }

    public async Task<Result> UpdateCustomerAsync(string customerReferenceCode, IyzicoUpdateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["customerReferenceCode"] = customerReferenceCode
            };

            if (!string.IsNullOrEmpty(request.Name)) requestBody["name"] = request.Name;
            if (!string.IsNullOrEmpty(request.Surname)) requestBody["surname"] = request.Surname;
            if (!string.IsNullOrEmpty(request.GsmNumber)) requestBody["gsmNumber"] = request.GsmNumber;
            if (!string.IsNullOrEmpty(request.IdentityNumber)) requestBody["identityNumber"] = request.IdentityNumber;

            if (!string.IsNullOrEmpty(request.BillingAddress))
            {
                requestBody["billingAddress"] = new Dictionary<string, object>
                {
                    ["contactName"] = request.BillingContactName ?? "",
                    ["city"] = request.BillingCity ?? "Istanbul",
                    ["country"] = request.BillingCountry ?? "Turkey",
                    ["address"] = request.BillingAddress,
                    ["zipCode"] = request.BillingZipCode ?? "34000"
                };
            }

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoApiResponse>($"/v2/subscription/customers/{customerReferenceCode}", jsonBody, cancellationToken, HttpMethod.Put);

            if (response.Status != "success")
            {
                return Result.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating Iyzico customer");
            return Result.Failure(Error.Failure("Iyzico.Error", $"Failed to update customer: {ex.Message}"));
        }
    }

    #endregion

    #region Card Management

    public async Task<Result<IyzicoCardInfo>> SaveCardAsync(IyzicoSaveCardRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["externalId"] = request.CustomerReferenceCode,
                ["cardAlias"] = request.CardAlias,
                ["cardHolderName"] = request.CardHolderName,
                ["cardNumber"] = request.CardNumber,
                ["expireMonth"] = request.ExpireMonth,
                ["expireYear"] = request.ExpireYear
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoCardResponse>("/cardstorage/card", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result<IyzicoCardInfo>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoCardInfo>.Success(new IyzicoCardInfo
            {
                CardToken = response.CardToken ?? string.Empty,
                CardAlias = request.CardAlias,
                BinNumber = response.BinNumber ?? string.Empty,
                LastFourDigits = response.LastFourDigits ?? string.Empty,
                CardType = response.CardType ?? string.Empty,
                CardAssociation = response.CardAssociation ?? string.Empty,
                CardFamily = response.CardFamily ?? string.Empty,
                CardBankName = response.CardBankName,
                CardBankCode = response.CardBankCode
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving card");
            return Result<IyzicoCardInfo>.Failure(Error.Failure("Iyzico.Error", $"Failed to save card: {ex.Message}"));
        }
    }

    public async Task<Result<List<IyzicoCardInfo>>> GetSavedCardsAsync(string customerReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["cardUserKey"] = customerReferenceCode
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoCardListResponse>("/cardstorage/cards", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result<List<IyzicoCardInfo>>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            var cards = response.CardDetails?.Select(c => new IyzicoCardInfo
            {
                CardToken = c.CardToken ?? string.Empty,
                CardAlias = c.CardAlias ?? string.Empty,
                BinNumber = c.BinNumber ?? string.Empty,
                LastFourDigits = c.LastFourDigits ?? string.Empty,
                CardType = c.CardType ?? string.Empty,
                CardAssociation = c.CardAssociation ?? string.Empty,
                CardFamily = c.CardFamily ?? string.Empty,
                CardBankName = c.CardBankName,
                CardBankCode = c.CardBankCode
            }).ToList() ?? new List<IyzicoCardInfo>();

            return Result<List<IyzicoCardInfo>>.Success(cards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting saved cards");
            return Result<List<IyzicoCardInfo>>.Failure(Error.Failure("Iyzico.Error", $"Failed to get cards: {ex.Message}"));
        }
    }

    public async Task<Result> DeleteSavedCardAsync(string cardToken, string customerReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["cardToken"] = cardToken,
                ["cardUserKey"] = customerReferenceCode
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoApiResponse>("/cardstorage/card", jsonBody, cancellationToken, HttpMethod.Delete);

            if (response.Status != "success")
            {
                return Result.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting saved card");
            return Result.Failure(Error.Failure("Iyzico.Error", $"Failed to delete card: {ex.Message}"));
        }
    }

    #endregion

    #region 3D Secure & Checkout Form Verification

    public async Task<Result<Iyzico3DSecureResult>> Verify3DSecureAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Verifying Iyzico 3D Secure for token {TokenPrefix}...", token[..Math.Min(10, token.Length)]);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["paymentId"] = token
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoPaymentResponse>("/payment/detail", jsonBody, cancellationToken);

            return Result<Iyzico3DSecureResult>.Success(new Iyzico3DSecureResult
            {
                IsSuccess = response.Status == "success" && response.PaymentStatus == "SUCCESS",
                PaymentId = response.PaymentId,
                PaymentTransactionId = response.ItemTransactions?.FirstOrDefault()?.PaymentTransactionId,
                PaidPrice = decimal.TryParse(response.PaidPrice, out var paidPrice) ? paidPrice : null,
                Currency = response.Currency,
                Installment = response.Installment,
                CardAssociation = response.CardAssociation,
                CardFamily = response.CardFamily,
                BinNumber = response.BinNumber,
                LastFourDigits = response.LastFourDigits,
                ErrorCode = response.ErrorCode,
                ErrorMessage = response.ErrorMessage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Iyzico 3D Secure");
            return Result<Iyzico3DSecureResult>.Failure(Error.Failure("Iyzico.Error", $"Failed to verify 3D Secure: {ex.Message}"));
        }
    }

    public async Task<Result<IyzicoCheckoutFormResult>> GetCheckoutFormResultAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Getting Iyzico checkout form result for token {TokenPrefix}...", token[..Math.Min(10, token.Length)]);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["token"] = token
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoPaymentResponse>("/payment/iyzipos/checkoutform/auth/ecom/detail", jsonBody, cancellationToken);

            return Result<IyzicoCheckoutFormResult>.Success(new IyzicoCheckoutFormResult
            {
                IsSuccess = response.Status == "success" && response.PaymentStatus == "SUCCESS",
                PaymentId = response.PaymentId,
                PaymentTransactionId = response.ItemTransactions?.FirstOrDefault()?.PaymentTransactionId,
                PaidPrice = decimal.TryParse(response.PaidPrice, out var paidPrice) ? paidPrice : null,
                Currency = response.Currency,
                Installment = response.Installment,
                CardAssociation = response.CardAssociation,
                CardFamily = response.CardFamily,
                BinNumber = response.BinNumber,
                LastFourDigits = response.LastFourDigits,
                ErrorCode = response.ErrorCode,
                ErrorMessage = response.ErrorMessage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting Iyzico checkout form result");
            return Result<IyzicoCheckoutFormResult>.Failure(Error.Failure("Iyzico.Error", $"Failed to get checkout form result: {ex.Message}"));
        }
    }

    #endregion

    #region Pricing Plans

    public async Task<Result<List<IyzicoPricingPlan>>> GetPricingPlansAsync(string productReferenceCode, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var response = await SendRequestAsync<IyzicoPricingPlanListResponse>($"/v2/subscription/products/{productReferenceCode}/pricing-plans", "{}", cancellationToken, HttpMethod.Get);

            if (response.Status != "success")
            {
                return Result<List<IyzicoPricingPlan>>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            var plans = response.Data?.Items?.Select(p => new IyzicoPricingPlan
            {
                ReferenceCode = p.ReferenceCode ?? string.Empty,
                Name = p.Name ?? string.Empty,
                ProductReferenceCode = productReferenceCode,
                Price = p.Price ?? 0,
                Currency = p.CurrencyCode ?? "TRY",
                PaymentInterval = p.PaymentInterval ?? "MONTHLY",
                PaymentIntervalCount = p.PaymentIntervalCount ?? 1,
                TrialPeriodDays = p.TrialPeriodDays,
                RecurrenceCount = p.RecurrenceCount,
                PlanPaymentType = p.PlanPaymentType ?? "RECURRING",
                Status = p.Status ?? string.Empty
            }).ToList() ?? new List<IyzicoPricingPlan>();

            return Result<List<IyzicoPricingPlan>>.Success(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pricing plans for product {ProductReferenceCode}", productReferenceCode);
            return Result<List<IyzicoPricingPlan>>.Failure(Error.Failure("Iyzico.Error", $"Failed to get pricing plans: {ex.Message}"));
        }
    }

    public async Task<Result<IyzicoPricingPlan>> CreatePricingPlanAsync(IyzicoCreatePricingPlanRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["productReferenceCode"] = request.ProductReferenceCode,
                ["name"] = request.Name,
                ["price"] = request.Price.ToString("F2"),
                ["currencyCode"] = request.Currency,
                ["paymentInterval"] = request.PaymentInterval,
                ["paymentIntervalCount"] = request.PaymentIntervalCount,
                ["planPaymentType"] = request.PlanPaymentType
            };

            if (request.TrialPeriodDays.HasValue)
                requestBody["trialPeriodDays"] = request.TrialPeriodDays.Value;

            if (request.RecurrenceCount.HasValue)
                requestBody["recurrenceCount"] = request.RecurrenceCount.Value;

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoPricingPlanResponse>("/v2/subscription/pricing-plans", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result<IyzicoPricingPlan>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            return Result<IyzicoPricingPlan>.Success(new IyzicoPricingPlan
            {
                ReferenceCode = response.Data?.ReferenceCode ?? string.Empty,
                Name = request.Name,
                ProductReferenceCode = request.ProductReferenceCode,
                Price = request.Price,
                Currency = request.Currency,
                PaymentInterval = request.PaymentInterval,
                PaymentIntervalCount = request.PaymentIntervalCount,
                TrialPeriodDays = request.TrialPeriodDays,
                RecurrenceCount = request.RecurrenceCount,
                PlanPaymentType = request.PlanPaymentType,
                Status = "ACTIVE"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating pricing plan");
            return Result<IyzicoPricingPlan>.Failure(Error.Failure("Iyzico.Error", $"Failed to create pricing plan: {ex.Message}"));
        }
    }

    #endregion

    #region Webhooks

    public async Task<Result> ProcessWebhookAsync(string payload, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Processing Iyzico webhook");

            var webhookData = JsonSerializer.Deserialize<IyzicoWebhookPayload>(payload);
            if (webhookData == null)
            {
                return Result.Failure(Error.Failure("Iyzico.Webhook.Invalid", "Invalid webhook payload"));
            }

            _logger.LogInformation("Iyzico webhook event: {EventType}, Subscription: {SubscriptionReferenceCode}",
                webhookData.IyziEventType, webhookData.SubscriptionReferenceCode);

            // Process based on event type
            // This will be handled by the webhook controller which will update entities accordingly
            // Here we just validate the webhook

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Iyzico webhook");
            return Result.Failure(Error.Failure("Iyzico.Error", $"Failed to process webhook: {ex.Message}"));
        }
    }

    #endregion

    #region Installment Options

    public async Task<Result<IyzicoInstallmentInfo>> GetInstallmentOptionsAsync(string binNumber, decimal price, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["binNumber"] = binNumber,
                ["price"] = price.ToString("F2")
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoInstallmentResponse>("/payment/iyzipos/installment", jsonBody, cancellationToken);

            if (response.Status != "success")
            {
                return Result<IyzicoInstallmentInfo>.Failure(Error.Failure("Iyzico.Error", $"Iyzico error: {response.ErrorMessage}"));
            }

            var installmentDetail = response.InstallmentDetails?.FirstOrDefault();

            return Result<IyzicoInstallmentInfo>.Success(new IyzicoInstallmentInfo
            {
                BinNumber = binNumber,
                Price = price,
                CardAssociation = installmentDetail?.CardAssociation,
                CardFamily = installmentDetail?.CardFamilyName,
                CardType = installmentDetail?.CardType,
                BankName = installmentDetail?.BankName,
                BankCode = installmentDetail?.BankCode,
                InstallmentDetails = installmentDetail?.InstallmentPrices?.Select(ip => new IyzicoInstallmentDetail
                {
                    InstallmentNumber = ip.InstallmentNumber ?? 1,
                    TotalPrice = decimal.Parse(ip.TotalPrice ?? "0"),
                    InstallmentPrice = decimal.Parse(ip.InstallmentPrice ?? "0")
                }).ToList() ?? new List<IyzicoInstallmentDetail>()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting installment options");
            return Result<IyzicoInstallmentInfo>.Failure(Error.Failure("Iyzico.Error", $"Failed to get installment options: {ex.Message}"));
        }
    }

    #endregion

    #region Refund

    public async Task<Result<IyzicoRefundResult>> RefundPaymentAsync(string paymentTransactionId, decimal amount, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureSecretsLoadedAsync(cancellationToken);

            _logger.LogInformation("Refunding payment {PaymentTransactionId}, amount {Amount}", paymentTransactionId, amount);

            var requestBody = new Dictionary<string, object>
            {
                ["locale"] = _options.DefaultLocale,
                ["conversationId"] = Guid.NewGuid().ToString("N"),
                ["paymentTransactionId"] = paymentTransactionId,
                ["price"] = amount.ToString("F2")
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var response = await SendRequestAsync<IyzicoRefundResponse>("/payment/refund", jsonBody, cancellationToken);

            return Result<IyzicoRefundResult>.Success(new IyzicoRefundResult
            {
                Success = response.Status == "success",
                PaymentTransactionId = response.PaymentTransactionId,
                RefundedAmount = decimal.TryParse(response.Price, out var refundedAmount) ? refundedAmount : null,
                ErrorCode = response.ErrorCode,
                ErrorMessage = response.ErrorMessage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding payment");
            return Result<IyzicoRefundResult>.Failure(Error.Failure("Iyzico.Error", $"Failed to refund payment: {ex.Message}"));
        }
    }

    #endregion

    #region HTTP Helper Methods

    private async Task<T> SendRequestAsync<T>(string endpoint, string jsonBody, CancellationToken cancellationToken, HttpMethod? method = null)
        where T : IyzicoApiResponse, new()
    {
        method ??= HttpMethod.Post;

        var request = new HttpRequestMessage(method, endpoint);

        if (method != HttpMethod.Get)
        {
            request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        }

        // Add authorization header
        request.Headers.Add("Authorization", GenerateAuthorizationHeader(jsonBody));
        request.Headers.Add("x-iyzi-rnd", GenerateRandomString());

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        _logger.LogDebug("Iyzico API response for {Endpoint}: {StatusCode}", endpoint, response.StatusCode);

        try
        {
            return JsonSerializer.Deserialize<T>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new T { Status = "failure", ErrorMessage = "Failed to deserialize response" };
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize Iyzico response: {Content}", responseContent);
            return new T { Status = "failure", ErrorMessage = $"Invalid response format: {ex.Message}" };
        }
    }

    private static string GetFirstName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "Ad";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 0 ? parts[0] : "Ad";
    }

    private static string GetLastName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "Soyad";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 1 ? string.Join(" ", parts.Skip(1)) : "Soyad";
    }

    #endregion
}

#region Internal API Response Types

internal class IyzicoApiResponse
{
    public string? Status { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorGroup { get; set; }
    public string? Locale { get; set; }
    public long? SystemTime { get; set; }
    public string? ConversationId { get; set; }
    public string? Token { get; set; }
    public string? CheckoutFormContent { get; set; }
    public long? TokenExpireTime { get; set; }
    public string? PaymentPageUrl { get; set; }
}

internal class IyzicoPaymentResponse : IyzicoApiResponse
{
    public string? PaymentId { get; set; }
    public string? PaymentStatus { get; set; }
    public string? PaidPrice { get; set; }
    public string? Currency { get; set; }
    public int? Installment { get; set; }
    public string? CardAssociation { get; set; }
    public string? CardFamily { get; set; }
    public string? CardType { get; set; }
    public string? BinNumber { get; set; }
    public string? LastFourDigits { get; set; }
    public List<IyzicoItemTransaction>? ItemTransactions { get; set; }
}

internal class IyzicoItemTransaction
{
    public string? PaymentTransactionId { get; set; }
    public string? Price { get; set; }
    public string? PaidPrice { get; set; }
}

internal class IyzicoSubscriptionResponse : IyzicoApiResponse
{
    public IyzicoSubscriptionData? Data { get; set; }
}

internal class IyzicoSubscriptionData
{
    public string? ReferenceCode { get; set; }
    public string? ParentReferenceCode { get; set; }
    public string? CustomerReferenceCode { get; set; }
    public string? PricingPlanReferenceCode { get; set; }
    public string? SubscriptionStatus { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? TrialStartDate { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public string? PricingPlanName { get; set; }
    public string? ProductName { get; set; }
}

internal class IyzicoCustomerResponse : IyzicoApiResponse
{
    public IyzicoCustomerData? Data { get; set; }
}

internal class IyzicoCustomerData
{
    public string? ReferenceCode { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? GsmNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public DateTime? CreatedDate { get; set; }
}

internal class IyzicoCardResponse : IyzicoApiResponse
{
    public string? CardToken { get; set; }
    public string? CardUserKey { get; set; }
    public string? BinNumber { get; set; }
    public string? LastFourDigits { get; set; }
    public string? CardType { get; set; }
    public string? CardAssociation { get; set; }
    public string? CardFamily { get; set; }
    public string? CardBankName { get; set; }
    public int? CardBankCode { get; set; }
}

internal class IyzicoCardListResponse : IyzicoApiResponse
{
    public string? CardUserKey { get; set; }
    public List<IyzicoCardDetail>? CardDetails { get; set; }
}

internal class IyzicoCardDetail
{
    public string? CardToken { get; set; }
    public string? CardAlias { get; set; }
    public string? BinNumber { get; set; }
    public string? LastFourDigits { get; set; }
    public string? CardType { get; set; }
    public string? CardAssociation { get; set; }
    public string? CardFamily { get; set; }
    public string? CardBankName { get; set; }
    public int? CardBankCode { get; set; }
}

internal class IyzicoPricingPlanListResponse : IyzicoApiResponse
{
    public IyzicoPricingPlanListData? Data { get; set; }
}

internal class IyzicoPricingPlanListData
{
    public List<IyzicoPricingPlanItem>? Items { get; set; }
}

internal class IyzicoPricingPlanItem
{
    public string? ReferenceCode { get; set; }
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public string? CurrencyCode { get; set; }
    public string? PaymentInterval { get; set; }
    public int? PaymentIntervalCount { get; set; }
    public int? TrialPeriodDays { get; set; }
    public int? RecurrenceCount { get; set; }
    public string? PlanPaymentType { get; set; }
    public string? Status { get; set; }
}

internal class IyzicoPricingPlanResponse : IyzicoApiResponse
{
    public IyzicoPricingPlanData? Data { get; set; }
}

internal class IyzicoPricingPlanData
{
    public string? ReferenceCode { get; set; }
}

internal class IyzicoInstallmentResponse : IyzicoApiResponse
{
    public List<IyzicoInstallmentDetailResponse>? InstallmentDetails { get; set; }
}

internal class IyzicoInstallmentDetailResponse
{
    public string? BinNumber { get; set; }
    public string? CardAssociation { get; set; }
    public string? CardFamilyName { get; set; }
    public string? CardType { get; set; }
    public string? BankName { get; set; }
    public int? BankCode { get; set; }
    public List<IyzicoInstallmentPriceResponse>? InstallmentPrices { get; set; }
}

internal class IyzicoInstallmentPriceResponse
{
    public int? InstallmentNumber { get; set; }
    public string? TotalPrice { get; set; }
    public string? InstallmentPrice { get; set; }
}

internal class IyzicoRefundResponse : IyzicoApiResponse
{
    public string? PaymentTransactionId { get; set; }
    public string? Price { get; set; }
}

internal class IyzicoCheckoutFormResponse : IyzicoApiResponse
{
    public string? PaymentId { get; set; }
    public string? PaymentStatus { get; set; }
    public string? PaidPrice { get; set; }
    public string? Currency { get; set; }
    public int? Installment { get; set; }
    public string? CardAssociation { get; set; }
    public string? CardFamily { get; set; }
    public string? CardType { get; set; }
    public string? BinNumber { get; set; }
    public string? LastFourDigits { get; set; }
    public string? CardToken { get; set; }
    public string? CardUserKey { get; set; }
    public List<IyzicoItemTransaction>? ItemTransactions { get; set; }
}

internal class IyzicoWebhookPayload
{
    public string? IyziEventType { get; set; }
    public string? IyziEventTime { get; set; }
    public string? IyziReferenceCode { get; set; }
    public string? SubscriptionReferenceCode { get; set; }
    public string? CustomerReferenceCode { get; set; }
    public string? PricingPlanReferenceCode { get; set; }
    public string? SubscriptionStatus { get; set; }
}

#endregion
