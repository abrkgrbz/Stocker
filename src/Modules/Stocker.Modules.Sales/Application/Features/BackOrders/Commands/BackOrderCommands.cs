using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.BackOrders.Commands;

public record CreateBackOrderCommand(CreateBackOrderDto Dto) : IRequest<Result<BackOrderDto>>;

public record FulfillBackOrderItemCommand(Guid BackOrderId, FulfillBackOrderItemDto Dto) : IRequest<Result<BackOrderDto>>;

public record FullFulfillBackOrderCommand(Guid Id) : IRequest<Result<BackOrderDto>>;

public record CancelBackOrderCommand(Guid Id, string Reason) : IRequest<Result>;

public record SetBackOrderPriorityCommand(Guid Id, string Priority) : IRequest<Result>;

public record StartProcessingBackOrderCommand(Guid Id) : IRequest<Result<BackOrderDto>>;

public record MarkBackOrderReadyCommand(Guid Id) : IRequest<Result<BackOrderDto>>;

public record SetEstimatedRestockDateCommand(Guid Id, DateTime? EstimatedDate) : IRequest<Result>;

public record NotifyBackOrderCustomerCommand(Guid Id) : IRequest<Result>;
