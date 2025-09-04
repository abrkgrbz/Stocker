using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

public class Account : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int? ParentAccountId { get; private set; }
    public string AccountType { get; private set; }
    public string Currency { get; private set; }
    public Money Balance { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsSystemAccount { get; private set; }
    public int Level { get; private set; }
    
    public virtual Account? ParentAccount { get; private set; }
    public virtual ICollection<Account> SubAccounts { get; private set; }
    public virtual ICollection<Transaction> Transactions { get; private set; }
    
    protected Account() { }
    
    public Account(
        string code,
        string name,
        string accountType,
        string currency = "TRY",
        int? parentAccountId = null)
    {
        Code = code;
        Name = name;
        AccountType = accountType;
        Currency = currency;
        ParentAccountId = parentAccountId;
        Balance = Money.Create(0, currency);
        IsActive = true;
        IsSystemAccount = false;
        Level = CalculateLevel(code);
        SubAccounts = new List<Account>();
        Transactions = new List<Transaction>();
    }
    
    public void UpdateAccount(string name, string? description)
    {
        Name = name;
        Description = description;
    }
    
    public void UpdateBalance(Money amount)
    {
        Balance = amount;
    }
    
    public void Debit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");
            
        Balance = Money.Create(Balance.Amount + amount.Amount, Currency);
    }
    
    public void Credit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");
            
        Balance = Money.Create(Balance.Amount - amount.Amount, Currency);
    }
    
    public void MarkAsSystemAccount()
    {
        IsSystemAccount = true;
    }
    
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
    
    private int CalculateLevel(string code)
    {
        return code.Split('.').Length;
    }
}