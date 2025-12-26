using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CreditNotes.Commands;

public record CreateCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public DateTime CreditNoteDate { get; init; } = DateTime.UtcNow;
    public CreditNoteType Type { get; init; } = CreditNoteType.Return;
    public CreditNoteReason Reason { get; init; } = CreditNoteReason.ProductReturn;
    public string? ReasonDescription { get; init; }
    public Guid InvoiceId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public Guid? SalesReturnId { get; init; }
    public string? SalesReturnNumber { get; init; }
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerTaxNumber { get; init; }
    public string? CustomerAddress { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? Notes { get; init; }
    public List<CreateCreditNoteItemCommand> Items { get; init; } = new();
}

public record CreateCreditNoteItemCommand
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? InvoiceItemId { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal UnitPrice { get; init; }
    public decimal TaxRate { get; init; } = 20;
    public decimal DiscountRate { get; init; }
}

public record UpdateCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
    public string? ReasonDescription { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public string? CustomerAddress { get; init; }
    public decimal DiscountAmount { get; init; }
    public string? Notes { get; init; }
}

public record AddCreditNoteItemCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid CreditNoteId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? InvoiceItemId { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal UnitPrice { get; init; }
    public decimal TaxRate { get; init; } = 20;
    public decimal DiscountRate { get; init; }
}

public record RemoveCreditNoteItemCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid CreditNoteId { get; init; }
    public Guid ItemId { get; init; }
}

public record SubmitCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
}

public record ApproveCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
}

public record RejectCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record IssueCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
}

public record ApplyCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
    public decimal Amount { get; init; }
    public Guid? TargetInvoiceId { get; init; }
    public string? Reference { get; init; }
}

public record VoidCreditNoteCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record SetEDocumentCommand : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
    public string EDocumentId { get; init; } = string.Empty;
    public DateTime EDocumentDate { get; init; }
}

public record DeleteCreditNoteCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
