using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Stocker.Infrastructure.Services;
using Microsoft.Extensions.Configuration;

namespace Stocker.API.Controllers.Public;

#if DEBUG
/// <summary>
/// Payment Test Controller for testing Iyzico integration
/// ONLY AVAILABLE IN DEBUG BUILD - Excluded from production for security
/// </summary>
[ApiController]
[Route("api/public/payment-test")]
[AllowAnonymous]
[ApiExplorerSettings(GroupName = "public")]
public class PaymentTestController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentTestController> _logger;

    public PaymentTestController(
        IPaymentService paymentService,
        IConfiguration configuration,
        ILogger<PaymentTestController> logger)
    {
        _paymentService = paymentService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Check if test mode is enabled
    /// </summary>
    [HttpGet("status")]
    public IActionResult GetTestStatus()
    {
        var isTestModeEnabled = _configuration.GetValue<bool>("Payment:EnableTestMode", false);
        var environment = _configuration["ASPNETCORE_ENVIRONMENT"];
        
        return Ok(new
        {
            testModeEnabled = isTestModeEnabled,
            environment,
            iyzicoBaseUrl = _configuration["Payment:Iyzico:BaseUrl"],
            message = isTestModeEnabled 
                ? "Test mode is enabled. You can use test endpoints." 
                : "Test mode is disabled. Enable it in configuration to use test endpoints."
        });
    }

    /// <summary>
    /// Process a test payment with Iyzico sandbox
    /// </summary>
    [HttpPost("process")]
    public async Task<IActionResult> ProcessTestPayment([FromBody] TestPaymentRequest request)
    {
        // Check if test mode is enabled
        if (!_configuration.GetValue<bool>("Payment:EnableTestMode", false))
        {
            return BadRequest(new
            {
                success = false,
                error = "Test mode is not enabled. Set Payment:EnableTestMode to true in configuration."
            });
        }

        try
        {
            // Create payment request with test data
            var paymentRequest = new PaymentRequest
            {
                TenantId = request.TenantId ?? Guid.NewGuid(),
                OrderId = $"TEST-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}".Substring(0, 20),
                Amount = request.Amount,
                Currency = request.Currency ?? "TRY",
                Description = request.Description ?? "Test Payment",
                
                // Use provided card info or Iyzico test cards
                CardHolderName = request.CardHolderName ?? "John Doe",
                CardNumber = request.CardNumber ?? GetTestCardNumber(request.TestCardType),
                ExpiryMonth = request.ExpiryMonth ?? "12",
                ExpiryYear = request.ExpiryYear ?? "2030",
                Cvv = request.Cvv ?? "123",
                
                // Test buyer information
                BuyerName = request.BuyerName ?? "John",
                BuyerSurname = request.BuyerSurname ?? "Doe",
                BuyerEmail = request.BuyerEmail ?? "test@test.com",
                BuyerPhone = request.BuyerPhone ?? "+905350000000",
                BuyerIdentityNumber = request.BuyerIdentityNumber ?? "74300864791",
                BuyerAddress = request.BuyerAddress ?? "Test Address No:1",
                BuyerCity = request.BuyerCity ?? "Istanbul",
                BuyerIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "85.34.78.112"
            };

            _logger.LogInformation("Processing test payment: {OrderId}, Amount: {Amount} {Currency}", 
                paymentRequest.OrderId, paymentRequest.Amount, paymentRequest.Currency);

            var result = await _paymentService.ProcessPaymentAsync(paymentRequest);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("Test payment successful: {PaymentId}", result.Value?.PaymentId);
                return Ok(new
                {
                    success = true,
                    data = result.Value,
                    message = "Test payment processed successfully",
                    testMode = true,
                    orderId = paymentRequest.OrderId
                });
            }

            _logger.LogWarning("Test payment failed: {Error}", result.Error?.Description);
            return BadRequest(new
            {
                success = false,
                error = result.Error?.Description,
                code = result.Error?.Code,
                testMode = true,
                orderId = paymentRequest.OrderId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing test payment");
            return StatusCode(500, new
            {
                success = false,
                error = ex.Message,
                testMode = true
            });
        }
    }

    /// <summary>
    /// Process a test refund
    /// </summary>
    [HttpPost("refund")]
    public async Task<IActionResult> ProcessTestRefund([FromBody] TestRefundRequest request)
    {
        if (!_configuration.GetValue<bool>("Payment:EnableTestMode", false))
        {
            return BadRequest(new
            {
                success = false,
                error = "Test mode is not enabled"
            });
        }

        try
        {
            _logger.LogInformation("Processing test refund for payment: {PaymentId}, Amount: {Amount}", 
                request.PaymentId, request.Amount);

            var result = await _paymentService.RefundPaymentAsync(request.PaymentId, request.Amount);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("Test refund successful: {PaymentId}", request.PaymentId);
                return Ok(new
                {
                    success = true,
                    data = result.Value,
                    message = "Test refund processed successfully",
                    testMode = true
                });
            }

            _logger.LogWarning("Test refund failed: {Error}", result.Error?.Description);
            return BadRequest(new
            {
                success = false,
                error = result.Error?.Description,
                code = result.Error?.Code,
                testMode = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing test refund");
            return StatusCode(500, new
            {
                success = false,
                error = ex.Message,
                testMode = true
            });
        }
    }

    /// <summary>
    /// Get payment status
    /// </summary>
    [HttpGet("status/{paymentId}")]
    public async Task<IActionResult> GetPaymentStatus(string paymentId)
    {
        if (!_configuration.GetValue<bool>("Payment:EnableTestMode", false))
        {
            return BadRequest(new
            {
                success = false,
                error = "Test mode is not enabled"
            });
        }

        try
        {
            var result = await _paymentService.GetPaymentStatusAsync(paymentId);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    status = result.Value.ToString(),
                    paymentId,
                    testMode = true
                });
            }

            return BadRequest(new
            {
                success = false,
                error = result.Error?.Description,
                code = result.Error?.Code,
                testMode = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status");
            return StatusCode(500, new
            {
                success = false,
                error = ex.Message,
                testMode = true
            });
        }
    }

    /// <summary>
    /// Get available test card numbers
    /// </summary>
    [HttpGet("test-cards")]
    public IActionResult GetTestCards()
    {
        return Ok(new
        {
            success = true,
            testCards = new[]
            {
                new { type = "success", number = "5528790000000008", description = "Master Card - Success" },
                new { type = "success_visa", number = "4543590000000006", description = "Visa - Success" },
                new { type = "failure", number = "5528790000000009", description = "Master Card - Failure" },
                new { type = "3d_required", number = "4543590000000014", description = "Visa - 3D Secure Required" },
                new { type = "insufficient_funds", number = "5528790000000016", description = "Master Card - Insufficient Funds" },
                new { type = "invalid_cvv", number = "5528790000000024", description = "Master Card - Invalid CVV" },
                new { type = "expired", number = "5528790000000032", description = "Master Card - Expired Card" }
            },
            testBuyerInfo = new
            {
                identityNumber = "74300864791",
                phone = "+905350000000",
                email = "test@test.com"
            },
            note = "Use these test cards only in sandbox environment"
        });
    }

    private string GetTestCardNumber(string? testCardType)
    {
        return testCardType?.ToLower() switch
        {
            "failure" => "5528790000000009",
            "3d" or "3d_required" => "4543590000000014",
            "insufficient" or "insufficient_funds" => "5528790000000016",
            "invalid_cvv" => "5528790000000024",
            "expired" => "5528790000000032",
            "visa" => "4543590000000006",
            _ => "5528790000000008" // Default success card
        };
    }
}

#region Request DTOs

public class TestPaymentRequest
{
    public Guid? TenantId { get; set; }
    public decimal Amount { get; set; } = 100.00m;
    public string? Currency { get; set; }
    public string? Description { get; set; }
    
    // Card information
    public string? CardHolderName { get; set; }
    public string? CardNumber { get; set; }
    public string? ExpiryMonth { get; set; }
    public string? ExpiryYear { get; set; }
    public string? Cvv { get; set; }
    
    // Test card type for automatic selection
    public string? TestCardType { get; set; } // success, failure, 3d_required, insufficient_funds, etc.
    
    // Buyer information
    public string? BuyerName { get; set; }
    public string? BuyerSurname { get; set; }
    public string? BuyerEmail { get; set; }
    public string? BuyerPhone { get; set; }
    public string? BuyerIdentityNumber { get; set; }
    public string? BuyerAddress { get; set; }
    public string? BuyerCity { get; set; }
}

public class TestRefundRequest
{
    public string PaymentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

#endregion

#endif // DEBUG