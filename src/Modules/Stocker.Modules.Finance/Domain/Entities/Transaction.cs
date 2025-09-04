using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

public class Transaction : BaseEntity
{
    public string TransactionNumber { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public int DebitAccountId { get; private set; }
    public int CreditAccountId { get; private set; }
    public Money Amount { get; private set; }
    public string Currency { get; private set; }
    public decimal ExchangeRate { get; private set; }
    public Money LocalAmount { get; private set; }
    public string TransactionType { get; private set; }
    public string? ReferenceType { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public int? ReferenceId { get; private set; }
    public string Description { get; private set; }
    public int? CostCenterId { get; private set; }
    public int? ProjectId { get; private set; }
    public bool IsReversed { get; private set; }
    public int? ReversedTransactionId { get; private set; }
    public int CreatedBy { get; private set; }
    
    public virtual Account DebitAccount { get; private set; }
    public virtual Account CreditAccount { get; private set; }
    public virtual Transaction? ReversedTransaction { get; private set; }
    
    protected Transaction() { }
    
    public Transaction(
        string transactionNumber,
        DateTime transactionDate,
        int debitAccountId,
        int creditAccountId,
        Money amount,
        string transactionType,
        string description,
        int createdBy)
    {
        TransactionNumber = transactionNumber;
        TransactionDate = transactionDate;
        DebitAccountId = debitAccountId;
        CreditAccountId = creditAccountId;
        Amount = amount;
        Currency = amount.Currency;
        ExchangeRate = 1;
        LocalAmount = amount;
        TransactionType = transactionType;
        Description = description;
        CreatedBy = createdBy;
        IsReversed = false;
    }
    
    public void SetExchangeRate(decimal rate, string localCurrency = "TRY")
    {
        ExchangeRate = rate;
        LocalAmount = Money.Create(Amount.Amount * rate, localCurrency);
    }
    
    public void SetReference(string referenceType, string referenceNumber, int? referenceId = null)
    {
        ReferenceType = referenceType;
        ReferenceNumber = referenceNumber;
        ReferenceId = referenceId;
    }
    
    public void SetCostCenter(int costCenterId)
    {
        CostCenterId = costCenterId;
    }
    
    public void SetProject(int projectId)
    {
        ProjectId = projectId;
    }
    
    public void Reverse(int reversedTransactionId)
    {
        if (IsReversed)
            throw new InvalidOperationException("Transaction has already been reversed");
            
        IsReversed = true;
        ReversedTransactionId = reversedTransactionId;
    }
}