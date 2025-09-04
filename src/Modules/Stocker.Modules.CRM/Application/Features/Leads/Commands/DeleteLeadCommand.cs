using MediatR;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class DeleteLeadCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}