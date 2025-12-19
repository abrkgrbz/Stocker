using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence;

public class PurchaseDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public PurchaseDbContext(DbContextOptions<PurchaseDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    // Suppliers
    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<SupplierContact> SupplierContacts { get; set; } = null!;
    public DbSet<SupplierProduct> SupplierProducts { get; set; } = null!;

    // Purchase Requests
    public DbSet<PurchaseRequest> PurchaseRequests { get; set; } = null!;
    public DbSet<PurchaseRequestItem> PurchaseRequestItems { get; set; } = null!;

    // Purchase Orders
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; } = null!;
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; } = null!;

    // Goods Receipts
    public DbSet<GoodsReceipt> GoodsReceipts { get; set; } = null!;
    public DbSet<GoodsReceiptItem> GoodsReceiptItems { get; set; } = null!;

    // Purchase Invoices
    public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; } = null!;
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = null!;

    // Purchase Returns
    public DbSet<PurchaseReturn> PurchaseReturns { get; set; } = null!;
    public DbSet<PurchaseReturnItem> PurchaseReturnItems { get; set; } = null!;

    // Payments
    public DbSet<SupplierPayment> SupplierPayments { get; set; } = null!;

    // Quotations/RFQ
    public DbSet<Quotation> Quotations { get; set; } = null!;
    public DbSet<QuotationItem> QuotationItems { get; set; } = null!;
    public DbSet<QuotationSupplier> QuotationSuppliers { get; set; } = null!;
    public DbSet<QuotationSupplierItem> QuotationSupplierItems { get; set; } = null!;

    // Contracts
    public DbSet<PurchaseContract> PurchaseContracts { get; set; } = null!;
    public DbSet<PurchaseContractItem> PurchaseContractItems { get; set; } = null!;
    public DbSet<PurchaseContractPriceBreak> PurchaseContractPriceBreaks { get; set; } = null!;

    // Price Lists
    public DbSet<PriceList> PriceLists { get; set; } = null!;
    public DbSet<PriceListItem> PriceListItems { get; set; } = null!;
    public DbSet<PriceListItemTier> PriceListItemTiers { get; set; } = null!;

    // Budgets
    public DbSet<PurchaseBudget> PurchaseBudgets { get; set; } = null!;
    public DbSet<PurchaseBudgetRevision> PurchaseBudgetRevisions { get; set; } = null!;
    public DbSet<PurchaseBudgetTransaction> PurchaseBudgetTransactions { get; set; } = null!;

    // Supplier Evaluations
    public DbSet<SupplierEvaluation> SupplierEvaluations { get; set; } = null!;
    public DbSet<SupplierEvaluationCriteria> SupplierEvaluationCriteria { get; set; } = null!;
    public DbSet<SupplierEvaluationHistory> SupplierEvaluationHistory { get; set; } = null!;

    // Approval Workflows
    public DbSet<ApprovalWorkflowConfig> ApprovalWorkflowConfigs { get; set; } = null!;
    public DbSet<ApprovalWorkflowRule> ApprovalWorkflowRules { get; set; } = null!;
    public DbSet<ApprovalWorkflowStep> ApprovalWorkflowSteps { get; set; } = null!;
    public DbSet<ApprovalGroup> ApprovalGroups { get; set; } = null!;
    public DbSet<ApprovalGroupMember> ApprovalGroupMembers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("purchase");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PurchaseDbContext).Assembly);

        // Global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();

        if (tenantId.HasValue)
        {
            modelBuilder.Entity<Supplier>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierContact>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierProduct>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseRequest>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseRequestItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseOrder>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseOrderItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<GoodsReceipt>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<GoodsReceiptItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseInvoice>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseInvoiceItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseReturn>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseReturnItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierPayment>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Quotations
            modelBuilder.Entity<Quotation>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<QuotationItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<QuotationSupplier>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<QuotationSupplierItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Contracts
            modelBuilder.Entity<PurchaseContract>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseContractItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseContractPriceBreak>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Price Lists
            modelBuilder.Entity<PriceList>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PriceListItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PriceListItemTier>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Budgets
            modelBuilder.Entity<PurchaseBudget>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseBudgetRevision>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseBudgetTransaction>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Supplier Evaluations
            modelBuilder.Entity<SupplierEvaluation>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierEvaluationCriteria>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierEvaluationHistory>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Approval Workflows
            modelBuilder.Entity<ApprovalWorkflowConfig>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ApprovalWorkflowRule>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ApprovalWorkflowStep>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ApprovalGroup>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ApprovalGroupMember>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        var tenantId = _tenantService.GetCurrentTenantId();

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
