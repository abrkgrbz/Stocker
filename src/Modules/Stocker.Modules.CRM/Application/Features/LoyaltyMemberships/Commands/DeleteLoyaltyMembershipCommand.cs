using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public record DeleteLoyaltyMembershipCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
