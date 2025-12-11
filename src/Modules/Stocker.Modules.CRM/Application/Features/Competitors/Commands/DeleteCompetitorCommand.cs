using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands;

public record DeleteCompetitorCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
