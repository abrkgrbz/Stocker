using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Services;
using Stocker.Modules.Finance.Infrastructure.Persistence;

namespace Stocker.Modules.Finance.Infrastructure.Services;

/// <summary>
/// Cari hesap hareket servisi implementasyonu.
/// </summary>
public class CurrentAccountTransactionService : ICurrentAccountTransactionService
{
    private readonly FinanceDbContext _dbContext;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public CurrentAccountTransactionService(FinanceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CurrentAccountTransaction> CreateFromInvoiceAsync(
        Invoice invoice,
        CancellationToken cancellationToken = default)
    {
        var transactionNumber = await GenerateTransactionNumberAsync(invoice.TenantId, cancellationToken);

        CurrentAccountTransaction transaction;

        if (invoice.InvoiceType == InvoiceType.Sales || invoice.InvoiceType == InvoiceType.Export)
        {
            // Satış faturası - Müşteri bize borçlanır (Debit)
            transaction = CurrentAccountTransaction.CreateFromSalesInvoice(
                invoice.CurrentAccountId,
                transactionNumber,
                invoice);
        }
        else
        {
            // Alış faturası - Biz tedarikçiye borçlanırız (Credit)
            transaction = CurrentAccountTransaction.CreateFromPurchaseInvoice(
                invoice.CurrentAccountId,
                transactionNumber,
                invoice);
        }

        transaction.SetTenantId(invoice.TenantId);

        // Kümülatif bakiyeyi hesapla
        var runningBalance = await CalculateRunningBalanceAsync(
            invoice.CurrentAccountId,
            transaction,
            cancellationToken);
        transaction.SetRunningBalance(runningBalance);

        await _dbContext.CurrentAccountTransactions.AddAsync(transaction, cancellationToken);

        // Cari hesap bakiyesini güncelle
        await UpdateCurrentAccountBalanceAsync(invoice.CurrentAccountId, cancellationToken);

        return transaction;
    }

    public async Task<CurrentAccountTransaction> CreateFromPaymentAsync(
        Payment payment,
        CancellationToken cancellationToken = default)
    {
        var transactionNumber = await GenerateTransactionNumberAsync(payment.TenantId, cancellationToken);

        CurrentAccountTransaction transaction;

        if (payment.Direction == MovementDirection.Inbound)
        {
            // Tahsilat - Müşteriden para alındı (Credit - müşteri borcu azalır)
            transaction = CurrentAccountTransaction.CreateCollection(
                payment.CurrentAccountId,
                transactionNumber,
                payment.PaymentDate,
                payment.Amount,
                $"Tahsilat: {payment.PaymentNumber}");
        }
        else
        {
            // Ödeme - Tedarikçiye para ödendi (Debit - bizim borcumuz azalır)
            transaction = CurrentAccountTransaction.CreatePayment(
                payment.CurrentAccountId,
                transactionNumber,
                payment.PaymentDate,
                payment.Amount,
                $"Ödeme: {payment.PaymentNumber}");
        }

        transaction.SetTenantId(payment.TenantId);
        transaction.LinkToPayment(payment.Id);

        // Kümülatif bakiyeyi hesapla
        var runningBalance = await CalculateRunningBalanceAsync(
            payment.CurrentAccountId,
            transaction,
            cancellationToken);
        transaction.SetRunningBalance(runningBalance);

        await _dbContext.CurrentAccountTransactions.AddAsync(transaction, cancellationToken);

        // Cari hesap bakiyesini güncelle
        await UpdateCurrentAccountBalanceAsync(payment.CurrentAccountId, cancellationToken);

        return transaction;
    }

    public async Task<CurrentAccountTransaction> CreateReversalForInvoiceAsync(
        Invoice invoice,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var transactionNumber = await GenerateTransactionNumberAsync(invoice.TenantId, cancellationToken);

        // Ters kayıt - orijinalin tersini yap
        CurrentAccountTransaction transaction;

        if (invoice.InvoiceType == InvoiceType.Sales || invoice.InvoiceType == InvoiceType.Export)
        {
            // Satış faturası iptali - Credit (müşteri borcu azalır)
            transaction = new CurrentAccountTransaction(
                invoice.CurrentAccountId,
                transactionNumber,
                DateTime.UtcNow,
                CurrentAccountTransactionType.InvoiceCancellation,
                $"Fatura İptali: {invoice.InvoiceNumber} - {reason}",
                Money.Zero(invoice.Currency),
                invoice.GrandTotal,
                invoice.Currency);
        }
        else
        {
            // Alış faturası iptali - Debit (bizim borcumuz azalır)
            transaction = new CurrentAccountTransaction(
                invoice.CurrentAccountId,
                transactionNumber,
                DateTime.UtcNow,
                CurrentAccountTransactionType.InvoiceCancellation,
                $"Fatura İptali: {invoice.InvoiceNumber} - {reason}",
                invoice.GrandTotal,
                Money.Zero(invoice.Currency),
                invoice.Currency);
        }

        transaction.SetTenantId(invoice.TenantId);
        transaction.LinkToInvoice(invoice.Id);
        transaction.SetNotes($"İptal nedeni: {reason}");

        var runningBalance = await CalculateRunningBalanceAsync(
            invoice.CurrentAccountId,
            transaction,
            cancellationToken);
        transaction.SetRunningBalance(runningBalance);

        await _dbContext.CurrentAccountTransactions.AddAsync(transaction, cancellationToken);
        await UpdateCurrentAccountBalanceAsync(invoice.CurrentAccountId, cancellationToken);

        return transaction;
    }

    public async Task<CurrentAccountTransaction> CreateReversalForPaymentAsync(
        Payment payment,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var transactionNumber = await GenerateTransactionNumberAsync(payment.TenantId, cancellationToken);

        // Ters kayıt
        CurrentAccountTransaction transaction;

        if (payment.Direction == MovementDirection.Inbound)
        {
            // Tahsilat iptali - Debit (müşteri borcu artar)
            transaction = new CurrentAccountTransaction(
                payment.CurrentAccountId,
                transactionNumber,
                DateTime.UtcNow,
                CurrentAccountTransactionType.PaymentCancellation,
                $"Tahsilat İptali: {payment.PaymentNumber} - {reason}",
                payment.Amount,
                Money.Zero(payment.Currency),
                payment.Currency);
        }
        else
        {
            // Ödeme iptali - Credit (bizim borcumuz artar)
            transaction = new CurrentAccountTransaction(
                payment.CurrentAccountId,
                transactionNumber,
                DateTime.UtcNow,
                CurrentAccountTransactionType.PaymentCancellation,
                $"Ödeme İptali: {payment.PaymentNumber} - {reason}",
                Money.Zero(payment.Currency),
                payment.Amount,
                payment.Currency);
        }

        transaction.SetTenantId(payment.TenantId);
        transaction.LinkToPayment(payment.Id);
        transaction.SetNotes($"İptal nedeni: {reason}");

        var runningBalance = await CalculateRunningBalanceAsync(
            payment.CurrentAccountId,
            transaction,
            cancellationToken);
        transaction.SetRunningBalance(runningBalance);

        await _dbContext.CurrentAccountTransactions.AddAsync(transaction, cancellationToken);
        await UpdateCurrentAccountBalanceAsync(payment.CurrentAccountId, cancellationToken);

        return transaction;
    }

    public async Task<string> GenerateTransactionNumberAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var today = DateTime.UtcNow;
            var prefix = $"TRX{today:yyyyMMdd}";

            var lastTransaction = await _dbContext.CurrentAccountTransactions
                .AsNoTracking()
                .Where(t => t.TenantId == tenantId && t.TransactionNumber.StartsWith(prefix))
                .OrderByDescending(t => t.TransactionNumber)
                .Select(t => t.TransactionNumber)
                .FirstOrDefaultAsync(cancellationToken);

            int nextSequence = 1;
            if (lastTransaction != null && lastTransaction.Length > prefix.Length)
            {
                var sequencePart = lastTransaction.Substring(prefix.Length);
                if (int.TryParse(sequencePart, out var lastSequence))
                {
                    nextSequence = lastSequence + 1;
                }
            }

            return $"{prefix}{nextSequence:D6}";
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<Money> CalculateRunningBalanceAsync(
        int currentAccountId,
        CurrentAccountTransaction newTransaction,
        CancellationToken cancellationToken)
    {
        var lastBalance = await _dbContext.CurrentAccountTransactions
            .AsNoTracking()
            .Where(t => t.CurrentAccountId == currentAccountId && !t.IsCancelled)
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.Id)
            .Select(t => t.RunningBalance.Amount)
            .FirstOrDefaultAsync(cancellationToken);

        // Borç - Alacak = Bakiye
        var newBalance = lastBalance + newTransaction.DebitAmount.Amount - newTransaction.CreditAmount.Amount;
        return Money.Create(newBalance, newTransaction.Currency);
    }

    private async Task UpdateCurrentAccountBalanceAsync(
        int currentAccountId,
        CancellationToken cancellationToken)
    {
        var currentAccount = await _dbContext.CurrentAccounts
            .FirstOrDefaultAsync(ca => ca.Id == currentAccountId, cancellationToken);

        if (currentAccount == null) return;

        var totals = await _dbContext.CurrentAccountTransactions
            .Where(t => t.CurrentAccountId == currentAccountId && !t.IsCancelled)
            .GroupBy(t => 1)
            .Select(g => new
            {
                TotalDebit = g.Sum(t => t.DebitAmount.Amount),
                TotalCredit = g.Sum(t => t.CreditAmount.Amount)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (totals != null)
        {
            var balance = totals.TotalDebit - totals.TotalCredit;
            currentAccount.UpdateBalance(Money.Create(balance, currentAccount.Currency));
        }
    }
}
