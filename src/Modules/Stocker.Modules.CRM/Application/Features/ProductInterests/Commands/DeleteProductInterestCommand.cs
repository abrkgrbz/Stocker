using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public record DeleteProductInterestCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
