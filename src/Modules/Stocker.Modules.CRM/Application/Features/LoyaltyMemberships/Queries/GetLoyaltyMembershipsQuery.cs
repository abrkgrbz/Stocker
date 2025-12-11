using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Queries;

public record GetLoyaltyMembershipsQuery(
    Guid? LoyaltyProgramId = null,
    Guid? CustomerId = null,
    Guid? CurrentTierId = null,
    bool? IsActive = null,
    int Skip = 0,
    int Take = 100
) : IRequest<Result<List<LoyaltyMembershipDto>>>;
