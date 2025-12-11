using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public record CreateLoyaltyMembershipCommand(
    Guid TenantId,
    Guid LoyaltyProgramId,
    Guid CustomerId,
    string MembershipNumber,
    Guid? CurrentTierId = null,
    int InitialPoints = 0,
    bool IsActive = true
) : IRequest<Result<Guid>>;
