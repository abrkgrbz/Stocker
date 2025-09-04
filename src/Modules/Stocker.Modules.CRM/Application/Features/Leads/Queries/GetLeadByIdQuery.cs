using MediatR;
using Stocker.Modules.CRM.Application.DTOs;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadByIdQuery : IRequest<LeadDto?>
{
    public Guid Id { get; set; }
}