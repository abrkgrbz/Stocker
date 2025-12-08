using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Commissions.Commands;

public record CreateCommissionPlanCommand(CreateCommissionPlanDto Dto) : IRequest<Result<CommissionPlanDto>>;

public record UpdateCommissionPlanCommand(Guid Id, UpdateCommissionPlanDto Dto) : IRequest<Result<CommissionPlanDto>>;

public record AddCommissionTierCommand(Guid PlanId, CreateCommissionTierDto Tier) : IRequest<Result<CommissionPlanDto>>;

public record RemoveCommissionTierCommand(Guid PlanId, Guid TierId) : IRequest<Result<CommissionPlanDto>>;

public record ActivateCommissionPlanCommand(Guid Id) : IRequest<Result<CommissionPlanDto>>;

public record DeactivateCommissionPlanCommand(Guid Id) : IRequest<Result<CommissionPlanDto>>;

public record DeleteCommissionPlanCommand(Guid Id) : IRequest<Result>;

public record CalculateSalesCommissionCommand(CalculateCommissionDto Dto) : IRequest<Result<SalesCommissionDto>>;

public record ApproveSalesCommissionCommand(Guid Id) : IRequest<Result<SalesCommissionDto>>;

public record RejectSalesCommissionCommand(Guid Id, string Reason) : IRequest<Result<SalesCommissionDto>>;

public record MarkCommissionAsPaidCommand(Guid Id, string PaymentReference) : IRequest<Result<SalesCommissionDto>>;

public record CancelSalesCommissionCommand(Guid Id, string Reason) : IRequest<Result<SalesCommissionDto>>;

public record BulkApproveCommissionsCommand(List<Guid> Ids) : IRequest<Result<int>>;

public record BulkMarkCommissionsAsPaidCommand(List<Guid> Ids, string PaymentReference) : IRequest<Result<int>>;
