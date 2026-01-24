using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Opportunities.Commands;

public record CreateOpportunityCommand(CreateOpportunityDto Dto) : IRequest<Result<OpportunityDto>>;

public record UpdateOpportunityStageCommand(Guid Id, UpdateOpportunityStageDto Dto) : IRequest<Result<OpportunityDto>>;

public record UpdateOpportunityValueCommand(Guid Id, UpdateOpportunityValueDto Dto) : IRequest<Result<OpportunityDto>>;

public record MarkOpportunityWonCommand(Guid Id, MarkOpportunityWonDto? Dto = null) : IRequest<Result<OpportunityDto>>;

public record MarkOpportunityLostCommand(Guid Id, MarkOpportunityLostDto Dto) : IRequest<Result<OpportunityDto>>;

public record ReopenOpportunityCommand(Guid Id) : IRequest<Result<OpportunityDto>>;

public record AssignOpportunityCommand(Guid Id, AssignOpportunityDto Dto) : IRequest<Result>;

public record AssignOpportunityToPipelineCommand(Guid Id, Guid PipelineId) : IRequest<Result<OpportunityDto>>;

public record MoveOpportunityPipelineStageCommand(Guid Id, Guid NewStageId) : IRequest<Result<OpportunityDto>>;

public record ScheduleFollowUpCommand(Guid Id, DateTime FollowUpDate) : IRequest<Result>;
