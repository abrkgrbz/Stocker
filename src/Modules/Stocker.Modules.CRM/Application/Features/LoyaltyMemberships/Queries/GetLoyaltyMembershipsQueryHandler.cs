using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Queries;

public class GetLoyaltyMembershipsQueryHandler : IRequestHandler<GetLoyaltyMembershipsQuery, Result<List<LoyaltyMembershipDto>>>
{
    private readonly ILoyaltyMembershipRepository _repository;

    public GetLoyaltyMembershipsQueryHandler(ILoyaltyMembershipRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<List<LoyaltyMembershipDto>>> Handle(GetLoyaltyMembershipsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(
            request.LoyaltyProgramId,
            request.CustomerId,
            request.IsActive,
            request.Skip,
            request.Take,
            cancellationToken);

        var dtos = entities.Select(entity => new LoyaltyMembershipDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            LoyaltyProgramId = entity.LoyaltyProgramId,
            CustomerId = entity.CustomerId,
            MembershipNumber = entity.MembershipNumber,
            CurrentTierId = entity.CurrentTierId,
            TotalPointsEarned = entity.TotalPointsEarned,
            TotalPointsRedeemed = entity.TotalPointsRedeemed,
            CurrentPoints = entity.CurrentPoints,
            LifetimePoints = entity.LifetimePoints,
            EnrollmentDate = entity.EnrollmentDate,
            LastActivityDate = entity.LastActivityDate,
            PointsExpiryDate = entity.PointsExpiryDate,
            IsActive = entity.IsActive,
            Transactions = entity.Transactions.Select(t => new LoyaltyTransactionDto
            {
                Id = t.Id,
                LoyaltyMembershipId = t.LoyaltyMembershipId,
                TransactionType = t.TransactionType,
                Points = t.Points,
                BalanceAfter = t.BalanceAfter,
                Description = t.Description,
                ReferenceNumber = t.ReferenceNumber,
                TransactionDate = t.TransactionDate,
                OrderId = t.OrderId,
                RewardId = t.RewardId
            }).ToList()
        }).ToList();

        return Result<List<LoyaltyMembershipDto>>.Success(dtos);
    }
}
