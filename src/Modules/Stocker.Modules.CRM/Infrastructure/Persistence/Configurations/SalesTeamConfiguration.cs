using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class SalesTeamConfiguration : IEntityTypeConfiguration<SalesTeam>
{
    public void Configure(EntityTypeBuilder<SalesTeam> builder)
    {
        builder.ToTable("SalesTeams", "crm");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.TeamLeaderName)
            .HasMaxLength(200);

        builder.Property(s => s.SalesTarget)
            .HasPrecision(18, 2);

        builder.Property(s => s.TargetPeriod)
            .HasMaxLength(50);

        builder.Property(s => s.Currency)
            .HasMaxLength(3);

        builder.Property(s => s.TerritoryNames)
            .HasMaxLength(500);

        builder.Property(s => s.TeamEmail)
            .HasMaxLength(255);

        builder.Property(s => s.CommunicationChannel)
            .HasMaxLength(255);

        // Relationships
        builder.HasOne(s => s.ParentTeam)
            .WithMany()
            .HasForeignKey(s => s.ParentTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Territory)
            .WithMany()
            .HasForeignKey(s => s.TerritoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(s => s.Members)
            .WithOne(m => m.SalesTeam)
            .HasForeignKey(m => m.SalesTeamId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.Code }).IsUnique();
        builder.HasIndex(s => new { s.TenantId, s.IsActive });
        builder.HasIndex(s => new { s.TenantId, s.TeamLeaderId });
    }
}

public class SalesTeamMemberConfiguration : IEntityTypeConfiguration<SalesTeamMember>
{
    public void Configure(EntityTypeBuilder<SalesTeamMember> builder)
    {
        builder.ToTable("SalesTeamMembers", "crm");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .ValueGeneratedNever();

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.UserName)
            .HasMaxLength(200);

        builder.Property(m => m.IndividualTarget)
            .HasPrecision(18, 2);

        builder.Property(m => m.CommissionRate)
            .HasPrecision(5, 2);

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => new { m.SalesTeamId, m.UserId, m.IsActive });
    }
}
