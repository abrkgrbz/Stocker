using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesReturns.Commands;

public record CreateSalesReturnCommand(CreateSalesReturnDto Dto) : IRequest<Result<SalesReturnDto>>;

public record UpdateSalesReturnCommand(Guid Id, UpdateSalesReturnDto Dto) : IRequest<Result<SalesReturnDto>>;

public record AddSalesReturnItemCommand(Guid ReturnId, CreateSalesReturnItemDto Item) : IRequest<Result<SalesReturnDto>>;

public record RemoveSalesReturnItemCommand(Guid ReturnId, Guid ItemId) : IRequest<Result<SalesReturnDto>>;

public record SubmitSalesReturnCommand(Guid Id) : IRequest<Result<SalesReturnDto>>;

public record ApproveSalesReturnCommand(Guid Id) : IRequest<Result<SalesReturnDto>>;

public record RejectSalesReturnCommand(Guid Id, string Reason) : IRequest<Result<SalesReturnDto>>;

public record ReceiveSalesReturnCommand(Guid Id) : IRequest<Result<SalesReturnDto>>;

public record ProcessRefundCommand(Guid Id, ProcessRefundDto Dto) : IRequest<Result<SalesReturnDto>>;

public record CompleteSalesReturnCommand(Guid Id) : IRequest<Result<SalesReturnDto>>;

public record CancelSalesReturnCommand(Guid Id, string Reason) : IRequest<Result<SalesReturnDto>>;

public record MarkItemAsRestockedCommand(Guid ReturnId, Guid ItemId) : IRequest<Result<SalesReturnDto>>;

public record MarkReturnAsRestockedCommand(Guid Id) : IRequest<Result<SalesReturnDto>>;

public record DeleteSalesReturnCommand(Guid Id) : IRequest<Result>;
