using MediatR;
using Stocker.Application.DTOs.Tenant.Modules;

namespace Stocker.Application.Features.Tenant.Modules.Queries;

public class GetModulesQuery : IRequest<List<ModuleDto>>
{
    public Guid TenantId { get; set; }
    public bool? IsEnabled { get; set; }
}