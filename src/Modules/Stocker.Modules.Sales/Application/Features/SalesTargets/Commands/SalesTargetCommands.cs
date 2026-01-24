using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTargets.Commands;

public record CreateSalesTargetCommand(CreateSalesTargetDto Dto) : IRequest<Result<SalesTargetDto>>;

public record AssignTargetToRepresentativeCommand(Guid Id, AssignSalesTargetDto Dto) : IRequest<Result>;

public record AssignTargetToTeamCommand(Guid Id, AssignSalesTargetDto Dto) : IRequest<Result>;

public record AssignTargetToTerritoryCommand(Guid Id, AssignSalesTargetDto Dto) : IRequest<Result>;

public record AddTargetPeriodCommand(Guid Id, AddSalesTargetPeriodDto Dto) : IRequest<Result<SalesTargetDto>>;

public record GenerateTargetPeriodsCommand(Guid Id) : IRequest<Result<SalesTargetDto>>;

public record AddTargetProductCommand(Guid Id, AddSalesTargetProductDto Dto) : IRequest<Result<SalesTargetDto>>;

public record RecordAchievementCommand(Guid Id, RecordAchievementDto Dto) : IRequest<Result<SalesTargetDto>>;

public record ActivateSalesTargetCommand(Guid Id) : IRequest<Result>;

public record CloseSalesTargetCommand(Guid Id) : IRequest<Result>;

public record CancelSalesTargetCommand(Guid Id, string Reason) : IRequest<Result>;
