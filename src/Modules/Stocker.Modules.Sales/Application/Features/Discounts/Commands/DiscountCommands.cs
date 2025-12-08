using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Discounts.Commands;

public record CreateDiscountCommand(CreateDiscountDto Dto) : IRequest<Result<DiscountDto>>;

public record UpdateDiscountCommand(Guid Id, UpdateDiscountDto Dto) : IRequest<Result<DiscountDto>>;

public record ActivateDiscountCommand(Guid Id) : IRequest<Result<DiscountDto>>;

public record DeactivateDiscountCommand(Guid Id) : IRequest<Result<DiscountDto>>;

public record DeleteDiscountCommand(Guid Id) : IRequest<Result>;

public record ValidateDiscountCodeCommand(string Code, decimal OrderAmount, int Quantity = 1) : IRequest<Result<DiscountCalculationResultDto>>;
