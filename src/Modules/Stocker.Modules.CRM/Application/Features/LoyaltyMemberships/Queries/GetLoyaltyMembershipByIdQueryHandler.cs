using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Queries;

public class GetLoyaltyMembershipByIdQueryHandler : IRequestHandler<GetLoyaltyMembershipByIdQuery, Result<LoyaltyMembershipDto?>>
{
    private readonly ILoyaltyMembershipRepository _repository;

    public GetLoyaltyMembershipByIdQueryHandler(ILoyaltyMembershipRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<LoyaltyMembershipDto?>> Handle(GetLoyaltyMembershipByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<LoyaltyMembershipDto?>.Failure(new Error("LoyaltyMembership.NotFound", "Loyalty membership not found", ErrorType.NotFound));
        }

        var dto = new LoyaltyMembershipDto
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
        };

        return Result<LoyaltyMembershipDto?>.Success(dto);
    }
}
