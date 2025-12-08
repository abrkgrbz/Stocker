using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Quotations.Commands;

public record CreateQuotationCommand(CreateQuotationDto Dto) : IRequest<Result<QuotationDto>>;

public record UpdateQuotationCommand(Guid Id, UpdateQuotationDto Dto) : IRequest<Result<QuotationDto>>;

public record AddQuotationItemCommand(Guid QuotationId, CreateQuotationItemDto Item) : IRequest<Result<QuotationDto>>;

public record RemoveQuotationItemCommand(Guid QuotationId, Guid ItemId) : IRequest<Result<QuotationDto>>;

public record UpdateQuotationItemCommand(Guid QuotationId, Guid ItemId, CreateQuotationItemDto Item) : IRequest<Result<QuotationDto>>;

public record SubmitQuotationForApprovalCommand(Guid Id) : IRequest<Result<QuotationDto>>;

public record ApproveQuotationCommand(Guid Id) : IRequest<Result<QuotationDto>>;

public record SendQuotationCommand(Guid Id) : IRequest<Result<QuotationDto>>;

public record AcceptQuotationCommand(Guid Id) : IRequest<Result<QuotationDto>>;

public record RejectQuotationCommand(Guid Id, string Reason) : IRequest<Result<QuotationDto>>;

public record CancelQuotationCommand(Guid Id, string Reason) : IRequest<Result<QuotationDto>>;

public record ConvertQuotationToOrderCommand(Guid Id) : IRequest<Result<Guid>>;

public record CreateQuotationRevisionCommand(Guid Id) : IRequest<Result<QuotationDto>>;

public record DeleteQuotationCommand(Guid Id) : IRequest<Result>;
