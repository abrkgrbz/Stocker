using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Tenant.Departments;
using Stocker.Application.Features.Tenant.Departments.Commands.CreateDepartment;
using Stocker.Application.Features.Tenant.Departments.Commands.DeleteDepartment;
using Stocker.Application.Features.Tenant.Departments.Commands.UpdateDepartment;
using Stocker.Application.Features.Tenant.Departments.Queries.GetAllDepartments;

namespace Stocker.API.Controllers.Tenant;

[ApiController]
[Route("api/tenant/[controller]")]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly IMediator _mediator;

    public DepartmentController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all departments for current tenant
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllDepartmentsQuery(), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Departmanlar başarıyla getirildi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Create a new department
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "FirmaYöneticisi,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateDepartmentCommand(dto), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Departman başarıyla oluşturuldu"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Update an existing department
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "FirmaYöneticisi,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateDepartmentCommand(id, dto), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Departman başarıyla güncellendi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Delete a department (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "FirmaYöneticisi,Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDepartmentCommand(id), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Departman başarıyla silindi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }
}
