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

    public DbSet<CMSPage> Pages => Set<CMSPage>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<FAQCategory> FAQCategories => Set<FAQCategory>();
    public DbSet<FAQItem> FAQItems => Set<FAQItem>();
    public DbSet<CMSMedia> Media => Set<CMSMedia>();
    public DbSet<CMSSetting> Settings => Set<CMSSetting>();
    public DbSet<CMSUpdate> Updates => Set<CMSUpdate>();

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
    }
}
