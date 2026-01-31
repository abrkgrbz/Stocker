using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Services;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Handles Iyzico webhook events.
/// This controller processes payment and subscription events from Iyzico.
/// </summary>
[Route("api/webhooks/iyzico")]
[AllowAnonymous]
public class IyzicoWebhookController : ApiController
{
    private readonly IIyzicoService _iyzicoService;
    private readonly ILogger<IyzicoWebhookController> _logger;

    public IyzicoWebhookController(
        IIyzicoService iyzicoService,
        ILogger<IyzicoWebhookController> logger)
    {
        _iyzicoService = iyzicoService;
        _logger = logger;
    }

    /// <summary>
    /// Receives and processes Iyzico webhook events.
    /// </summary>
    /// <remarks>
    /// This endpoint receives webhook notifications from Iyzico for:
    /// - Subscription created, updated, cancelled, renewed
    /// - Payment success/failed
    /// - Card token events
    ///
    /// The webhook is processed and validated by the IyzicoService.
    /// </remarks>
    /// <returns>200 OK on successful processing</returns>
    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        try
        {
            // Read raw body
            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync(cancellationToken);

            _logger.LogInformation("Received Iyzico webhook, payload length: {Length}", payload.Length);

            // Process the webhook
            var result = await _iyzicoService.ProcessWebhookAsync(payload, cancellationToken);

            if (result.IsSuccess)
            {
                _logger.LogInformation("Iyzico webhook processed successfully");
                return Ok(new { success = true });
            }

            _logger.LogWarning("Iyzico webhook processing failed: {Error}", result.Error);

            // Return 200 to prevent retries for validation errors
            return Ok(new { success = false, error = result.Error });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception processing Iyzico webhook");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Callback endpoint for 3D Secure payment completion.
    /// </summary>
    /// <remarks>
    /// This endpoint is called by Iyzico after 3D Secure verification is completed.
    /// It verifies the payment result and redirects the user to the appropriate page.
    /// </remarks>
    [HttpPost("callback")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> Handle3DCallback([FromForm] Iyzico3DCallbackRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Received Iyzico 3D callback for token: {Token}", request.Token);

            // Verify the 3D Secure result
            var verifyResult = await _iyzicoService.Verify3DSecureAsync(request.Token, cancellationToken);

            if (verifyResult.IsSuccess && verifyResult.Value!.IsSuccess)
            {
                _logger.LogInformation("3D Secure verification successful for token: {Token}", request.Token);

                // Redirect to success page with payment details
                var successUrl = $"/billing/success?paymentId={verifyResult.Value.PaymentId}&provider=iyzico";
                return Redirect(successUrl);
            }

            _logger.LogWarning("3D Secure verification failed for token: {Token}, error: {Error}",
                request.Token, verifyResult.Error.Description ?? verifyResult.Value?.ErrorMessage);

            // Redirect to cancel/error page
            var cancelUrl = $"/billing/cancel?error={Uri.EscapeDataString(verifyResult.Error.Description ?? verifyResult.Value?.ErrorMessage ?? "Payment verification failed")}&provider=iyzico";
            return Redirect(cancelUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception processing Iyzico 3D callback");
            return Redirect("/billing/cancel?error=Internal%20server%20error&provider=iyzico");
        }
    }

    /// <summary>
    /// Callback endpoint for checkout form completion.
    /// </summary>
    /// <remarks>
    /// This endpoint is called when user completes the Iyzico checkout form.
    /// It retrieves the payment result and redirects the user.
    /// </remarks>
    [HttpPost("checkout-callback")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> HandleCheckoutCallback([FromForm] IyzicoCheckoutCallbackRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Received Iyzico checkout callback for token: {Token}", request.Token);

            // Retrieve checkout form result
            var result = await _iyzicoService.GetCheckoutFormResultAsync(request.Token, cancellationToken);

            if (result.IsSuccess && result.Value!.IsSuccess)
            {
                _logger.LogInformation("Checkout form successful for token: {Token}, payment: {PaymentId}",
                    request.Token, result.Value.PaymentId);

                // Redirect to success page
                var successUrl = $"/billing/success?paymentId={result.Value.PaymentId}&provider=iyzico";
                return Redirect(successUrl);
            }

            _logger.LogWarning("Checkout form failed for token: {Token}, error: {Error}",
                request.Token, result.Error.Description ?? result.Value?.ErrorMessage);

            // Redirect to cancel page
            var cancelUrl = $"/billing/cancel?error={Uri.EscapeDataString(result.Error.Description ?? result.Value?.ErrorMessage ?? "Checkout failed")}&provider=iyzico";
            return Redirect(cancelUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception processing Iyzico checkout callback");
            return Redirect("/billing/cancel?error=Internal%20server%20error&provider=iyzico");
        }
    }

    /// <summary>
    /// Subscription webhook endpoint for subscription-specific events.
    /// </summary>
    [HttpPost("subscription")]
    [Consumes("application/json")]
    public async Task<IActionResult> HandleSubscriptionWebhook(CancellationToken cancellationToken)
    {
        try
        {
            // Read raw body
            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync(cancellationToken);

            _logger.LogInformation("Received Iyzico subscription webhook, payload length: {Length}", payload.Length);

            // Process subscription webhook
            var result = await _iyzicoService.ProcessWebhookAsync(payload, cancellationToken);

            if (result.IsSuccess)
            {
                _logger.LogInformation("Iyzico subscription webhook processed successfully");
                return Ok(new { success = true });
            }

            _logger.LogWarning("Iyzico subscription webhook processing failed: {Error}", result.Error);
            return Ok(new { success = false, error = result.Error });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception processing Iyzico subscription webhook");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

/// <summary>
/// Request model for Iyzico 3D Secure callback
/// </summary>
public class Iyzico3DCallbackRequest
{
    public string Token { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? PaymentId { get; set; }
    public string? ConversationId { get; set; }
    public string? MdStatus { get; set; }
}

/// <summary>
/// Request model for Iyzico checkout form callback
/// </summary>
public class IyzicoCheckoutCallbackRequest
{
    public string Token { get; set; } = string.Empty;
    public string? ConversationId { get; set; }
}
