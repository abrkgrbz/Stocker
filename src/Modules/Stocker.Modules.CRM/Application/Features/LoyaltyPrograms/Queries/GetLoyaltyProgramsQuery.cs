using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Queries;

public record GetLoyaltyProgramsQuery(
    LoyaltyProgramType? ProgramType = null,
    bool? IsActive = null,
    int Skip = 0,
    int Take = 100
) : IRequest<Result<List<LoyaltyProgramDto>>>;
