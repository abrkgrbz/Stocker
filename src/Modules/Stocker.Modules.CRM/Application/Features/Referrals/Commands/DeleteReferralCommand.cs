using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Commands;

public record DeleteReferralCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
