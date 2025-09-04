using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealByIdQuery : IRequest<DealDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}