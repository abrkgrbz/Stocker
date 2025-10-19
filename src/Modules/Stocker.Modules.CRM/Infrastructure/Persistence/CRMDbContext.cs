using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Infrastructure.Persistence;

/// <summary>
/// Database context for the CRM module
/// </summary>
public class CRMDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    // Core CRM Entities
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Contact> Contacts { get; set; } = null!;
    public DbSet<Lead> Leads { get; set; } = null!;
    
    // Opportunity Management
    public DbSet<Opportunity> Opportunities { get; set; } = null!;
    public DbSet<OpportunityProduct> OpportunityProducts { get; set; } = null!;
    
    // Deal Management
    public DbSet<Deal> Deals { get; set; } = null!;
    public DbSet<DealProduct> DealProducts { get; set; } = null!;
    
    // Activity Management
    public DbSet<Activity> Activities { get; set; } = null!;
    public DbSet<Note> Notes { get; set; } = null!;
    
    // Campaign Management
    public DbSet<Campaign> Campaigns { get; set; } = null!;
    public DbSet<CampaignMember> CampaignMembers { get; set; } = null!;
    
    // Pipeline Management
    public DbSet<Pipeline> Pipelines { get; set; } = null!;
    public DbSet<PipelineStage> PipelineStages { get; set; } = null!;
    
    // Lead Scoring
    public DbSet<LeadScoringRule> LeadScoringRules { get; set; } = null!;
    public DbSet<LeadScoringHistory> LeadScoringHistories { get; set; } = null!;

    // Customer Segmentation
    public DbSet<CustomerSegment> CustomerSegments { get; set; } = null!;
    public DbSet<CustomerSegmentMember> CustomerSegmentMembers { get; set; } = null!;
    public DbSet<CustomerTag> CustomerTags { get; set; } = null!;

    // Document Management
    public DbSet<Document> Documents { get; set; } = null!;

    // Workflow Automation
    public DbSet<Workflow> Workflows { get; set; } = null!;
    public DbSet<WorkflowStep> WorkflowSteps { get; set; } = null!;
    public DbSet<WorkflowExecution> WorkflowExecutions { get; set; } = null!;
    public DbSet<WorkflowStepExecution> WorkflowStepExecutions { get; set; } = null!;

    public CRMDbContext(
        DbContextOptions<CRMDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CRMDbContext).Assembly);

        // Set default schema for CRM module
        modelBuilder.HasDefaultSchema("crm");
        
        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            // Core entities
            modelBuilder.Entity<Customer>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Contact>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Lead>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
            // Opportunity entities
            modelBuilder.Entity<Opportunity>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<OpportunityProduct>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
            // Deal entities
            modelBuilder.Entity<Deal>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<DealProduct>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
            // Activity entities
            modelBuilder.Entity<Activity>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Note>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
            // Campaign entities
            modelBuilder.Entity<Campaign>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CampaignMember>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
            // Pipeline entities
            modelBuilder.Entity<Pipeline>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PipelineStage>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
            // Lead scoring entities
            modelBuilder.Entity<LeadScoringRule>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LeadScoringHistory>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Customer segmentation entities
            modelBuilder.Entity<CustomerSegment>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CustomerSegmentMember>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CustomerTag>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Document management entities
            modelBuilder.Entity<Document>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Workflow automation entities
            modelBuilder.Entity<Workflow>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<WorkflowExecution>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        var tenantId = _tenantService.GetCurrentTenantId();
        
        if (tenantId.HasValue)
        {
            foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                {
                    entry.Property(nameof(ITenantEntity.TenantId)).CurrentValue = tenantId.Value;
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}