using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.ExchangeRates.Commands;
using Stocker.Modules.Finance.Application.Features.ExchangeRates.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Döviz Kuru (Exchange Rate) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/exchange-rates")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class ExchangeRatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ExchangeRatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated exchange rates
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ExchangeRateSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<ExchangeRateSummaryDto>>> GetExchangeRates(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sourceCurrency = null,
        [FromQuery] string? targetCurrency = null,
        [FromQuery] int? rateType = null,
        [FromQuery] int? source = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isTcmbRate = null,
        [FromQuery] bool? isManualEntry = null,
        [FromQuery] bool? isDefaultForDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetExchangeRatesQuery
        {
            TenantId = tenantId.Value,
            Filter = new ExchangeRateFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                SourceCurrency = sourceCurrency,
                TargetCurrency = targetCurrency,
                RateType = rateType.HasValue ? (ExchangeRateType)rateType.Value : null,
                Source = source.HasValue ? (ExchangeRateSource)source.Value : null,
                StartDate = startDate,
                EndDate = endDate,
                IsActive = isActive,
                IsTcmbRate = isTcmbRate,
                IsManualEntry = isManualEntry,
                IsDefaultForDate = isDefaultForDate,
                SortBy = sortBy,
                SortDescending = sortDescending
            }
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get exchange rate by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> GetExchangeRate(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetExchangeRateByIdQuery
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get exchange rate by date
    /// </summary>
    [HttpGet("by-date")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> GetExchangeRateByDate(
        [FromQuery] string sourceCurrency,
        [FromQuery] DateTime date,
        [FromQuery] string targetCurrency = "TRY",
        [FromQuery] bool useDefaultOnly = true)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetExchangeRateByDateQuery
        {
            TenantId = tenantId.Value,
            SourceCurrency = sourceCurrency,
            TargetCurrency = targetCurrency,
            Date = date,
            UseDefaultOnly = useDefaultOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get latest exchange rate for a currency pair
    /// </summary>
    [HttpGet("latest")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> GetLatestExchangeRate(
        [FromQuery] string sourceCurrency,
        [FromQuery] string targetCurrency = "TRY")
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLatestExchangeRateQuery
        {
            TenantId = tenantId.Value,
            SourceCurrency = sourceCurrency,
            TargetCurrency = targetCurrency
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get exchange rates by currency pair
    /// </summary>
    [HttpGet("by-currency")]
    [ProducesResponseType(typeof(List<ExchangeRateSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ExchangeRateSummaryDto>>> GetExchangeRatesByCurrency(
        [FromQuery] string sourceCurrency,
        [FromQuery] string targetCurrency = "TRY",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? maxResults = 30)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetExchangeRatesByCurrencyQuery
        {
            TenantId = tenantId.Value,
            SourceCurrency = sourceCurrency,
            TargetCurrency = targetCurrency,
            StartDate = startDate,
            EndDate = endDate,
            MaxResults = maxResults
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get TCMB exchange rates
    /// </summary>
    [HttpGet("tcmb")]
    [ProducesResponseType(typeof(List<ExchangeRateSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ExchangeRateSummaryDto>>> GetTcmbRates(
        [FromQuery] DateTime? date = null,
        [FromQuery] bool latestOnly = true)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetTcmbRatesQuery
        {
            TenantId = tenantId.Value,
            Date = date,
            LatestOnly = latestOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Convert currency
    /// </summary>
    [HttpPost("convert")]
    [ProducesResponseType(typeof(CurrencyConversionResultDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CurrencyConversionResultDto>> ConvertCurrency([FromBody] CurrencyConversionRequestDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new ConvertCurrencyQuery
        {
            TenantId = tenantId.Value,
            Request = dto
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get available currencies
    /// </summary>
    [HttpGet("currencies")]
    [ProducesResponseType(typeof(List<CurrencyDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CurrencyDto>>> GetCurrencies(
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isBaseCurrency = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCurrenciesQuery
        {
            TenantId = tenantId.Value,
            Filter = new CurrencyFilterDto
            {
                SearchTerm = searchTerm,
                IsActive = isActive,
                IsBaseCurrency = isBaseCurrency,
                SortBy = sortBy,
                SortDescending = sortDescending
            }
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new exchange rate
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ExchangeRateDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> CreateExchangeRate([FromBody] CreateExchangeRateDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateExchangeRateCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetExchangeRate), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create a TCMB exchange rate
    /// </summary>
    [HttpPost("tcmb")]
    [ProducesResponseType(typeof(ExchangeRateDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> CreateTcmbRate([FromBody] CreateTcmbRateDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateTcmbRateCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetExchangeRate), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create a manual exchange rate
    /// </summary>
    [HttpPost("manual")]
    [ProducesResponseType(typeof(ExchangeRateDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> CreateManualRate([FromBody] CreateManualRateDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateManualRateCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetExchangeRate), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an exchange rate
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> UpdateExchangeRate(int id, [FromBody] UpdateExchangeRateDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateExchangeRateCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Set forex rates (buying and selling)
    /// </summary>
    [HttpPost("{id}/forex-rates")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> SetForexRates(int id, [FromBody] SetRatesDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new SetForexRatesCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Set banknote rates (buying and selling)
    /// </summary>
    [HttpPost("{id}/banknote-rates")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> SetBanknoteRates(int id, [FromBody] SetRatesDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new SetBanknoteRatesCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Set exchange rate as default for date
    /// </summary>
    [HttpPost("{id}/set-default")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> SetAsDefaultForDate(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new SetAsDefaultForDateCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Activate an exchange rate
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> ActivateExchangeRate(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ActivateExchangeRateCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deactivate an exchange rate
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(typeof(ExchangeRateDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExchangeRateDto>> DeactivateExchangeRate(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeactivateExchangeRateCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete an exchange rate
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteExchangeRate(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteExchangeRateCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
