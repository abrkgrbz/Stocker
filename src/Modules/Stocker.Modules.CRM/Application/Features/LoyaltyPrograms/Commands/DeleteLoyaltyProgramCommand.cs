using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public record DeleteLoyaltyProgramCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
