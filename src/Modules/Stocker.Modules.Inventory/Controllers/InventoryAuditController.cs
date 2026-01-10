using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Contracts;

namespace Stocker.Modules.Inventory.Controllers;

/// <summary>
/// Controller for inventory audit trail and change history operations
/// </summary>
[ApiController]
[Route("api/inventory/audit")]
[Authorize]
public class InventoryAuditController : ControllerBase
{
    private readonly IInventoryAuditService _auditService;

    public InventoryAuditController(IInventoryAuditService auditService)
    {
        _auditService = auditService;
    }

    /// <summary>
    /// Get paginated audit logs with filtering
    /// </summary>
    /// <param name="entityType">Filter by entity type (e.g., Product, Stock)</param>
    /// <param name="entityId">Filter by specific entity ID</param>
    /// <param name="action">Filter by action type (e.g., Created, Updated)</param>
    /// <param name="userId">Filter by user ID</param>
    /// <param name="fromDate">Filter from date</param>
    /// <param name="toDate">Filter to date</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20)</param>
    /// <returns>Paginated audit logs</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedAuditLogsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedAuditLogsDto>> GetAuditLogs(
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null,
        [FromQuery] string? action = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filter = new InventoryAuditFilterDto
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            UserId = userId,
            FromDate = fromDate,
            ToDate = toDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _auditService.GetAuditLogsAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get audit dashboard with summaries and trends
    /// </summary>
    /// <param name="days">Number of days to include in trend data (default: 30)</param>
    /// <returns>Audit dashboard data</returns>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(InventoryAuditDashboardDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<InventoryAuditDashboardDto>> GetAuditDashboard(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await _auditService.GetAuditDashboardAsync(days, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get complete history for a specific entity
    /// </summary>
    /// <param name="entityType">Entity type (e.g., Product, Stock)</param>
    /// <param name="entityId">Entity ID</param>
    /// <returns>Entity history with all changes</returns>
    [HttpGet("history/{entityType}/{entityId}")]
    [ProducesResponseType(typeof(EntityHistoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EntityHistoryDto>> GetEntityHistory(
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default)
    {
        var result = await _auditService.GetEntityHistoryAsync(entityType, entityId, cancellationToken);

        if (result == null)
            return NotFound($"No history found for {entityType} with ID {entityId}");

        return Ok(result);
    }

    /// <summary>
    /// Get a specific audit log entry by ID
    /// </summary>
    /// <param name="id">Audit log ID</param>
    /// <returns>Audit log entry details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(InventoryAuditLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InventoryAuditLogDto>> GetAuditLogById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await _auditService.GetAuditLogByIdAsync(id, cancellationToken);

        if (result == null)
            return NotFound($"Audit log with ID {id} not found");

        return Ok(result);
    }

    /// <summary>
    /// Get supported entity types with labels
    /// </summary>
    /// <returns>Dictionary of entity types and their Turkish labels</returns>
    [HttpGet("entity-types")]
    [ProducesResponseType(typeof(Dictionary<string, string>), StatusCodes.Status200OK)]
    public ActionResult<Dictionary<string, string>> GetEntityTypes()
    {
        var result = _auditService.GetEntityTypes();
        return Ok(result);
    }

    /// <summary>
    /// Get supported action types with labels
    /// </summary>
    /// <returns>Dictionary of action types and their Turkish labels</returns>
    [HttpGet("action-types")]
    [ProducesResponseType(typeof(Dictionary<string, string>), StatusCodes.Status200OK)]
    public ActionResult<Dictionary<string, string>> GetActionTypes()
    {
        var result = _auditService.GetActionTypes();
        return Ok(result);
    }
}
