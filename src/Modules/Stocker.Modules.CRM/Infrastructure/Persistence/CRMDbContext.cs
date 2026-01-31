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
    private readonly IBackgroundTenantService? _backgroundTenantService;

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

    // Communication Hub
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Reminder> Reminders { get; set; } = null!;

    // Communication & Activity Tracking
    public DbSet<CallLog> CallLogs { get; set; } = null!;
    public DbSet<Meeting> Meetings { get; set; } = null!;
    public DbSet<MeetingAttendee> MeetingAttendees { get; set; } = null!;

    // Sales Organization
    public DbSet<SalesTeam> SalesTeams { get; set; } = null!;
    public DbSet<SalesTeamMember> SalesTeamMembers { get; set; } = null!;
    public DbSet<Territory> Territories { get; set; } = null!;
    public DbSet<TerritoryAssignment> TerritoryAssignments { get; set; } = null!;

    // Competition Analysis
    public DbSet<Competitor> Competitors { get; set; } = null!;
    public DbSet<CompetitorProduct> CompetitorProducts { get; set; } = null!;
    public DbSet<CompetitorStrength> CompetitorStrengths { get; set; } = null!;
    public DbSet<CompetitorWeakness> CompetitorWeaknesses { get; set; } = null!;

    // Customer Engagement
    public DbSet<ProductInterest> ProductInterests { get; set; } = null!;
    public DbSet<Referral> Referrals { get; set; } = null!;
    public DbSet<SurveyResponse> SurveyResponses { get; set; } = null!;
    public DbSet<SurveyAnswer> SurveyAnswers { get; set; } = null!;

    // Loyalty & Social
    public DbSet<LoyaltyProgram> LoyaltyPrograms { get; set; } = null!;
    public DbSet<LoyaltyTier> LoyaltyTiers { get; set; } = null!;
    public DbSet<LoyaltyReward> LoyaltyRewards { get; set; } = null!;
    public DbSet<LoyaltyMembership> LoyaltyMemberships { get; set; } = null!;
    public DbSet<LoyaltyTransaction> LoyaltyTransactions { get; set; } = null!;
    public DbSet<SocialMediaProfile> SocialMediaProfiles { get; set; } = null!;

    public CRMDbContext(
        DbContextOptions<CRMDbContext> options,
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

        // Set default schema for CRM module
        modelBuilder.HasDefaultSchema("crm");

        // IMPORTANT: Configure Account entity BEFORE ApplyConfigurationsFromAssembly
        // to prevent EF Core from inferring foreign keys from navigation properties
        // Account entity with BillingAddress and ShippingAddress
        modelBuilder.Entity<Account>(entity =>
        {
            // Explicitly set table name with lowercase schema
            entity.ToTable("Accounts", "crm");

            entity.OwnsOne(a => a.BillingAddress, address =>
            {
                address.Property(a => a.Street).HasColumnName("BillingStreet").HasMaxLength(500);
                address.Property(a => a.City).HasColumnName("BillingCity").HasMaxLength(200);
                address.Property(a => a.State).HasColumnName("BillingState").HasMaxLength(200);
                address.Property(a => a.PostalCode).HasColumnName("BillingPostalCode").HasMaxLength(20);
                address.Property(a => a.Country).HasColumnName("BillingCountry").HasMaxLength(100);
            });
            entity.OwnsOne(a => a.ShippingAddress, address =>
            {
                address.Property(a => a.Street).HasColumnName("ShippingStreet").HasMaxLength(500);
                address.Property(a => a.City).HasColumnName("ShippingCity").HasMaxLength(200);
                address.Property(a => a.State).HasColumnName("ShippingState").HasMaxLength(200);
                address.Property(a => a.PostalCode).HasColumnName("ShippingPostalCode").HasMaxLength(20);
                address.Property(a => a.Country).HasColumnName("ShippingCountry").HasMaxLength(100);
            });
            entity.HasOne(a => a.ParentAccount)
                .WithMany()
                .HasForeignKey(a => a.ParentAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Ignore navigation properties that would cause EF Core to infer foreign keys
            // These collections are for domain logic only, not for database relationships
            // Contacts are associated with Customer, not Account
            entity.Ignore(a => a.Contacts);
            entity.Ignore(a => a.Opportunities);
            entity.Ignore(a => a.Deals);
            entity.Ignore(a => a.Activities);
            entity.Ignore(a => a.Notes);
        });

        // Apply configurations from assembly AFTER Account is configured
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CRMDbContext).Assembly);

        // Contract entity with BillingAddress
        modelBuilder.Entity<Contract>(entity =>
        {
            entity.OwnsOne(c => c.BillingAddress, address =>
            {
                address.Property(a => a.Street).HasColumnName("BillingStreet").HasMaxLength(500);
                address.Property(a => a.City).HasColumnName("BillingCity").HasMaxLength(200);
                address.Property(a => a.State).HasColumnName("BillingState").HasMaxLength(200);
                address.Property(a => a.PostalCode).HasColumnName("BillingPostalCode").HasMaxLength(20);
                address.Property(a => a.Country).HasColumnName("BillingCountry").HasMaxLength(100);
            });
            entity.HasOne(c => c.Account)
                .WithMany(a => a.Contracts)
                .HasForeignKey(c => c.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Quote entity with BillingAddress and ShippingAddress
        modelBuilder.Entity<Quote>(entity =>
        {
            entity.OwnsOne(q => q.BillingAddress, address =>
            {
                address.Property(a => a.Street).HasColumnName("BillingStreet").HasMaxLength(500);
                address.Property(a => a.City).HasColumnName("BillingCity").HasMaxLength(200);
                address.Property(a => a.State).HasColumnName("BillingState").HasMaxLength(200);
                address.Property(a => a.PostalCode).HasColumnName("BillingPostalCode").HasMaxLength(20);
                address.Property(a => a.Country).HasColumnName("BillingCountry").HasMaxLength(100);
            });
            entity.OwnsOne(q => q.ShippingAddress, address =>
            {
                address.Property(a => a.Street).HasColumnName("ShippingStreet").HasMaxLength(500);
                address.Property(a => a.City).HasColumnName("ShippingCity").HasMaxLength(200);
                address.Property(a => a.State).HasColumnName("ShippingState").HasMaxLength(200);
                address.Property(a => a.PostalCode).HasColumnName("ShippingPostalCode").HasMaxLength(20);
                address.Property(a => a.Country).HasColumnName("ShippingCountry").HasMaxLength(100);
            });
            entity.HasOne(q => q.Account)
                .WithMany()
                .HasForeignKey(q => q.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Ticket entity with Account relationship
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasOne(t => t.Account)
                .WithMany()
                .HasForeignKey(t => t.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            // Core entities
            modelBuilder.Entity<Customer>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Contact>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Lead>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Account>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Contract>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Quote>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Ticket>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            
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

            // Communication & Activity Tracking
            modelBuilder.Entity<CallLog>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Meeting>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<MeetingAttendee>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Sales Organization
            modelBuilder.Entity<SalesTeam>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SalesTeamMember>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Territory>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<TerritoryAssignment>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Competition Analysis
            modelBuilder.Entity<Competitor>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CompetitorProduct>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CompetitorStrength>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CompetitorWeakness>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Customer Engagement
            modelBuilder.Entity<ProductInterest>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Referral>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SurveyResponse>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SurveyAnswer>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Loyalty & Social
            modelBuilder.Entity<LoyaltyProgram>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LoyaltyTier>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LoyaltyReward>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LoyaltyMembership>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<LoyaltyTransaction>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SocialMediaProfile>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Communication Hub
            modelBuilder.Entity<Notification>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Reminder>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        // Try BackgroundTenantService first (for MassTransit consumers), then ITenantService (for HTTP requests)
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