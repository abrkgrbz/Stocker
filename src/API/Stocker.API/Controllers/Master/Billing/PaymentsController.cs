using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Payments.Commands.ProcessPayment;
using Stocker.Application.Features.Payments.Commands.RefundPayment;
using Stocker.Application.Features.Payments.Commands.CancelPayment;
using Stocker.Application.Features.Payments.Queries.GetPaymentById;
using Stocker.Application.Features.Payments.Queries.GetPaymentsList;
using Stocker.Application.Features.Payments.Queries.GetTenantPayments;
using Stocker.Application.DTOs.Payment;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Payment Processing")]
public class PaymentsController : MasterControllerBase
{
    public PaymentsController(IMediator mediator, ILogger<PaymentsController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all payments with filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetPaymentsListQuery query)
    {
        _logger.LogInformation("Getting all payments with query: {@Query}", query);
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PaymentDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting payment details for ID: {PaymentId}", id);
        
        var query = new GetPaymentByIdQuery { PaymentId = id };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get all payments for a specific tenant
    /// </summary>
    [HttpGet("tenant/{tenantId}")]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), 200)]
    public async Task<IActionResult> GetByTenant(Guid tenantId, [FromQuery] string? status = null)
    {
        _logger.LogInformation("Getting payments for tenant: {TenantId}", tenantId);
        
        var query = new GetTenantPaymentsQuery 
        { 
            TenantId = tenantId,
            Status = status
        };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Process a new payment
    /// </summary>
    [HttpPost("process")]
    [ProducesResponseType(typeof(ApiResponse<PaymentResultDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentCommand command)
    {
        _logger.LogInformation("Processing payment for invoice: {InvoiceId}, Amount: {Amount}", 
            command.InvoiceId, command.Amount);
        
        command.ProcessedBy = CurrentUserId;
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Payment processed successfully. Transaction ID: {TransactionId}", 
                result.Value.TransactionId);
        }
        else
        {
            _logger.LogWarning("Payment processing failed for invoice: {InvoiceId}", command.InvoiceId);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Refund a payment
    /// </summary>
    [HttpPost("{id}/refund")]
    [ProducesResponseType(typeof(ApiResponse<RefundResultDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RefundPayment(Guid id, [FromBody] RefundPaymentCommand command)
    {
        _logger.LogWarning("Processing refund for payment: {PaymentId}, Amount: {Amount}", 
            id, command.RefundAmount);
        
        command.PaymentId = id;
        command.RefundedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Refund processed successfully for payment: {PaymentId}. Refund ID: {RefundId}", 
                id, result.Value.RefundId);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Cancel a pending payment
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> CancelPayment(Guid id, [FromBody] CancelPaymentCommand command)
    {
        _logger.LogWarning("Cancelling payment: {PaymentId}. Reason: {Reason}", 
            id, command.Reason);
        
        command.PaymentId = id;
        command.CancelledBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Payment {PaymentId} cancelled by {UserEmail}", id, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Get payment statistics for a tenant
    /// </summary>
    [HttpGet("tenant/{tenantId}/statistics")]
    [ProducesResponseType(typeof(ApiResponse<PaymentStatisticsDto>), 200)]
    public async Task<IActionResult> GetTenantStatistics(Guid tenantId)
    {
        _logger.LogInformation("Getting payment statistics for tenant: {TenantId}", tenantId);
        
        // TODO: Implement GetTenantPaymentStatisticsQuery
        return Ok(new ApiResponse<PaymentStatisticsDto>
        {
            Success = true,
            Data = new PaymentStatisticsDto
            {
                TenantId = tenantId,
                TotalPayments = 0,
                TotalAmount = 0,
                TotalRefunded = 0,
                PendingAmount = 0,
                LastPaymentDate = null
            },
            Message = "Statistics retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get failed payments
    /// </summary>
    [HttpGet("failed")]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), 200)]
    public async Task<IActionResult> GetFailedPayments([FromQuery] DateTime? fromDate = null)
    {
        _logger.LogInformation("Getting failed payments from date: {FromDate}", fromDate);
        
        var query = new GetPaymentsListQuery 
        { 
            Status = Domain.Master.Enums.PaymentStatus.Basarisiz,
            FromDate = fromDate ?? DateTime.UtcNow.AddDays(-30)
        };
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Retry a failed payment
    /// </summary>
    [HttpPost("{id}/retry")]
    [ProducesResponseType(typeof(ApiResponse<PaymentResultDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RetryPayment(Guid id)
    {
        _logger.LogInformation("Retrying failed payment: {PaymentId}", id);
        
        // TODO: Implement RetryPaymentCommand
        return Ok(new ApiResponse<PaymentResultDto>
        {
            Success = true,
            Data = new PaymentResultDto
            {
                PaymentId = id,
                TransactionId = Guid.NewGuid().ToString(),
                Status = "Processing",
                Message = "Payment retry initiated"
            },
            Message = "Payment retry initiated successfully",
            Timestamp = DateTime.UtcNow
        });
    }
}

// DTOs for PaymentsController
public class PaymentStatisticsDto
{
    public Guid TenantId { get; set; }
    public int TotalPayments { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalRefunded { get; set; }
    public decimal PendingAmount { get; set; }
    public DateTime? LastPaymentDate { get; set; }
}