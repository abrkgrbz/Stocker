using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Infrastructure.Persistence;

/// <summary>
/// DbContext for CMS module
/// </summary>
public class CMSDbContext : DbContext
{
    public const string Schema = "cms";

    public CMSDbContext(DbContextOptions<CMSDbContext> options) : base(options)
    {
    }

    // Core CMS Entities
    public DbSet<CMSPage> Pages => Set<CMSPage>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<FAQCategory> FAQCategories => Set<FAQCategory>();
    public DbSet<FAQItem> FAQItems => Set<FAQItem>();
    public DbSet<CMSMedia> Media => Set<CMSMedia>();
    public DbSet<CMSSetting> Settings => Set<CMSSetting>();
    public DbSet<CMSUpdate> Updates => Set<CMSUpdate>();

    // Landing Page Entities
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<PricingPlan> PricingPlans => Set<PricingPlan>();
    public DbSet<PricingFeature> PricingFeatures => Set<PricingFeature>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<Integration> Integrations => Set<Integration>();
    public DbSet<IntegrationItem> IntegrationItems => Set<IntegrationItem>();
    public DbSet<Stat> Stats => Set<Stat>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<Achievement> Achievements => Set<Achievement>();

    // Company Page Entities
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<CompanyValue> CompanyValues => Set<CompanyValue>();
    public DbSet<ContactInfo> ContactInfos => Set<ContactInfo>();

    // Documentation Entities
    public DbSet<DocCategory> DocCategories => Set<DocCategory>();
    public DbSet<DocArticle> DocArticles => Set<DocArticle>();

    // Social Entities
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema(Schema);

        // CMSPage
        modelBuilder.Entity<CMSPage>(entity =>
        {
            entity.ToTable("pages");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(200).IsRequired();
            entity.Property(e => e.MetaTitle).HasMaxLength(200);
            entity.Property(e => e.MetaDescription).HasMaxLength(500);
            entity.Property(e => e.MetaKeywords).HasMaxLength(500);
            entity.Property(e => e.Template).HasMaxLength(100);
        });

        // BlogCategory
        modelBuilder.Entity<BlogCategory>(entity =>
        {
            entity.ToTable("blog_categories");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // BlogPost
        modelBuilder.Entity<BlogPost>(entity =>
        {
            entity.ToTable("blog_posts");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Excerpt).HasMaxLength(1000);
            entity.Property(e => e.MetaTitle).HasMaxLength(200);
            entity.Property(e => e.MetaDescription).HasMaxLength(500);
            entity.Property(e => e.Author).HasMaxLength(100);
            entity.Property(e => e.ReadTime).HasMaxLength(20);
            entity.Property(e => e.Tags).HasMaxLength(500);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Posts)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // FAQCategory
        modelBuilder.Entity<FAQCategory>(entity =>
        {
            entity.ToTable("faq_categories");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Icon).HasMaxLength(50);
        });

        // FAQItem
        modelBuilder.Entity<FAQItem>(entity =>
        {
            entity.ToTable("faq_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Question).HasMaxLength(500).IsRequired();

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CMSMedia
        modelBuilder.Entity<CMSMedia>(entity =>
        {
            entity.ToTable("media");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.OriginalName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.MimeType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Url).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Folder).HasMaxLength(100);
            entity.Property(e => e.Alt).HasMaxLength(255);
            entity.Property(e => e.Caption).HasMaxLength(500);
        });

        // CMSSetting
        modelBuilder.Entity<CMSSetting>(entity =>
        {
            entity.ToTable("settings");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.Property(e => e.Key).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Group).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // CMSUpdate
        modelBuilder.Entity<CMSUpdate>(entity =>
        {
            entity.ToTable("updates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Version).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Type).HasMaxLength(50);
        });

        // ==================== Landing Page Entities ====================

        // Testimonial
        modelBuilder.Entity<Testimonial>(entity =>
        {
            entity.ToTable("testimonials");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(100);
            entity.Property(e => e.Company).HasMaxLength(100);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.Avatar).HasMaxLength(500);
        });

        // PricingPlan
        modelBuilder.Entity<PricingPlan>(entity =>
        {
            entity.ToTable("pricing_plans");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.OriginalPrice).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(10);
            entity.Property(e => e.BillingPeriod).HasMaxLength(20);
            entity.Property(e => e.Badge).HasMaxLength(50);
            entity.Property(e => e.ButtonText).HasMaxLength(50);
            entity.Property(e => e.ButtonUrl).HasMaxLength(200);
        });

        // PricingFeature
        modelBuilder.Entity<PricingFeature>(entity =>
        {
            entity.ToTable("pricing_features");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Value).HasMaxLength(100);

            entity.HasOne(e => e.Plan)
                .WithMany(p => p.Features)
                .HasForeignKey(e => e.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Feature
        modelBuilder.Entity<Feature>(entity =>
        {
            entity.ToTable("features");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.IconColor).HasMaxLength(50);
            entity.Property(e => e.Image).HasMaxLength(500);
            entity.Property(e => e.Category).HasMaxLength(100);
        });

        // Industry
        modelBuilder.Entity<Industry>(entity =>
        {
            entity.ToTable("industries");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Image).HasMaxLength(500);
            entity.Property(e => e.Color).HasMaxLength(100);
        });

        // Integration
        modelBuilder.Entity<Integration>(entity =>
        {
            entity.ToTable("integrations");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(100);
        });

        // IntegrationItem
        modelBuilder.Entity<IntegrationItem>(entity =>
        {
            entity.ToTable("integration_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Logo).HasMaxLength(500);
            entity.Property(e => e.Url).HasMaxLength(500);

            entity.HasOne(e => e.Integration)
                .WithMany(i => i.Items)
                .HasForeignKey(e => e.IntegrationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Stat
        modelBuilder.Entity<Stat>(entity =>
        {
            entity.ToTable("stats");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Label).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Value).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Suffix).HasMaxLength(20);
            entity.Property(e => e.Prefix).HasMaxLength(20);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Section).HasMaxLength(50);
        });

        // Partner
        modelBuilder.Entity<Partner>(entity =>
        {
            entity.ToTable("partners");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Logo).HasMaxLength(500);
            entity.Property(e => e.LogoDark).HasMaxLength(500);
            entity.Property(e => e.Url).HasMaxLength(500);
        });

        // Achievement
        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.ToTable("achievements");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Value).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.IconColor).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // ==================== Company Page Entities ====================

        // TeamMember
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.ToTable("team_members");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Bio).HasMaxLength(1000);
            entity.Property(e => e.Avatar).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.LinkedIn).HasMaxLength(300);
            entity.Property(e => e.Twitter).HasMaxLength(300);
        });

        // CompanyValue
        modelBuilder.Entity<CompanyValue>(entity =>
        {
            entity.ToTable("company_values");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.IconColor).HasMaxLength(50);
        });

        // ContactInfo
        modelBuilder.Entity<ContactInfo>(entity =>
        {
            entity.ToTable("contact_info");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Value).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.IconColor).HasMaxLength(100);
            entity.Property(e => e.Href).HasMaxLength(500);
            entity.Property(e => e.AdditionalInfo).HasMaxLength(200);
        });

        // ==================== Documentation Entities ====================

        // DocCategory
        modelBuilder.Entity<DocCategory>(entity =>
        {
            entity.ToTable("doc_categories");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(100);
        });

        // DocArticle
        modelBuilder.Entity<DocArticle>(entity =>
        {
            entity.ToTable("doc_articles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.MetaTitle).HasMaxLength(200);
            entity.Property(e => e.MetaDescription).HasMaxLength(500);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Articles)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==================== Social Entities ====================

        // SocialLink
        modelBuilder.Entity<SocialLink>(entity =>
        {
            entity.ToTable("social_links");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Platform).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Url).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Label).HasMaxLength(50);
        });
    }
}
