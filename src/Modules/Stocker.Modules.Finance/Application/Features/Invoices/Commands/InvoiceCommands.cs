using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.Invoices.Commands;

/// <summary>
/// Command to create a new invoice
/// </summary>
public class CreateInvoiceCommand : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateInvoiceDto Data { get; set; } = null!;
    public InvoiceType InvoiceType { get; set; }
}

/// <summary>
/// Handler for CreateInvoiceCommand
/// </summary>
public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Get current account
        var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId, cancellationToken);
        if (currentAccount == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadı"));
        }

        // Get next sequence number
        var sequenceNumber = await _unitOfWork.Invoices.GetNextSequenceNumberAsync(request.Data.Series, cancellationToken);
        var invoiceNumber = $"{request.Data.Series}{DateTime.Now.Year}{sequenceNumber:D9}";

        // Create invoice
        var invoice = new Invoice(
            invoiceNumber,
            request.Data.Series,
            sequenceNumber,
            request.Data.InvoiceDate,
            request.InvoiceType,
            request.Data.EInvoiceType,
            request.Data.Scenario,
            currentAccount.Id,
            currentAccount.Name,
            request.Data.Currency);

        // Set exchange rate if provided
        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value > 0)
        {
            invoice.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Set tax info from current account
        invoice.SetTaxInfo(currentAccount.TaxNumber, currentAccount.IdentityNumber, currentAccount.TaxOffice);

        // Set billing address (override or from current account)
        invoice.SetBillingAddress(
            request.Data.BillingAddress ?? currentAccount.Address,
            request.Data.BillingDistrict ?? currentAccount.District,
            request.Data.BillingCity ?? currentAccount.City,
            request.Data.BillingCountry ?? currentAccount.Country,
            request.Data.BillingPostalCode ?? currentAccount.PostalCode);

        // Set delivery address if provided
        if (!string.IsNullOrEmpty(request.Data.DeliveryAddress))
        {
            invoice.SetDeliveryAddress(
                request.Data.DeliveryAddress,
                request.Data.DeliveryDistrict,
                request.Data.DeliveryCity,
                request.Data.DeliveryCountry);
        }

        // Set payment info
        invoice.SetPaymentInfo(
            request.Data.DueDate,
            request.Data.PaymentMethod,
            request.Data.PaymentTerms,
            request.Data.PaymentNote);

        // Set withholding if applicable
        if (request.Data.ApplyVatWithholding)
        {
            invoice.SetVatWithholding(
                true,
                request.Data.VatWithholdingRate,
                request.Data.WithholdingCode,
                request.Data.WithholdingReason);
        }

        // Set VAT exemption if applicable
        if (request.Data.HasVatExemption)
        {
            invoice.SetVatExemption(
                true,
                request.Data.VatExemptionReason,
                request.Data.VatExemptionDescription);
        }

        // Set reference information
        invoice.SetWaybillInfo(request.Data.WaybillNumber, request.Data.WaybillDate);
        invoice.SetOrderInfo(request.Data.OrderNumber, request.Data.OrderDate);

        if (request.Data.RelatedInvoiceId.HasValue)
        {
            var relatedInvoice = await _unitOfWork.Invoices.GetByIdAsync(request.Data.RelatedInvoiceId.Value, cancellationToken);
            invoice.SetRelatedInvoice(request.Data.RelatedInvoiceId, relatedInvoice?.InvoiceNumber);
        }

        // Set notes
        invoice.SetNotes(request.Data.Notes, request.Data.InternalNotes);

        // Add invoice lines
        var lineNumber = 1;
        foreach (var lineDto in request.Data.Lines)
        {
            var line = new InvoiceLine(
                0, // Will be set by EF
                lineNumber++,
                lineDto.ProductName,
                lineDto.Quantity,
                lineDto.Unit ?? "ADET",
                Money.Create(lineDto.UnitPrice, request.Data.Currency),
                lineDto.VatRate,
                request.Data.Currency);

            if (lineDto.ProductId.HasValue)
            {
                line.SetProductInfo(lineDto.ProductId, lineDto.ProductCode, null, null, null);
            }

            if (!string.IsNullOrEmpty(lineDto.Description))
            {
                line.SetDescription(lineDto.ProductName, lineDto.Description);
            }

            if (lineDto.DiscountRate > 0)
            {
                line.SetDiscount(lineDto.DiscountRate);
            }

            if (lineDto.ApplyWithholding)
            {
                line.SetWithholding(true, lineDto.WithholdingRate, null);
            }

            invoice.AddLine(line);
        }

        // Save invoice
        await _unitOfWork.Invoices.AddAsync(invoice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }

    internal static InvoiceDto MapToDto(Invoice invoice)
    {
        return new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            Series = invoice.Series,
            SequenceNumber = invoice.SequenceNumber,
            InvoiceDate = invoice.InvoiceDate,
            IssueTime = invoice.IssueTime,
            InvoiceType = invoice.InvoiceType,
            EInvoiceType = invoice.EInvoiceType,
            Scenario = invoice.Scenario,
            Status = invoice.Status,
            Currency = invoice.Currency,
            ExchangeRate = invoice.ExchangeRate,
            CurrentAccountId = invoice.CurrentAccountId,
            CurrentAccountName = invoice.CurrentAccountName,
            TaxNumber = invoice.TaxNumber,
            IdentityNumber = invoice.IdentityNumber,
            TaxOffice = invoice.TaxOffice,
            BillingAddress = invoice.BillingAddress,
            BillingDistrict = invoice.BillingDistrict,
            BillingCity = invoice.BillingCity,
            BillingCountry = invoice.BillingCountry,
            BillingPostalCode = invoice.BillingPostalCode,
            LineExtensionAmount = invoice.LineExtensionAmount.Amount,
            GrossAmount = invoice.GrossAmount.Amount,
            TotalDiscount = invoice.TotalDiscount.Amount,
            NetAmountBeforeTax = invoice.NetAmountBeforeTax.Amount,
            TotalVat = invoice.TotalVat.Amount,
            VatWithholdingAmount = invoice.VatWithholdingAmount.Amount,
            TotalOtherTaxes = invoice.TotalOtherTaxes.Amount,
            WithholdingTaxAmount = invoice.WithholdingTaxAmount.Amount,
            GrandTotal = invoice.GrandTotal.Amount,
            GrandTotalTRY = invoice.GrandTotalTRY.Amount,
            PaidAmount = invoice.PaidAmount.Amount,
            RemainingAmount = invoice.RemainingAmount.Amount,
            DueDate = invoice.DueDate,
            PaymentMethod = invoice.PaymentMethod,
            PaymentTerms = invoice.PaymentTerms,
            PaymentNote = invoice.PaymentNote,
            GibUuid = invoice.GibUuid,
            GibEnvelopeId = invoice.GibEnvelopeId,
            GibStatusCode = invoice.GibStatusCode,
            GibStatusDescription = invoice.GibStatusDescription,
            GibSendDate = invoice.GibSendDate,
            GibResponseDate = invoice.GibResponseDate,
            ReceiverAlias = invoice.ReceiverAlias,
            ApplyVatWithholding = invoice.ApplyVatWithholding,
            VatWithholdingRate = invoice.VatWithholdingRate,
            WithholdingCode = invoice.WithholdingCode,
            WithholdingReason = invoice.WithholdingReason,
            HasVatExemption = invoice.HasVatExemption,
            VatExemptionReason = invoice.VatExemptionReason,
            VatExemptionDescription = invoice.VatExemptionDescription,
            WaybillNumber = invoice.WaybillNumber,
            WaybillDate = invoice.WaybillDate,
            OrderNumber = invoice.OrderNumber,
            OrderDate = invoice.OrderDate,
            RelatedInvoiceId = invoice.RelatedInvoiceId,
            RelatedInvoiceNumber = invoice.RelatedInvoiceNumber,
            SalesOrderId = invoice.SalesOrderId,
            PurchaseOrderId = invoice.PurchaseOrderId,
            ProjectId = invoice.ProjectId,
            Notes = invoice.Notes,
            InternalNotes = invoice.InternalNotes,
            PdfFilePath = invoice.PdfFilePath,
            XmlFilePath = invoice.XmlFilePath,
            IsPrinted = invoice.IsPrinted,
            PrintCount = invoice.PrintCount,
            IsEmailSent = invoice.IsEmailSent,
            EmailSendDate = invoice.EmailSendDate,
            CreatedByUserId = invoice.CreatedByUserId,
            ApprovedByUserId = invoice.ApprovedByUserId,
            ApprovalDate = invoice.ApprovalDate,
            JournalEntryId = invoice.JournalEntryId,
            CreatedAt = invoice.CreatedDate,
            UpdatedAt = invoice.UpdatedDate,
            Lines = invoice.Lines.Select(MapLineToDto).ToList(),
            Taxes = invoice.Taxes.Select(MapTaxToDto).ToList()
        };
    }

    private static InvoiceLineDto MapLineToDto(InvoiceLine line)
    {
        return new InvoiceLineDto
        {
            Id = line.Id,
            InvoiceId = line.InvoiceId,
            LineNumber = line.LineNumber,
            ProductId = line.ProductId,
            ProductCode = line.ProductCode,
            ProductName = line.Description,
            Description = line.AdditionalDescription,
            Unit = line.Unit,
            Quantity = line.Quantity,
            UnitPrice = line.UnitPrice.Amount,
            LineTotal = line.LineTotal.Amount,
            DiscountRate = line.DiscountRate,
            DiscountAmount = line.DiscountAmount.Amount,
            GrossAmount = line.GrossAmount.Amount,
            NetAmount = line.NetAmount.Amount,
            VatRate = line.VatRate,
            VatAmount = line.VatAmount.Amount,
            ApplyWithholding = line.ApplyWithholding,
            WithholdingRate = line.WithholdingRate,
            WithholdingAmount = line.WithholdingAmount.Amount,
            OtherTaxAmount = line.SctAmount.Amount,
            FinalAmount = line.AmountIncludingVat.Amount,
            Currency = line.Currency
        };
    }

    private static InvoiceTaxDto MapTaxToDto(InvoiceTax tax)
    {
        return new InvoiceTaxDto
        {
            Id = tax.Id,
            InvoiceId = tax.InvoiceId,
            TaxType = tax.TaxType,
            TaxTypeName = tax.TaxName,
            TaxCode = tax.TaxCode,
            TaxableAmount = tax.TaxBase.Amount,
            TaxRate = tax.TaxRate,
            TaxAmount = tax.TaxAmount.Amount,
            Currency = tax.Currency
        };
    }
}

/// <summary>
/// Command to update an invoice
/// </summary>
public class UpdateInvoiceCommand : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateInvoiceDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateInvoiceCommand
/// </summary>
public class UpdateInvoiceCommandHandler : IRequestHandler<UpdateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(UpdateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetWithDetailsAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        // Only draft invoices can be updated
        if (invoice.Status != InvoiceStatus.Draft)
        {
            return Result<InvoiceDto>.Failure(
                Error.Validation("Invoice.Status", "Sadece taslak durumundaki faturalar güncellenebilir"));
        }

        // Update payment info
        invoice.SetPaymentInfo(
            request.Data.DueDate ?? invoice.DueDate,
            request.Data.PaymentMethod ?? invoice.PaymentMethod,
            request.Data.PaymentTerms ?? invoice.PaymentTerms,
            request.Data.PaymentNote ?? invoice.PaymentNote);

        // Update billing address
        invoice.SetBillingAddress(
            request.Data.BillingAddress ?? invoice.BillingAddress,
            request.Data.BillingDistrict ?? invoice.BillingDistrict,
            request.Data.BillingCity ?? invoice.BillingCity,
            request.Data.BillingCountry ?? invoice.BillingCountry,
            request.Data.BillingPostalCode ?? invoice.BillingPostalCode);

        // Update delivery address
        if (request.Data.DeliveryAddress != null)
        {
            invoice.SetDeliveryAddress(
                request.Data.DeliveryAddress,
                request.Data.DeliveryDistrict,
                request.Data.DeliveryCity,
                request.Data.DeliveryCountry);
        }

        // Update withholding if provided
        if (request.Data.ApplyVatWithholding.HasValue)
        {
            invoice.SetVatWithholding(
                request.Data.ApplyVatWithholding.Value,
                request.Data.VatWithholdingRate ?? invoice.VatWithholdingRate,
                request.Data.WithholdingCode ?? invoice.WithholdingCode,
                request.Data.WithholdingReason ?? invoice.WithholdingReason);
        }

        // Update VAT exemption if provided
        if (request.Data.HasVatExemption.HasValue)
        {
            invoice.SetVatExemption(
                request.Data.HasVatExemption.Value,
                request.Data.VatExemptionReason ?? invoice.VatExemptionReason,
                request.Data.VatExemptionDescription ?? invoice.VatExemptionDescription);
        }

        // Update reference information
        invoice.SetWaybillInfo(
            request.Data.WaybillNumber ?? invoice.WaybillNumber,
            request.Data.WaybillDate ?? invoice.WaybillDate);

        invoice.SetOrderInfo(
            request.Data.OrderNumber ?? invoice.OrderNumber,
            request.Data.OrderDate ?? invoice.OrderDate);

        // Update notes
        invoice.SetNotes(
            request.Data.Notes ?? invoice.Notes,
            request.Data.InternalNotes ?? invoice.InternalNotes);

        // Update lines if provided
        if (request.Data.Lines != null && request.Data.Lines.Count > 0)
        {
            invoice.ClearLines();
            var lineNumber = 1;
            foreach (var lineDto in request.Data.Lines)
            {
                var line = new InvoiceLine(
                    invoice.Id,
                    lineNumber++,
                    lineDto.ProductName,
                    lineDto.Quantity,
                    lineDto.Unit ?? "ADET",
                    Money.Create(lineDto.UnitPrice, invoice.Currency),
                    lineDto.VatRate,
                    invoice.Currency);

                if (lineDto.ProductId.HasValue)
                {
                    line.SetProductInfo(lineDto.ProductId, lineDto.ProductCode, null, null, null);
                }

                if (!string.IsNullOrEmpty(lineDto.Description))
                {
                    line.SetDescription(lineDto.ProductName, lineDto.Description);
                }

                if (lineDto.DiscountRate > 0)
                {
                    line.SetDiscount(lineDto.DiscountRate);
                }

                if (lineDto.ApplyWithholding)
                {
                    line.SetWithholding(true, lineDto.WithholdingRate, null);
                }

                invoice.AddLine(line);
            }
        }

        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateInvoiceCommandHandler.MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete an invoice
/// </summary>
public class DeleteInvoiceCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteInvoiceCommand
/// </summary>
public class DeleteInvoiceCommandHandler : IRequestHandler<DeleteInvoiceCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        // Only draft invoices can be deleted
        if (invoice.Status != InvoiceStatus.Draft)
        {
            return Result<bool>.Failure(
                Error.Validation("Invoice.Status", "Sadece taslak durumundaki faturalar silinebilir"));
        }

        _unitOfWork.Invoices.Remove(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

/// <summary>
/// Command to submit an invoice for approval
/// </summary>
public class SubmitInvoiceCommand : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SubmitInvoiceCommand
/// </summary>
public class SubmitInvoiceCommandHandler : IRequestHandler<SubmitInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SubmitInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(SubmitInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetWithDetailsAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        try
        {
            invoice.Submit();
        }
        catch (InvalidOperationException ex)
        {
            return Result<InvoiceDto>.Failure(
                Error.Validation("Invoice.Submit", ex.Message));
        }

        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateInvoiceCommandHandler.MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Command to approve an invoice
/// </summary>
public class ApproveInvoiceCommand : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public Guid ApprovedByUserId { get; set; }
}

/// <summary>
/// Handler for ApproveInvoiceCommand
/// </summary>
public class ApproveInvoiceCommandHandler : IRequestHandler<ApproveInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(ApproveInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetWithDetailsAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        try
        {
            // Note: Invoice.Approve expects int, but we receive Guid
            // For now, we'll use the hash code as a workaround
            // In a real scenario, you'd need to look up the user ID from a user service
            invoice.Approve((int)(request.ApprovedByUserId.GetHashCode() & 0x7FFFFFFF));
        }
        catch (InvalidOperationException ex)
        {
            return Result<InvoiceDto>.Failure(
                Error.Validation("Invoice.Approve", ex.Message));
        }

        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateInvoiceCommandHandler.MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Command to cancel an invoice
/// </summary>
public class CancelInvoiceCommand : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for CancelInvoiceCommand
/// </summary>
public class CancelInvoiceCommandHandler : IRequestHandler<CancelInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CancelInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(CancelInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetWithDetailsAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        try
        {
            invoice.Cancel("System", request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<InvoiceDto>.Failure(
                Error.Validation("Invoice.Cancel", ex.Message));
        }

        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateInvoiceCommandHandler.MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Command to send an invoice via e-Invoice
/// </summary>
public class SendEInvoiceCommand : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SendEInvoiceCommand
/// </summary>
public class SendEInvoiceCommandHandler : IRequestHandler<SendEInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SendEInvoiceCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(SendEInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetWithDetailsAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        // Get current account for receiver alias
        var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(invoice.CurrentAccountId, cancellationToken);
        if (currentAccount == null || !currentAccount.IsEInvoiceRegistered)
        {
            return Result<InvoiceDto>.Failure(
                Error.Validation("Invoice.EInvoice", "Cari hesap e-fatura mükellefi değil"));
        }

        try
        {
            // Generate GIB UUID and envelope ID
            var gibUuid = Guid.NewGuid();
            var envelopeId = $"ENV{DateTime.Now:yyyyMMddHHmmss}{invoice.Id:D6}";
            var receiverAlias = currentAccount.EInvoiceAlias ?? string.Empty;

            invoice.SendToTaxAuthority(gibUuid, envelopeId, receiverAlias);
        }
        catch (InvalidOperationException ex)
        {
            return Result<InvoiceDto>.Failure(
                Error.Validation("Invoice.SendEInvoice", ex.Message));
        }

        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateInvoiceCommandHandler.MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Static helper for mapping Invoice to DTO (used by handlers)
/// </summary>
public static class InvoiceMapper
{
    public static InvoiceDto MapToDto(Invoice invoice) => CreateInvoiceCommandHandler.MapToDto(invoice);
}
