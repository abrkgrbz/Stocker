using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Application.Features.CompanyPage.Commands;
using Stocker.Modules.CMS.Application.Features.CompanyPage.Queries;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/company")]
public class CMSCompanyPageController : ControllerBase
{
    private readonly IMediator _mediator;

    public CMSCompanyPageController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Team Members

    [HttpGet("team-members")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetAllTeamMembers(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetTeamMembersQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("team-members/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetActiveTeamMembers(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveTeamMembersQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("team-members/leadership")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetLeadershipTeamMembers(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetLeadershipTeamMembersQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("team-members/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<TeamMemberDto>> GetTeamMemberById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetTeamMemberByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("team-members")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<TeamMemberDto>> CreateTeamMember([FromBody] CreateTeamMemberDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateTeamMemberCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetTeamMemberById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("team-members/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<TeamMemberDto>> UpdateTeamMember(Guid id, [FromBody] UpdateTeamMemberDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateTeamMemberCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "TeamMember.NotFound") return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    [HttpDelete("team-members/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteTeamMember(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteTeamMemberCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(result.Error);
        return NoContent();
    }

    #endregion

    #region Company Values

    [HttpGet("values")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<CompanyValueDto>>> GetAllCompanyValues(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetCompanyValuesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("values/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<CompanyValueDto>>> GetActiveCompanyValues(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveCompanyValuesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("values/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<CompanyValueDto>> GetCompanyValueById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetCompanyValueByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("values")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<CompanyValueDto>> CreateCompanyValue([FromBody] CreateCompanyValueDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateCompanyValueCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetCompanyValueById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("values/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<CompanyValueDto>> UpdateCompanyValue(Guid id, [FromBody] UpdateCompanyValueDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateCompanyValueCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "CompanyValue.NotFound") return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    [HttpDelete("values/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteCompanyValue(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteCompanyValueCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(result.Error);
        return NoContent();
    }

    #endregion

    #region Contact Info

    [HttpGet("contact-info")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<ContactInfoDto>>> GetAllContactInfo(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetContactInfoQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("contact-info/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ContactInfoDto>>> GetActiveContactInfo(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveContactInfoQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("contact-info/type/{type}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ContactInfoDto>>> GetContactInfoByType(string type, CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetContactInfoByTypeQuery { Type = type }, cancellationToken);
        return Ok(items);
    }

    [HttpGet("contact-info/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ContactInfoDto>> GetContactInfoById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetContactInfoByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("contact-info")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ContactInfoDto>> CreateContactInfo([FromBody] CreateContactInfoDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateContactInfoCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetContactInfoById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("contact-info/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ContactInfoDto>> UpdateContactInfo(Guid id, [FromBody] UpdateContactInfoDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateContactInfoCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "ContactInfo.NotFound") return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    [HttpDelete("contact-info/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteContactInfo(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteContactInfoCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(result.Error);
        return NoContent();
    }

    #endregion

    #region Social Links

    [HttpGet("social-links")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<SocialLinkDto>>> GetAllSocialLinks(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetSocialLinksQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("social-links/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<SocialLinkDto>>> GetActiveSocialLinks(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveSocialLinksQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("social-links/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<SocialLinkDto>> GetSocialLinkById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetSocialLinkByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("social-links")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<SocialLinkDto>> CreateSocialLink([FromBody] CreateSocialLinkDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateSocialLinkCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetSocialLinkById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("social-links/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<SocialLinkDto>> UpdateSocialLink(Guid id, [FromBody] UpdateSocialLinkDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateSocialLinkCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "SocialLink.NotFound") return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    [HttpDelete("social-links/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteSocialLink(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteSocialLinkCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(result.Error);
        return NoContent();
    }

    #endregion
}
