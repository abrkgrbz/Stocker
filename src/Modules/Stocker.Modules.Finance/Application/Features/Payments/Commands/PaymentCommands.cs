using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.Payments.Commands;

/// <summary>
/// Command to create a new payment
/// </summary>
public class CreatePaymentCommand : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreatePaymentDto Data { get; set; } = null!;
    public MovementDirection Direction { get; set; }
}

/// <summary>
/// Handler for CreatePaymentCommand
/// </summary>
public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreatePaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        // Get the current account
        var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId, cancellationToken);
        if (currentAccount == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadı"));
        }

        // Generate payment number
        var paymentNumber = await _unitOfWork.Payments.GetNextPaymentNumberAsync(request.Direction, DateTime.UtcNow.Year, cancellationToken);

        // Create payment entity
        var amount = Money.Create(request.Data.Amount, request.Data.Currency);
        var payment = new Payment(
            paymentNumber,
            request.Data.PaymentDate,
            request.Data.PaymentType,
            request.Direction,
            currentAccount.Id,
            currentAccount.Name,
            amount,
            request.Data.Currency);

        // Set exchange rate
        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            payment.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Link to bank or cash account
        if (request.Data.BankAccountId.HasValue)
        {
            payment.LinkToBankAccount(request.Data.BankAccountId.Value);
        }
        else if (request.Data.CashAccountId.HasValue)
        {
            payment.LinkToCashAccount(request.Data.CashAccountId.Value);
        }

        // Set optional fields
        payment.SetDescription(request.Data.Description);
        payment.SetNotes(request.Data.Notes);

        if (!string.IsNullOrEmpty(request.Data.DocumentNumber))
        {
            payment.SetReferenceNumbers(request.Data.DocumentNumber, null);
        }

        // Save payment
        await _unitOfWork.Payments.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Handle allocations if provided
        if (request.Data.Allocations != null && request.Data.Allocations.Any())
        {
            foreach (var allocationDto in request.Data.Allocations)
            {
                var invoice = await _unitOfWork.Invoices.GetByIdAsync(allocationDto.InvoiceId, cancellationToken);
                if (invoice != null)
                {
                    var allocationAmount = Money.Create(allocationDto.AllocatedAmount, request.Data.Currency);
                    var allocation = new PaymentAllocation(
                        payment.Id,
                        allocationDto.InvoiceId,
                        allocationAmount,
                        request.Data.PaymentDate,
                        request.Data.Currency,
                        false);

                    if (!string.IsNullOrEmpty(allocationDto.Notes))
                    {
                        allocation.SetDescription(allocationDto.Notes);
                    }

                    payment.AddAllocation(allocation, invoice.InvoiceNumber);
                }
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Map to DTO
        var dto = MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }

    internal static PaymentDto MapToDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            PaymentNumber = payment.PaymentNumber,
            PaymentDate = payment.PaymentDate,
            PaymentType = payment.PaymentType,
            PaymentTypeName = payment.PaymentType.ToString(),
            Direction = payment.Direction,
            DirectionName = payment.Direction == MovementDirection.Inbound ? "Tahsilat" : "Ödeme",
            CurrentAccountId = payment.CurrentAccountId,
            CurrentAccountCode = string.Empty,
            CurrentAccountName = payment.CurrentAccountName,
            Amount = payment.Amount.Amount,
            Currency = payment.Currency,
            ExchangeRate = payment.ExchangeRate,
            AmountTRY = payment.AmountTRY.Amount,
            BankAccountId = payment.BankAccountId,
            BankAccountName = payment.BankAccount?.Name,
            CashAccountId = payment.CashAccountId,
            CashAccountName = payment.CashAccount?.Name,
            CheckNumber = payment.Check?.CheckNumber,
            BankName = payment.Check?.BankName,
            BranchName = payment.Check?.BranchName,
            CheckDueDate = payment.Check?.DueDate,
            Endorser = payment.Check?.IsEndorsed == true ? payment.Check.EndorsedToCurrentAccount?.Name : null,
            Status = payment.Status,
            DocumentNumber = payment.ReferenceNumber,
            Description = payment.Description,
            Notes = payment.Notes,
            InvoiceId = null,
            InvoiceNumber = null,
            Allocations = payment.Allocations.Select(MapAllocationToDto).ToList(),
            AllocatedAmount = payment.AllocatedAmount.Amount,
            UnallocatedAmount = payment.UnallocatedAmount.Amount,
            JournalEntryId = payment.JournalEntryId,
            CreatedByUserId = null,
            CreatedAt = payment.CreatedDate,
            UpdatedAt = payment.UpdatedDate
        };
    }

    private static PaymentAllocationDto MapAllocationToDto(PaymentAllocation allocation)
    {
        return new PaymentAllocationDto
        {
            Id = allocation.Id,
            PaymentId = allocation.PaymentId,
            InvoiceId = allocation.InvoiceId,
            InvoiceNumber = allocation.Invoice?.InvoiceNumber,
            AllocatedAmount = allocation.Amount.Amount,
            Currency = allocation.Currency,
            AllocationDate = allocation.AllocationDate,
            Notes = allocation.Description
        };
    }
}

/// <summary>
/// Command to update a payment
/// </summary>
public class UpdatePaymentCommand : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdatePaymentDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdatePaymentCommand
/// </summary>
public class UpdatePaymentCommandHandler : IRequestHandler<UpdatePaymentCommand, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdatePaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(UpdatePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.Id, cancellationToken);
        if (payment == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("Payment", $"ID {request.Id} ile ödeme bulunamadı"));
        }

        if (payment.Status == PaymentStatus.Completed || payment.Status == PaymentStatus.Cancelled)
        {
            return Result<PaymentDto>.Failure(
                Error.Validation("Payment.Status", "Tamamlanmış veya iptal edilmiş ödemeler güncellenemez"));
        }

        // Update fields
        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            payment.SetDescription(request.Data.Description);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            payment.SetNotes(request.Data.Notes);
        }

        if (!string.IsNullOrEmpty(request.Data.DocumentNumber))
        {
            payment.SetReferenceNumbers(request.Data.DocumentNumber, null);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreatePaymentCommandHandler.MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete a payment
/// </summary>
public class DeletePaymentCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeletePaymentCommand
/// </summary>
public class DeletePaymentCommandHandler : IRequestHandler<DeletePaymentCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeletePaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.Id, cancellationToken);
        if (payment == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payment", $"ID {request.Id} ile ödeme bulunamadı"));
        }

        if (payment.Status == PaymentStatus.Completed)
        {
            return Result<bool>.Failure(
                Error.Validation("Payment.Status", "Tamamlanmış ödemeler silinemez"));
        }

        if (payment.Allocations.Any())
        {
            return Result<bool>.Failure(
                Error.Validation("Payment.Allocations", "Faturalara tahsis edilmiş ödemeler silinemez"));
        }

        _unitOfWork.Payments.Remove(payment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

/// <summary>
/// Command to approve a payment
/// </summary>
public class ApprovePaymentCommand : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public Guid ApprovedByUserId { get; set; }
    public string? Note { get; set; }
}

/// <summary>
/// Handler for ApprovePaymentCommand
/// </summary>
public class ApprovePaymentCommandHandler : IRequestHandler<ApprovePaymentCommand, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApprovePaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(ApprovePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.Id, cancellationToken);
        if (payment == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("Payment", $"ID {request.Id} ile ödeme bulunamadı"));
        }

        try
        {
            // Convert Guid to int for user ID
            var userIdInt = (int)(request.ApprovedByUserId.GetHashCode() & 0x7FFFFFFF);
            payment.Approve(userIdInt, request.Note);
        }
        catch (InvalidOperationException ex)
        {
            return Result<PaymentDto>.Failure(
                Error.Validation("Payment.Approve", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreatePaymentCommandHandler.MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }
}

/// <summary>
/// Command to cancel a payment
/// </summary>
public class CancelPaymentCommand : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for CancelPaymentCommand
/// </summary>
public class CancelPaymentCommandHandler : IRequestHandler<CancelPaymentCommand, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CancelPaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(CancelPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.Id, cancellationToken);
        if (payment == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("Payment", $"ID {request.Id} ile ödeme bulunamadı"));
        }

        try
        {
            payment.Cancel("System", request.Reason ?? "İptal edildi");
        }
        catch (InvalidOperationException ex)
        {
            return Result<PaymentDto>.Failure(
                Error.Validation("Payment.Cancel", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreatePaymentCommandHandler.MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }
}

/// <summary>
/// Command to complete a payment
/// </summary>
public class CompletePaymentCommand : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for CompletePaymentCommand
/// </summary>
public class CompletePaymentCommandHandler : IRequestHandler<CompletePaymentCommand, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CompletePaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(CompletePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.Id, cancellationToken);
        if (payment == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("Payment", $"ID {request.Id} ile ödeme bulunamadı"));
        }

        try
        {
            payment.Complete();
        }
        catch (InvalidOperationException ex)
        {
            return Result<PaymentDto>.Failure(
                Error.Validation("Payment.Complete", ex.Message));
        }

        // Update paid amounts on allocated invoices
        foreach (var allocation in payment.Allocations)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(allocation.InvoiceId, cancellationToken);
            if (invoice != null)
            {
                try
                {
                    invoice.RecordPayment(allocation.Amount);
                }
                catch (InvalidOperationException)
                {
                    // Invoice may already be fully paid, continue with other allocations
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreatePaymentCommandHandler.MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }
}

/// <summary>
/// Command to allocate a payment to invoices
/// </summary>
public class AllocatePaymentCommand : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int PaymentId { get; set; }
    public List<CreatePaymentAllocationDto> Allocations { get; set; } = new();
}

/// <summary>
/// Handler for AllocatePaymentCommand
/// </summary>
public class AllocatePaymentCommandHandler : IRequestHandler<AllocatePaymentCommand, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public AllocatePaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(AllocatePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.PaymentId, cancellationToken);
        if (payment == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("Payment", $"ID {request.PaymentId} ile ödeme bulunamadı"));
        }

        if (payment.Status == PaymentStatus.Cancelled)
        {
            return Result<PaymentDto>.Failure(
                Error.Validation("Payment.Status", "İptal edilmiş ödemelere tahsis yapılamaz"));
        }

        // Validate total allocation amount
        var totalAllocationAmount = request.Allocations.Sum(a => a.AllocatedAmount);
        if (totalAllocationAmount > payment.UnallocatedAmount.Amount)
        {
            return Result<PaymentDto>.Failure(
                Error.Validation("Payment.Allocation", "Tahsis tutarı kullanılabilir tutarı aşıyor"));
        }

        // Create allocations
        foreach (var allocationDto in request.Allocations)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(allocationDto.InvoiceId, cancellationToken);
            if (invoice == null)
            {
                return Result<PaymentDto>.Failure(
                    Error.NotFound("Invoice", $"ID {allocationDto.InvoiceId} ile fatura bulunamadı"));
            }

            // Check if payment direction matches invoice type
            // Inbound payments (Tahsilat) go with Sales/Export invoices
            // Outbound payments (Ödeme) go with Purchase invoices
            var isValidDirection = (payment.Direction == MovementDirection.Inbound &&
                                   (invoice.InvoiceType == InvoiceType.Sales || invoice.InvoiceType == InvoiceType.Export)) ||
                                  (payment.Direction == MovementDirection.Outbound &&
                                   invoice.InvoiceType == InvoiceType.Purchase);

            if (!isValidDirection)
            {
                return Result<PaymentDto>.Failure(
                    Error.Validation("Payment.Allocation", $"Ödeme yönü fatura tipi ile uyuşmuyor: Fatura {invoice.InvoiceNumber}"));
            }

            try
            {
                var allocationAmount = Money.Create(allocationDto.AllocatedAmount, payment.Currency);
                var allocation = new PaymentAllocation(
                    payment.Id,
                    allocationDto.InvoiceId,
                    allocationAmount,
                    DateTime.UtcNow,
                    payment.Currency,
                    false);

                if (!string.IsNullOrEmpty(allocationDto.Notes))
                {
                    allocation.SetDescription(allocationDto.Notes);
                }

                payment.AddAllocation(allocation, invoice.InvoiceNumber);
            }
            catch (InvalidOperationException ex)
            {
                return Result<PaymentDto>.Failure(
                    Error.Validation("Payment.Allocation", ex.Message));
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreatePaymentCommandHandler.MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }
}
