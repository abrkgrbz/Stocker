using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Services;

public interface IPaymentService
{
    Task<Result<PaymentResult>> ProcessPaymentAsync(PaymentRequest request, CancellationToken cancellationToken = default);
    Task<Result<PaymentResult>> RefundPaymentAsync(string paymentId, decimal amount, CancellationToken cancellationToken = default);
    Task<Result<PaymentStatus>> GetPaymentStatusAsync(string paymentId, CancellationToken cancellationToken = default);
    Task<Result<List<PaymentTransaction>>> GetPaymentHistoryAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _secretKey;
    private readonly string _baseUrl;

    public PaymentService(
        IConfiguration configuration,
        ILogger<PaymentService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("Iyzico");
        
        // Iyzico configuration
        _apiKey = configuration["Payment:Iyzico:ApiKey"] ?? string.Empty;
        _secretKey = configuration["Payment:Iyzico:SecretKey"] ?? string.Empty;
        _baseUrl = configuration["Payment:Iyzico:BaseUrl"] ?? "https://sandbox-api.iyzipay.com";
    }

    public async Task<Result<PaymentResult>> ProcessPaymentAsync(PaymentRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Processing payment for tenant {TenantId}, amount: {Amount}", request.TenantId, request.Amount);

            // Create Iyzico payment request
            var iyzicoRequest = new
            {
                locale = "tr",
                conversationId = Guid.NewGuid().ToString(),
                price = request.Amount.ToString("F2").Replace(",", "."),
                paidPrice = request.Amount.ToString("F2").Replace(",", "."),
                currency = request.Currency ?? "TRY",
                installment = 1,
                basketId = request.OrderId,
                paymentChannel = "WEB",
                paymentGroup = "PRODUCT",
                paymentCard = new
                {
                    cardHolderName = request.CardHolderName,
                    cardNumber = request.CardNumber,
                    expireMonth = request.ExpiryMonth,
                    expireYear = request.ExpiryYear,
                    cvc = request.Cvv,
                    registerCard = 0
                },
                buyer = new
                {
                    id = request.TenantId.ToString(),
                    name = request.BuyerName,
                    surname = request.BuyerSurname,
                    gsmNumber = request.BuyerPhone,
                    email = request.BuyerEmail,
                    identityNumber = request.BuyerIdentityNumber,
                    registrationAddress = request.BuyerAddress,
                    ip = request.BuyerIp,
                    city = request.BuyerCity,
                    country = "Turkey"
                },
                shippingAddress = new
                {
                    contactName = request.BuyerName + " " + request.BuyerSurname,
                    city = request.BuyerCity,
                    country = "Turkey",
                    address = request.BuyerAddress
                },
                billingAddress = new
                {
                    contactName = request.BuyerName + " " + request.BuyerSurname,
                    city = request.BuyerCity,
                    country = "Turkey",
                    address = request.BuyerAddress
                },
                basketItems = new[]
                {
                    new
                    {
                        id = request.OrderId,
                        name = request.Description,
                        category1 = "Subscription",
                        itemType = "VIRTUAL",
                        price = request.Amount.ToString("F2").Replace(",", ".")
                    }
                }
            };

            // Generate authorization header
            var authorizationHeader = GenerateAuthorizationHeader(iyzicoRequest);
            _httpClient.DefaultRequestHeaders.Add("Authorization", authorizationHeader);
            _httpClient.DefaultRequestHeaders.Add("x-iyzi-rnd", Guid.NewGuid().ToString());

            // Send request to Iyzico
            var jsonContent = JsonConvert.SerializeObject(iyzicoRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/payment/auth", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var iyzicoResponse = JsonConvert.DeserializeObject<IyzicoPaymentResponse>(responseContent);
                
                if (iyzicoResponse?.Status == "success")
                {
                    var result = new PaymentResult
                    {
                        PaymentId = iyzicoResponse.PaymentId,
                        Status = PaymentStatus.Success,
                        TransactionId = iyzicoResponse.PaymentTransId,
                        Amount = request.Amount,
                        Currency = request.Currency ?? "TRY",
                        ProcessedAt = DateTime.UtcNow,
                        ResponseData = responseContent
                    };

                    _logger.LogInformation("Payment successful: {PaymentId}", result.PaymentId);
                    return Result<PaymentResult>.Success(result);
                }
                else
                {
                    _logger.LogWarning("Payment failed: {ErrorMessage}", iyzicoResponse?.ErrorMessage);
                    return Result<PaymentResult>.Failure(Error.Failure("Payment.Failed", iyzicoResponse?.ErrorMessage ?? "Payment failed"));
                }
            }
            else
            {
                _logger.LogError("Payment request failed with status {StatusCode}: {Response}", response.StatusCode, responseContent);
                return Result<PaymentResult>.Failure(Error.Failure("Payment.RequestFailed", "Payment request failed"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment");
            return Result<PaymentResult>.Failure(Error.Failure("Payment.Error", ex.Message));
        }
    }

    public async Task<Result<PaymentResult>> RefundPaymentAsync(string paymentId, decimal amount, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Processing refund for payment {PaymentId}, amount: {Amount}", paymentId, amount);

            var refundRequest = new
            {
                locale = "tr",
                conversationId = Guid.NewGuid().ToString(),
                paymentTransactionId = paymentId,
                price = amount.ToString("F2").Replace(",", "."),
                currency = "TRY",
                ip = "127.0.0.1"
            };

            var authorizationHeader = GenerateAuthorizationHeader(refundRequest);
            _httpClient.DefaultRequestHeaders.Add("Authorization", authorizationHeader);

            var jsonContent = JsonConvert.SerializeObject(refundRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/payment/refund", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var iyzicoResponse = JsonConvert.DeserializeObject<IyzicoRefundResponse>(responseContent);
                
                if (iyzicoResponse?.Status == "success")
                {
                    var result = new PaymentResult
                    {
                        PaymentId = iyzicoResponse.PaymentId,
                        Status = PaymentStatus.Refunded,
                        TransactionId = iyzicoResponse.PaymentTransId,
                        Amount = amount,
                        Currency = "TRY",
                        ProcessedAt = DateTime.UtcNow,
                        ResponseData = responseContent
                    };

                    _logger.LogInformation("Refund successful: {PaymentId}", result.PaymentId);
                    return Result<PaymentResult>.Success(result);
                }
                else
                {
                    _logger.LogWarning("Refund failed: {ErrorMessage}", iyzicoResponse?.ErrorMessage);
                    return Result<PaymentResult>.Failure(Error.Failure("Refund.Failed", iyzicoResponse?.ErrorMessage ?? "Refund failed"));
                }
            }
            else
            {
                _logger.LogError("Refund request failed with status {StatusCode}: {Response}", response.StatusCode, responseContent);
                return Result<PaymentResult>.Failure(Error.Failure("Refund.RequestFailed", "Refund request failed"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund");
            return Result<PaymentResult>.Failure(Error.Failure("Refund.Error", ex.Message));
        }
    }

    public async Task<Result<PaymentStatus>> GetPaymentStatusAsync(string paymentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new
            {
                locale = "tr",
                conversationId = Guid.NewGuid().ToString(),
                paymentId = paymentId
            };

            var authorizationHeader = GenerateAuthorizationHeader(request);
            _httpClient.DefaultRequestHeaders.Add("Authorization", authorizationHeader);

            var jsonContent = JsonConvert.SerializeObject(request);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/payment/detail", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var iyzicoResponse = JsonConvert.DeserializeObject<IyzicoPaymentDetailResponse>(responseContent);
                
                if (iyzicoResponse?.Status == "success")
                {
                    var status = iyzicoResponse.PaymentStatus switch
                    {
                        "SUCCESS" => PaymentStatus.Success,
                        "FAILURE" => PaymentStatus.Failed,
                        "INIT_THREEDS" => PaymentStatus.Pending,
                        "CALLBACK_THREEDS" => PaymentStatus.Pending,
                        "BKM_POS_SELECTED" => PaymentStatus.Pending,
                        "CALLBACK_BKM" => PaymentStatus.Pending,
                        _ => PaymentStatus.Unknown
                    };

                    return Result<PaymentStatus>.Success(status);
                }
                else
                {
                    _logger.LogWarning("Failed to get payment status: {ErrorMessage}", iyzicoResponse?.ErrorMessage);
                    return Result<PaymentStatus>.Failure(Error.Failure("PaymentStatus.Failed", iyzicoResponse?.ErrorMessage ?? "Failed to get payment status"));
                }
            }
            else
            {
                _logger.LogError("Payment status request failed with status {StatusCode}: {Response}", response.StatusCode, responseContent);
                return Result<PaymentStatus>.Failure(Error.Failure("PaymentStatus.RequestFailed", "Payment status request failed"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status");
            return Result<PaymentStatus>.Failure(Error.Failure("PaymentStatus.Error", ex.Message));
        }
    }

    public async Task<Result<List<PaymentTransaction>>> GetPaymentHistoryAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            // This would typically query from your database
            // For now, returning empty list
            var transactions = new List<PaymentTransaction>();
            
            return Result<List<PaymentTransaction>>.Success(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment history for tenant {TenantId}", tenantId);
            return Result<List<PaymentTransaction>>.Failure(Error.Failure("PaymentHistory.Error", ex.Message));
        }
    }

    private string GenerateAuthorizationHeader(object request)
    {
        var randomString = Guid.NewGuid().ToString();
        var requestString = JsonConvert.SerializeObject(request);
        var payload = randomString + requestString;

        var signature = GenerateSignature(payload);
        var authorizationString = $"IYZWS {_apiKey}:{signature}";
        
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(authorizationString));
    }

    private string GenerateSignature(string payload)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToBase64String(hash);
    }
}

#region DTOs

public class PaymentRequest
{
    public Guid TenantId { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public string Description { get; set; } = string.Empty;
    
    // Card Information
    public string CardHolderName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public string ExpiryMonth { get; set; } = string.Empty;
    public string ExpiryYear { get; set; } = string.Empty;
    public string Cvv { get; set; } = string.Empty;
    
    // Buyer Information
    public string BuyerName { get; set; } = string.Empty;
    public string BuyerSurname { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public string BuyerPhone { get; set; } = string.Empty;
    public string BuyerIdentityNumber { get; set; } = string.Empty;
    public string BuyerAddress { get; set; } = string.Empty;
    public string BuyerCity { get; set; } = string.Empty;
    public string BuyerIp { get; set; } = string.Empty;
}

public class PaymentResult
{
    public string PaymentId { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
    public string? ResponseData { get; set; }
}

public class PaymentTransaction
{
    public string TransactionId { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
}

public enum PaymentStatus
{
    Pending,
    Success,
    Failed,
    Cancelled,
    Refunded,
    Unknown
}

// Iyzico Response DTOs
public class IyzicoPaymentResponse
{
    public string? Status { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorGroup { get; set; }
    public string? Locale { get; set; }
    public long? SystemTime { get; set; }
    public string? ConversationId { get; set; }
    public string? PaymentId { get; set; }
    public string? PaymentTransId { get; set; }
}

public class IyzicoRefundResponse : IyzicoPaymentResponse
{
    public string? Price { get; set; }
    public string? Currency { get; set; }
}

public class IyzicoPaymentDetailResponse : IyzicoPaymentResponse
{
    public string? PaymentStatus { get; set; }
    public string? Price { get; set; }
    public string? PaidPrice { get; set; }
    public string? Currency { get; set; }
}

#endregion