using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesPipelines.Commands;

public record CreateSalesPipelineCommand(CreateSalesPipelineDto Dto) : IRequest<Result<SalesPipelineDto>>;

public record UpdateSalesPipelineCommand(Guid Id, UpdatePipelineDto Dto) : IRequest<Result<SalesPipelineDto>>;

public record AddPipelineStageCommand(Guid PipelineId, AddPipelineStageDto Dto) : IRequest<Result<SalesPipelineDto>>;

public record RemovePipelineStageCommand(Guid PipelineId, Guid StageId) : IRequest<Result>;

public record ReorderPipelineStageCommand(Guid PipelineId, Guid StageId, int NewOrderIndex) : IRequest<Result>;

public record SetDefaultPipelineCommand(Guid Id) : IRequest<Result>;

public record ActivatePipelineCommand(Guid Id) : IRequest<Result>;

public record DeactivatePipelineCommand(Guid Id) : IRequest<Result>;
