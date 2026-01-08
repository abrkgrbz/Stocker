using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.Suppliers.Commands;

public record CreateSupplierCommand(CreateSupplierDto Dto) : IRequest<Result<SupplierDto>>;

public record UpdateSupplierCommand(Guid Id, UpdateSupplierDto Dto) : IRequest<Result<SupplierDto>>;

public record ActivateSupplierCommand(Guid Id) : IRequest<Result<SupplierDto>>;

public record DeactivateSupplierCommand(Guid Id) : IRequest<Result<SupplierDto>>;

public record BlacklistSupplierCommand(Guid Id, string Reason) : IRequest<Result<SupplierDto>>;

public record AddSupplierContactCommand(Guid SupplierId, CreateSupplierContactDto Contact) : IRequest<Result<SupplierDto>>;

public record RemoveSupplierContactCommand(Guid SupplierId, Guid ContactId) : IRequest<Result<SupplierDto>>;

public record AddSupplierProductCommand(Guid SupplierId, CreateSupplierProductDto Product) : IRequest<Result<SupplierDto>>;

public record UpdateSupplierProductCommand(Guid SupplierId, Guid ProductId, UpdateSupplierProductDto Dto) : IRequest<Result<SupplierDto>>;

public record RemoveSupplierProductCommand(Guid SupplierId, Guid ProductId) : IRequest<Result<SupplierDto>>;

public record UpdateSupplierBalanceCommand(Guid Id, decimal Amount) : IRequest<Result<SupplierDto>>;

public record SetSupplierRatingCommand(Guid Id, int Rating) : IRequest<Result<SupplierDto>>;

public record DeleteSupplierCommand(Guid Id) : IRequest<Result>;
