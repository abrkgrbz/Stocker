using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.InventoryReservations.Commands;

public record CreateReservationCommand(CreateReservationDto Dto) : IRequest<Result<InventoryReservationDto>>;

public record AllocateReservationCommand(Guid Id, AllocateReservationDto Dto) : IRequest<Result<InventoryReservationDto>>;

public record ReleaseReservationCommand(Guid Id, ReleaseReservationDto? Dto = null) : IRequest<Result>;

public record PartialReleaseReservationCommand(Guid Id, decimal Quantity, string? Reason = null) : IRequest<Result<InventoryReservationDto>>;

public record ExtendReservationCommand(Guid Id, ExtendReservationDto Dto) : IRequest<Result<InventoryReservationDto>>;

public record FulfillReservationCommand(Guid Id) : IRequest<Result<InventoryReservationDto>>;

public record ExpireReservationCommand(Guid Id) : IRequest<Result>;

public record ExpireAllOverdueReservationsCommand() : IRequest<Result<int>>;
