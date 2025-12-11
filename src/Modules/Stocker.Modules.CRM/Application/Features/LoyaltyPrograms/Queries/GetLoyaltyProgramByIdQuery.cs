using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Queries;

public record GetLoyaltyProgramByIdQuery(Guid Id) : IRequest<Result<LoyaltyProgramDto?>>;
