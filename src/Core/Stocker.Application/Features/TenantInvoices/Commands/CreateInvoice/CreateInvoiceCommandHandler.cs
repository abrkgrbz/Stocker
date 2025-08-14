using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantInvoice;
using Stocker.Application.Extensions;
using Stocker.Domain.Common.ValueObjects;
using TenantEntities = Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantInvoices.Commands.CreateInvoice;

public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, Result<TenantInvoiceDto>>
{
    private readonly ITenantUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateInvoiceCommandHandler> _logger;

    public CreateInvoiceCommandHandler(
        ITenantUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CreateInvoiceCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<TenantInvoiceDto>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // ITenantUnitOfWork has TenantId property
            var tenantId = _unitOfWork.TenantId;

            // Check if invoice number is unique
            var existingInvoice = await _unitOfWork.Invoices()
                .AsQueryable()
                .FirstOrDefaultAsync(i => i.InvoiceNumber == request.InvoiceNumber, cancellationToken);

            if (existingInvoice != null)
            {
                return Result<TenantInvoiceDto>.Failure(
                    Error.Validation("Invoice.DuplicateNumber", "Bu fatura numarası zaten kullanımda"));
            }

            // Create invoice
            var invoice = TenantEntities.Invoice.Create(
                tenantId: tenantId,
                invoiceNumber: request.InvoiceNumber,
                customerId: request.CustomerId,
                invoiceDate: request.InvoiceDate,
                dueDate: request.DueDate);

            // Set notes and terms
            if (!string.IsNullOrEmpty(request.Notes))
                invoice.SetNotes(request.Notes);
            
            if (!string.IsNullOrEmpty(request.Terms))
                invoice.SetTerms(request.Terms);

            // Add items
            foreach (var itemDto in request.Items)
            {
                var unitPrice = Money.Create(itemDto.UnitPrice, request.Currency);
                
                var item = TenantEntities.InvoiceItem.Create(
                    tenantId: tenantId,
                    invoiceId: invoice.Id,
                    productId: itemDto.ProductId,
                    productName: itemDto.ProductName,
                    quantity: itemDto.Quantity,
                    unitPrice: unitPrice);

                if (!string.IsNullOrEmpty(itemDto.Description))
                    item.SetDescription(itemDto.Description);

                if (itemDto.DiscountPercentage.HasValue && itemDto.DiscountPercentage > 0)
                    item.ApplyDiscount(itemDto.DiscountPercentage.Value);

                if (itemDto.TaxRate.HasValue && itemDto.TaxRate > 0)
                    item.ApplyTax(itemDto.TaxRate.Value);

                invoice.AddItem(item);
            }

            // Save invoice
            await _unitOfWork.Invoices().AddAsync(invoice, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Invoice created successfully: {InvoiceNumber} for tenant {TenantId}", 
                invoice.InvoiceNumber, tenantId);

            // Map to DTO
            var dto = _mapper.Map<TenantInvoiceDto>(invoice);
            return Result<TenantInvoiceDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invoice");
            return Result<TenantInvoiceDto>.Failure(
                Error.Failure("Invoice.CreateFailed", "Fatura oluşturulurken hata oluştu"));
        }
    }
}