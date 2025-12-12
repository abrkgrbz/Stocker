using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Application.Features.LandingPage.Commands;
using Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/landing")]
public class CMSLandingPageController : ControllerBase
{
    private readonly IMediator _mediator;

    public CMSLandingPageController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Testimonials

    [HttpGet("testimonials")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<TestimonialDto>>> GetAllTestimonials(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTestimonialsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("testimonials/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TestimonialDto>>> GetActiveTestimonials(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveTestimonialsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("testimonials/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TestimonialDto>>> GetFeaturedTestimonials(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturedTestimonialsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("testimonials/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<TestimonialDto>> GetTestimonialById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTestimonialByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("testimonials")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<TestimonialDto>> CreateTestimonial([FromBody] CreateTestimonialDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateTestimonialCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetTestimonialById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("testimonials/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<TestimonialDto>> UpdateTestimonial(Guid id, [FromBody] UpdateTestimonialDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateTestimonialCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("testimonials/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteTestimonial(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteTestimonialCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Pricing Plans

    [HttpGet("pricing-plans")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetAllPricingPlans(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingPlansQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("pricing-plans/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetActivePricingPlans(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActivePricingPlansQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("pricing-plans/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PricingPlanDto>> GetPricingPlanById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingPlanByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("pricing-plans/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<PricingPlanDto>> GetPricingPlanBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingPlanBySlugQuery { Slug = slug }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("pricing-plans")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PricingPlanDto>> CreatePricingPlan([FromBody] CreatePricingPlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePricingPlanCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetPricingPlanById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("pricing-plans/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PricingPlanDto>> UpdatePricingPlan(Guid id, [FromBody] UpdatePricingPlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePricingPlanCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("pricing-plans/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeletePricingPlan(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeletePricingPlanCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Pricing Features

    [HttpGet("pricing-plans/{planId:guid}/features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<PricingFeatureDto>>> GetPricingFeaturesByPlan(Guid planId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingFeaturesByPlanQuery { PlanId = planId }, cancellationToken);
        return Ok(result);
    }

    [HttpGet("pricing-features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PricingFeatureDto>> GetPricingFeatureById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingFeatureByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("pricing-features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PricingFeatureDto>> CreatePricingFeature([FromBody] CreatePricingFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePricingFeatureCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetPricingFeatureById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("pricing-features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PricingFeatureDto>> UpdatePricingFeature(Guid id, [FromBody] UpdatePricingFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePricingFeatureCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("pricing-features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeletePricingFeature(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeletePricingFeatureCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Features

    [HttpGet("features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<FeatureDto>>> GetAllFeatures(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("features/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<FeatureDto>>> GetActiveFeatures(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveFeaturesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("features/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<FeatureDto>>> GetFeaturedFeatures(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturedFeaturesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("features/category/{category}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<FeatureDto>>> GetFeaturesByCategory(string category, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturesByCategoryQuery { Category = category }, cancellationToken);
        return Ok(result);
    }

    [HttpGet("features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<FeatureDto>> GetFeatureById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeatureByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<FeatureDto>> CreateFeature([FromBody] CreateFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateFeatureCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetFeatureById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<FeatureDto>> UpdateFeature(Guid id, [FromBody] UpdateFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateFeatureCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteFeature(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteFeatureCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Industries

    [HttpGet("industries")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<IndustryDto>>> GetAllIndustries(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIndustriesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("industries/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<IndustryDto>>> GetActiveIndustries(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveIndustriesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("industries/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IndustryDto>> GetIndustryById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIndustryByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("industries/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<IndustryDto>> GetIndustryBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIndustryBySlugQuery { Slug = slug }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("industries")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IndustryDto>> CreateIndustry([FromBody] CreateIndustryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateIndustryCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetIndustryById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("industries/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IndustryDto>> UpdateIndustry(Guid id, [FromBody] UpdateIndustryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateIndustryCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("industries/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteIndustry(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteIndustryCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Integrations

    [HttpGet("integrations")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<IntegrationDto>>> GetAllIntegrations(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("integrations/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<IntegrationDto>>> GetActiveIntegrations(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveIntegrationsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("integrations/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IntegrationDto>> GetIntegrationById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("integrations/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<IntegrationDto>> GetIntegrationBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationBySlugQuery { Slug = slug }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("integrations")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IntegrationDto>> CreateIntegration([FromBody] CreateIntegrationDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateIntegrationCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetIntegrationById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("integrations/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IntegrationDto>> UpdateIntegration(Guid id, [FromBody] UpdateIntegrationDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateIntegrationCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("integrations/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteIntegration(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteIntegrationCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Integration Items

    [HttpGet("integrations/{integrationId:guid}/items")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<IntegrationItemDto>>> GetIntegrationItemsByIntegration(Guid integrationId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationItemsByIntegrationQuery { IntegrationId = integrationId }, cancellationToken);
        return Ok(result);
    }

    [HttpGet("integration-items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IntegrationItemDto>> GetIntegrationItemById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationItemByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("integration-items")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IntegrationItemDto>> CreateIntegrationItem([FromBody] CreateIntegrationItemDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateIntegrationItemCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetIntegrationItemById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("integration-items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IntegrationItemDto>> UpdateIntegrationItem(Guid id, [FromBody] UpdateIntegrationItemDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateIntegrationItemCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("integration-items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteIntegrationItem(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteIntegrationItemCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Stats

    [HttpGet("stats")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<StatDto>>> GetAllStats(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStatsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("stats/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<StatDto>>> GetActiveStats(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveStatsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("stats/section/{section}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<StatDto>>> GetStatsBySection(string section, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStatsBySectionQuery { Section = section }, cancellationToken);
        return Ok(result);
    }

    [HttpGet("stats/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<StatDto>> GetStatById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStatByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("stats")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<StatDto>> CreateStat([FromBody] CreateStatDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateStatCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetStatById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("stats/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<StatDto>> UpdateStat(Guid id, [FromBody] UpdateStatDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateStatCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("stats/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteStat(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteStatCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Partners

    [HttpGet("partners")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetAllPartners(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPartnersQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("partners/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetActivePartners(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActivePartnersQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("partners/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetFeaturedPartners(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturedPartnersQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("partners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PartnerDto>> GetPartnerById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPartnerByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("partners")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PartnerDto>> CreatePartner([FromBody] CreatePartnerDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePartnerCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetPartnerById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("partners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<PartnerDto>> UpdatePartner(Guid id, [FromBody] UpdatePartnerDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePartnerCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("partners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeletePartner(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeletePartnerCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion

    #region Achievements

    [HttpGet("achievements")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<AchievementDto>>> GetAllAchievements(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAchievementsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("achievements/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<AchievementDto>>> GetActiveAchievements(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveAchievementsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("achievements/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<AchievementDto>> GetAchievementById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAchievementByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("achievements")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<AchievementDto>> CreateAchievement([FromBody] CreateAchievementDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateAchievementCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetAchievementById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("achievements/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<AchievementDto>> UpdateAchievement(Guid id, [FromBody] UpdateAchievementDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateAchievementCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("achievements/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteAchievement(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteAchievementCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }

    #endregion
}
