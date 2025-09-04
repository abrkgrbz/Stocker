using MediatR;
using Stocker.Modules.CRM.Application.DTOs;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class UpdateLeadScoreCommand : IRequest<LeadDto>
{
    public Guid Id { get; set; }
    public int Score { get; set; }
    public string? Reason { get; set; }
}