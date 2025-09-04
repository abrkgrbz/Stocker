using MediatR;
using Stocker.Modules.CRM.Application.DTOs;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadStatisticsQuery : IRequest<LeadStatisticsDto>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}