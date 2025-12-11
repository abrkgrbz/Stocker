using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Ödeme Tahsisi (Payment Allocation)
/// Bir ödemenin/tahsilatın hangi faturalara tahsis edildiğini yönetir
/// </summary>
public class PaymentAllocation : BaseEntity
{
    /// <summary>
    /// Ödeme ID (Payment ID)
    /// </summary>
    public int PaymentId { get; private set; }

    /// <summary>
    /// Fatura ID (Invoice ID)
    /// </summary>
    public int InvoiceId { get; private set; }

    /// <summary>
    /// Cari Hareket ID (Current Account Transaction ID)
    /// </summary>
    public int? CurrentAccountTransactionId { get; private set; }

    /// <summary>
    /// Tahsis Tutarı (Allocation Amount)
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz Kuru (Exchange Rate)
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL Tutarı (Amount in TRY)
    /// </summary>
    public Money AmountTRY { get; private set; } = null!;

    /// <summary>
    /// Tahsis Tarihi (Allocation Date)
    /// </summary>
    public DateTime AllocationDate { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Otomatik Tahsis mi? (Is Auto Allocated)
    /// </summary>
    public bool IsAutoAllocated { get; private set; }

    // Navigation Properties
    public virtual Payment Payment { get; private set; } = null!;
    public virtual Invoice Invoice { get; private set; } = null!;
    public virtual CurrentAccountTransaction? CurrentAccountTransaction { get; private set; }

    protected PaymentAllocation() { }

    public PaymentAllocation(
        int paymentId,
        int invoiceId,
        Money amount,
        DateTime allocationDate,
        string currency = "TRY",
        bool isAutoAllocated = false)
    {
        PaymentId = paymentId;
        InvoiceId = invoiceId;
        Amount = amount;
        AllocationDate = allocationDate;
        Currency = currency;
        ExchangeRate = 1;
        AmountTRY = amount;
        IsAutoAllocated = isAutoAllocated;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(Amount.Amount * rate, "TRY");
    }

    public void LinkToCurrentAccountTransaction(int transactionId)
    {
        CurrentAccountTransactionId = transactionId;
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void UpdateAmount(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Amount = amount;
        AmountTRY = Money.Create(amount.Amount * ExchangeRate, "TRY");
    }
}
