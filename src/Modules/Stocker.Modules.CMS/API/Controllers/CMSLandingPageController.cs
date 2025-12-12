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
    public async Task<ActionResult<ApiResponse<IEnumerable<TestimonialDto>>>> GetAllTestimonials(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTestimonialsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<TestimonialDto>>.SuccessResponse(result));
    }

    [HttpGet("testimonials/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<TestimonialDto>>>> GetActiveTestimonials(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveTestimonialsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<TestimonialDto>>.SuccessResponse(result));
    }

    [HttpGet("testimonials/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<TestimonialDto>>>> GetFeaturedTestimonials(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturedTestimonialsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<TestimonialDto>>.SuccessResponse(result));
    }

    [HttpGet("testimonials/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<TestimonialDto>>> GetTestimonialById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTestimonialByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<TestimonialDto>.FailureResponse("Testimonial not found"));
        return Ok(ApiResponse<TestimonialDto>.SuccessResponse(result));
    }

    [HttpPost("testimonials")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<TestimonialDto>>> CreateTestimonial([FromBody] CreateTestimonialDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateTestimonialCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<TestimonialDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetTestimonialById), new { id = result.Value.Id }, ApiResponse<TestimonialDto>.SuccessResponse(result.Value));
    }

    [HttpPut("testimonials/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<TestimonialDto>>> UpdateTestimonial(Guid id, [FromBody] UpdateTestimonialDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateTestimonialCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<TestimonialDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<TestimonialDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<TestimonialDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("testimonials/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTestimonial(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteTestimonialCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Pricing Plans

    [HttpGet("pricing-plans")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PricingPlanDto>>>> GetAllPricingPlans(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingPlansQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<PricingPlanDto>>.SuccessResponse(result));
    }

    [HttpGet("pricing-plans/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<PricingPlanDto>>>> GetActivePricingPlans(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActivePricingPlansQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<PricingPlanDto>>.SuccessResponse(result));
    }

    [HttpGet("pricing-plans/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PricingPlanDto>>> GetPricingPlanById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingPlanByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<PricingPlanDto>.FailureResponse("Pricing plan not found"));
        return Ok(ApiResponse<PricingPlanDto>.SuccessResponse(result));
    }

    [HttpGet("pricing-plans/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PricingPlanDto>>> GetPricingPlanBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingPlanBySlugQuery { Slug = slug }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<PricingPlanDto>.FailureResponse("Pricing plan not found"));
        return Ok(ApiResponse<PricingPlanDto>.SuccessResponse(result));
    }

    [HttpPost("pricing-plans")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PricingPlanDto>>> CreatePricingPlan([FromBody] CreatePricingPlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePricingPlanCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<PricingPlanDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetPricingPlanById), new { id = result.Value.Id }, ApiResponse<PricingPlanDto>.SuccessResponse(result.Value));
    }

    [HttpPut("pricing-plans/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PricingPlanDto>>> UpdatePricingPlan(Guid id, [FromBody] UpdatePricingPlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePricingPlanCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<PricingPlanDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<PricingPlanDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<PricingPlanDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("pricing-plans/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePricingPlan(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeletePricingPlanCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Pricing Features

    [HttpGet("pricing-plans/{planId:guid}/features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PricingFeatureDto>>>> GetPricingFeaturesByPlan(Guid planId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingFeaturesByPlanQuery { PlanId = planId }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<PricingFeatureDto>>.SuccessResponse(result));
    }

    [HttpGet("pricing-features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PricingFeatureDto>>> GetPricingFeatureById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPricingFeatureByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<PricingFeatureDto>.FailureResponse("Pricing feature not found"));
        return Ok(ApiResponse<PricingFeatureDto>.SuccessResponse(result));
    }

    [HttpPost("pricing-features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PricingFeatureDto>>> CreatePricingFeature([FromBody] CreatePricingFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePricingFeatureCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<PricingFeatureDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetPricingFeatureById), new { id = result.Value.Id }, ApiResponse<PricingFeatureDto>.SuccessResponse(result.Value));
    }

    [HttpPut("pricing-features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PricingFeatureDto>>> UpdatePricingFeature(Guid id, [FromBody] UpdatePricingFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePricingFeatureCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<PricingFeatureDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<PricingFeatureDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<PricingFeatureDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("pricing-features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePricingFeature(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeletePricingFeatureCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Features

    [HttpGet("features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<FeatureDto>>>> GetAllFeatures(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<FeatureDto>>.SuccessResponse(result));
    }

    [HttpGet("features/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<FeatureDto>>>> GetActiveFeatures(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveFeaturesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<FeatureDto>>.SuccessResponse(result));
    }

    [HttpGet("features/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<FeatureDto>>>> GetFeaturedFeatures(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturedFeaturesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<FeatureDto>>.SuccessResponse(result));
    }

    [HttpGet("features/category/{category}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<FeatureDto>>>> GetFeaturesByCategory(string category, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturesByCategoryQuery { Category = category }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<FeatureDto>>.SuccessResponse(result));
    }

    [HttpGet("features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FeatureDto>>> GetFeatureById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeatureByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<FeatureDto>.FailureResponse("Feature not found"));
        return Ok(ApiResponse<FeatureDto>.SuccessResponse(result));
    }

    [HttpPost("features")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FeatureDto>>> CreateFeature([FromBody] CreateFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateFeatureCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<FeatureDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetFeatureById), new { id = result.Value.Id }, ApiResponse<FeatureDto>.SuccessResponse(result.Value));
    }

    [HttpPut("features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FeatureDto>>> UpdateFeature(Guid id, [FromBody] UpdateFeatureDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateFeatureCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<FeatureDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<FeatureDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<FeatureDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("features/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteFeature(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteFeatureCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Industries

    [HttpGet("industries")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<IndustryDto>>>> GetAllIndustries(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIndustriesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<IndustryDto>>.SuccessResponse(result));
    }

    [HttpGet("industries/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<IndustryDto>>>> GetActiveIndustries(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveIndustriesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<IndustryDto>>.SuccessResponse(result));
    }

    [HttpGet("industries/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IndustryDto>>> GetIndustryById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIndustryByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<IndustryDto>.FailureResponse("Industry not found"));
        return Ok(ApiResponse<IndustryDto>.SuccessResponse(result));
    }

    [HttpGet("industries/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IndustryDto>>> GetIndustryBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIndustryBySlugQuery { Slug = slug }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<IndustryDto>.FailureResponse("Industry not found"));
        return Ok(ApiResponse<IndustryDto>.SuccessResponse(result));
    }

    [HttpPost("industries")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IndustryDto>>> CreateIndustry([FromBody] CreateIndustryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateIndustryCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<IndustryDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetIndustryById), new { id = result.Value.Id }, ApiResponse<IndustryDto>.SuccessResponse(result.Value));
    }

    [HttpPut("industries/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IndustryDto>>> UpdateIndustry(Guid id, [FromBody] UpdateIndustryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateIndustryCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<IndustryDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<IndustryDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<IndustryDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("industries/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteIndustry(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteIndustryCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Integrations

    [HttpGet("integrations")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<IntegrationDto>>>> GetAllIntegrations(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<IntegrationDto>>.SuccessResponse(result));
    }

    [HttpGet("integrations/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<IntegrationDto>>>> GetActiveIntegrations(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveIntegrationsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<IntegrationDto>>.SuccessResponse(result));
    }

    [HttpGet("integrations/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IntegrationDto>>> GetIntegrationById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<IntegrationDto>.FailureResponse("Integration not found"));
        return Ok(ApiResponse<IntegrationDto>.SuccessResponse(result));
    }

    [HttpGet("integrations/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IntegrationDto>>> GetIntegrationBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationBySlugQuery { Slug = slug }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<IntegrationDto>.FailureResponse("Integration not found"));
        return Ok(ApiResponse<IntegrationDto>.SuccessResponse(result));
    }

    [HttpPost("integrations")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IntegrationDto>>> CreateIntegration([FromBody] CreateIntegrationDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateIntegrationCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<IntegrationDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetIntegrationById), new { id = result.Value.Id }, ApiResponse<IntegrationDto>.SuccessResponse(result.Value));
    }

    [HttpPut("integrations/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IntegrationDto>>> UpdateIntegration(Guid id, [FromBody] UpdateIntegrationDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateIntegrationCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<IntegrationDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<IntegrationDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<IntegrationDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("integrations/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteIntegration(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteIntegrationCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Integration Items

    [HttpGet("integrations/{integrationId:guid}/items")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<IntegrationItemDto>>>> GetIntegrationItemsByIntegration(Guid integrationId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationItemsByIntegrationQuery { IntegrationId = integrationId }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<IntegrationItemDto>>.SuccessResponse(result));
    }

    [HttpGet("integration-items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IntegrationItemDto>>> GetIntegrationItemById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetIntegrationItemByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<IntegrationItemDto>.FailureResponse("Integration item not found"));
        return Ok(ApiResponse<IntegrationItemDto>.SuccessResponse(result));
    }

    [HttpPost("integration-items")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IntegrationItemDto>>> CreateIntegrationItem([FromBody] CreateIntegrationItemDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateIntegrationItemCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<IntegrationItemDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetIntegrationItemById), new { id = result.Value.Id }, ApiResponse<IntegrationItemDto>.SuccessResponse(result.Value));
    }

    [HttpPut("integration-items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IntegrationItemDto>>> UpdateIntegrationItem(Guid id, [FromBody] UpdateIntegrationItemDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateIntegrationItemCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<IntegrationItemDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<IntegrationItemDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<IntegrationItemDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("integration-items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteIntegrationItem(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteIntegrationItemCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Stats

    [HttpGet("stats")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<StatDto>>>> GetAllStats(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStatsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<StatDto>>.SuccessResponse(result));
    }

    [HttpGet("stats/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<StatDto>>>> GetActiveStats(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveStatsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<StatDto>>.SuccessResponse(result));
    }

    [HttpGet("stats/section/{section}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<StatDto>>>> GetStatsBySection(string section, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStatsBySectionQuery { Section = section }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<StatDto>>.SuccessResponse(result));
    }

    [HttpGet("stats/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<StatDto>>> GetStatById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStatByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<StatDto>.FailureResponse("Stat not found"));
        return Ok(ApiResponse<StatDto>.SuccessResponse(result));
    }

    [HttpPost("stats")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<StatDto>>> CreateStat([FromBody] CreateStatDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateStatCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<StatDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetStatById), new { id = result.Value.Id }, ApiResponse<StatDto>.SuccessResponse(result.Value));
    }

    [HttpPut("stats/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<StatDto>>> UpdateStat(Guid id, [FromBody] UpdateStatDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateStatCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<StatDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<StatDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<StatDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("stats/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteStat(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteStatCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Partners

    [HttpGet("partners")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PartnerDto>>>> GetAllPartners(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPartnersQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<PartnerDto>>.SuccessResponse(result));
    }

    [HttpGet("partners/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<PartnerDto>>>> GetActivePartners(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActivePartnersQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<PartnerDto>>.SuccessResponse(result));
    }

    [HttpGet("partners/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<PartnerDto>>>> GetFeaturedPartners(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetFeaturedPartnersQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<PartnerDto>>.SuccessResponse(result));
    }

    [HttpGet("partners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PartnerDto>>> GetPartnerById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPartnerByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<PartnerDto>.FailureResponse("Partner not found"));
        return Ok(ApiResponse<PartnerDto>.SuccessResponse(result));
    }

    [HttpPost("partners")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PartnerDto>>> CreatePartner([FromBody] CreatePartnerDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePartnerCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<PartnerDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetPartnerById), new { id = result.Value.Id }, ApiResponse<PartnerDto>.SuccessResponse(result.Value));
    }

    [HttpPut("partners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PartnerDto>>> UpdatePartner(Guid id, [FromBody] UpdatePartnerDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePartnerCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<PartnerDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<PartnerDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<PartnerDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("partners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePartner(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeletePartnerCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Achievements

    [HttpGet("achievements")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AchievementDto>>>> GetAllAchievements(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAchievementsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<AchievementDto>>.SuccessResponse(result));
    }

    [HttpGet("achievements/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<AchievementDto>>>> GetActiveAchievements(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveAchievementsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<AchievementDto>>.SuccessResponse(result));
    }

    [HttpGet("achievements/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<AchievementDto>>> GetAchievementById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAchievementByIdQuery { Id = id }, cancellationToken);
        if (result == null) return NotFound(ApiResponse<AchievementDto>.FailureResponse("Achievement not found"));
        return Ok(ApiResponse<AchievementDto>.SuccessResponse(result));
    }

    [HttpPost("achievements")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<AchievementDto>>> CreateAchievement([FromBody] CreateAchievementDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateAchievementCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<AchievementDto>.FailureResponse(result.Error.Message));
        return CreatedAtAction(nameof(GetAchievementById), new { id = result.Value.Id }, ApiResponse<AchievementDto>.SuccessResponse(result.Value));
    }

    [HttpPut("achievements/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<AchievementDto>>> UpdateAchievement(Guid id, [FromBody] UpdateAchievementDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateAchievementCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<AchievementDto>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<AchievementDto>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<AchievementDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("achievements/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAchievement(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteAchievementCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return result.Error.Code.Contains("NotFound") ? NotFound(ApiResponse<bool>.FailureResponse(result.Error.Message)) : BadRequest(ApiResponse<bool>.FailureResponse(result.Error.Message));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion
}
