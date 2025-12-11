using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;
using Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/loyalty-programs")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class LoyaltyProgramsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoyaltyProgramsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetLoyaltyPrograms(
        [FromQuery] LoyaltyProgramType? programType = null,
        [FromQuery] bool? isActive = true,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetLoyaltyProgramsQuery(programType, isActive, skip, take);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLoyaltyProgram(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetLoyaltyProgramByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLoyaltyProgram(
        [FromBody] CreateLoyaltyProgramRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new CreateLoyaltyProgramCommand(
            tenantId,
            request.Name,
            request.Code,
            request.ProgramType,
            request.Description,
            null, // StartDate
            null, // EndDate
            request.PointsPerSpend ?? 1,
            request.SpendUnit ?? 1,
            "TRY", // Currency
            request.MinimumSpendForPoints,
            request.MaxPointsPerTransaction,
            request.PointValue ?? 0.01m,
            request.MinimumRedemptionPoints ?? 100,
            request.MaxRedemptionPercentage);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetLoyaltyProgram), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLoyaltyProgram(
        Guid id,
        [FromBody] UpdateLoyaltyProgramRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new UpdateLoyaltyProgramCommand(
            id,
            tenantId,
            request.Name,
            request.Code,
            request.Description,
            null, // StartDate
            null, // EndDate
            request.PointsPerSpend,
            request.SpendUnit,
            request.MinimumSpendForPoints,
            request.MaxPointsPerTransaction,
            request.PointValue,
            request.MinimumRedemptionPoints,
            request.MaxRedemptionPercentage,
            null, // PointsValidityMonths
            null, // ResetPointsYearly
            null, // BirthdayBonusPoints
            null, // SignUpBonusPoints
            null, // ReferralBonusPoints
            null, // ReviewBonusPoints
            request.ProgramType,
            request.IsActive);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLoyaltyProgram(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteLoyaltyProgramCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }

    // TODO: The following specialized methods require specific Commands to be created
    // Currently not migrated to MediatR pattern - require: AddTierCommand,
    // RemoveTierCommand, AddRewardCommand, RemoveRewardCommand,
    // ActivateCommand, DeactivateCommand
}

public record CreateLoyaltyProgramRequest(
    string Name,
    string Code,
    LoyaltyProgramType ProgramType = LoyaltyProgramType.PointsBased,
    string? Description = null,
    decimal? PointsPerSpend = null,
    decimal? SpendUnit = null,
    decimal? MinimumSpendForPoints = null,
    int? MaxPointsPerTransaction = null,
    decimal? PointValue = null,
    int? MinimumRedemptionPoints = null,
    decimal? MaxRedemptionPercentage = null);

public record UpdateLoyaltyProgramRequest(
    string? Name = null,
    string? Code = null,
    string? Description = null,
    LoyaltyProgramType? ProgramType = null,
    decimal? PointsPerSpend = null,
    decimal? SpendUnit = null,
    decimal? MinimumSpendForPoints = null,
    int? MaxPointsPerTransaction = null,
    decimal? PointValue = null,
    int? MinimumRedemptionPoints = null,
    decimal? MaxRedemptionPercentage = null,
    bool? IsActive = null);

public record AddTierRequest(
    string Name,
    int MinPoints,
    decimal DiscountPercentage);

public record AddRewardRequest(
    string Name,
    string Description,
    int PointsCost,
    RewardType RewardType,
    decimal? DiscountValue = null,
    decimal? DiscountPercentage = null);
