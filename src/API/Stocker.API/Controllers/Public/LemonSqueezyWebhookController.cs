using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Services;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Handles Lemon Squeezy webhook events.
/// This controller processes payment and subscription events from Lemon Squeezy.
/// </summary>
[Route("api/webhooks/lemonsqueezy")]
[AllowAnonymous]
public class LemonSqueezyWebhookController : ApiController
{
    private readonly ILemonSqueezyService _lemonSqueezyService;
    private readonly ILogger<LemonSqueezyWebhookController> _logger;

    public LemonSqueezyWebhookController(
        ILemonSqueezyService lemonSqueezyService,
        ILogger<LemonSqueezyWebhookController> logger)
    {
        _lemonSqueezyService = lemonSqueezyService;
        _logger = logger;
    }

    /// <summary>
    /// Receives and processes Lemon Squeezy webhook events.
    /// </summary>
    /// <remarks>
    /// This endpoint receives webhook notifications from Lemon Squeezy for:
    /// - Subscription created, updated, cancelled, resumed, expired, paused, unpaused
    /// - Subscription payment success/failed
    /// - Order created
    ///
    /// The webhook signature is validated using HMAC-SHA256.
    /// </remarks>
    /// <returns>200 OK on successful processing</returns>
    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        try
        {
            // Read raw body for signature validation
            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync(cancellationToken);

            // Get signature from header
            var signature = Request.Headers["X-Signature"].FirstOrDefault();

            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Webhook received without signature");
                return BadRequest(new { error = "Missing signature" });
            }

            _logger.LogInformation("Processing Lemon Squeezy webhook, signature: {SignaturePrefix}...",
                signature.Length > 10 ? signature[..10] : signature);

            // Process the webhook
            var result = await _lemonSqueezyService.ProcessWebhookAsync(payload, signature, cancellationToken);

            if (result.IsSuccess)
            {
                _logger.LogInformation("Webhook processed successfully");
                return Ok(new { success = true });
            }

            _logger.LogWarning("Webhook processing failed: {Error}", result.Error.Description);

            // Return 200 to prevent retries for validation errors
            if (result.Error.Code.StartsWith("Webhook.Invalid"))
            {
                return Ok(new { success = false, error = result.Error.Description });
            }

            // Return 500 for actual processing errors to trigger retry
            return StatusCode(500, new { error = result.Error.Description });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception processing Lemon Squeezy webhook");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

}
