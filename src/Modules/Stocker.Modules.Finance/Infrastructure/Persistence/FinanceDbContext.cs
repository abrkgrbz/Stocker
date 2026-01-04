using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Finance.Infrastructure.Persistence;

/// <summary>
/// Database context for the Finance module
/// </summary>
public class FinanceDbContext : DbContext
{
    private readonly ITenantService _tenantService;
    private readonly IBackgroundTenantService? _backgroundTenantService;

    // Core Finance Entities
    public DbSet<CurrentAccount> CurrentAccounts { get; set; } = null!;
    public DbSet<CurrentAccountTransaction> CurrentAccountTransactions { get; set; } = null!;

    // Invoice Management
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<InvoiceLine> InvoiceLines { get; set; } = null!;
    public DbSet<InvoiceTax> InvoiceTaxes { get; set; } = null!;

    // Expense Management
    public DbSet<Expense> Expenses { get; set; } = null!;
    public DbSet<CostCenter> CostCenters { get; set; } = null!;

    // Payment Management
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<PaymentAllocation> PaymentAllocations { get; set; } = null!;

    // Banking
    public DbSet<BankAccount> BankAccounts { get; set; } = null!;
    public DbSet<BankTransaction> BankTransactions { get; set; } = null!;
    public DbSet<BankReconciliation> BankReconciliations { get; set; } = null!;

    // Cash Management
    public DbSet<CashAccount> CashAccounts { get; set; } = null!;
    public DbSet<CashTransaction> CashTransactions { get; set; } = null!;

    // Check and Promissory Notes
    public DbSet<Check> Checks { get; set; } = null!;
    public DbSet<PromissoryNote> PromissoryNotes { get; set; } = null!;

    // Accounting
    public DbSet<Account> Accounts { get; set; } = null!;
    public DbSet<JournalEntry> JournalEntries { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<AccountingPeriod> AccountingPeriods { get; set; } = null!;
    public DbSet<Budget> Budgets { get; set; } = null!;

    // Fixed Assets
    public DbSet<FixedAsset> FixedAssets { get; set; } = null!;

    // Loans
    public DbSet<Loan> Loans { get; set; } = null!;
    public DbSet<InstallmentPlan> InstallmentPlans { get; set; } = null!;

    // Exchange Rates
    public DbSet<ExchangeRate> ExchangeRates { get; set; } = null!;
    public DbSet<ExchangeRateAdjustment> ExchangeRateAdjustments { get; set; } = null!;

    // Tax Declarations
    public DbSet<TaxDeclaration> TaxDeclarations { get; set; } = null!;
    public DbSet<BaBsForm> BaBsForms { get; set; } = null!;

    public FinanceDbContext(
        DbContextOptions<FinanceDbContext> options,
        ITenantService tenantService,
        IBackgroundTenantService? backgroundTenantService = null)
        : base(options)
    {
        _tenantService = tenantService;
        _backgroundTenantService = backgroundTenantService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Set default schema for Finance module
        modelBuilder.HasDefaultSchema("finance");

        // Apply configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FinanceDbContext).Assembly);

        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            // Core entities
            modelBuilder.Entity<CurrentAccount>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CurrentAccountTransaction>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Invoice entities
            modelBuilder.Entity<Invoice>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<InvoiceLine>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<InvoiceTax>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Expense entities
            modelBuilder.Entity<Expense>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CostCenter>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Payment entities
            modelBuilder.Entity<Payment>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PaymentAllocation>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Banking entities
            modelBuilder.Entity<BankAccount>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<BankTransaction>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<BankReconciliation>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Cash entities
            modelBuilder.Entity<CashAccount>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CashTransaction>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Check and Notes
            modelBuilder.Entity<Check>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PromissoryNote>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Accounting entities
            modelBuilder.Entity<Account>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<JournalEntry>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Transaction>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<AccountingPeriod>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Budget>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Fixed Assets
            modelBuilder.Entity<FixedAsset>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Loans
            modelBuilder.Entity<Loan>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<InstallmentPlan>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Exchange Rates
            modelBuilder.Entity<ExchangeRate>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ExchangeRateAdjustment>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Tax
            modelBuilder.Entity<TaxDeclaration>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<BaBsForm>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        var tenantId = _backgroundTenantService?.GetCurrentTenantId() ?? _tenantService.GetCurrentTenantId();

        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                if (!tenantId.HasValue)
                {
                    throw new InvalidOperationException(
                        $"Cannot save entity '{entry.Entity.GetType().Name}' without TenantId. " +
                        "Either set TenantId explicitly on the entity or ensure tenant context is available.");
                }
                entry.Property(nameof(ITenantEntity.TenantId)).CurrentValue = tenantId.Value;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
