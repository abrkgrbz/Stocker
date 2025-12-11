using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Queries;

public record GetLoyaltyMembershipByIdQuery(Guid Id) : IRequest<Result<LoyaltyMembershipDto?>>;
