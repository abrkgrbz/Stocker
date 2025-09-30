using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class PasswordHistoryConfiguration : BaseEntityTypeConfiguration<PasswordHistory>
{
    public override void Configure(EntityTypeBuilder<PasswordHistory> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("PasswordHistories", "tenant");
        
        builder.Property(x => x.UserId)
            .IsRequired();
            
        builder.Property(x => x.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();
            
        builder.Property(x => x.Salt)
            .HasMaxLength(500)
            .IsRequired();
            
        // Password Details
        builder.Property(x => x.PasswordStrength)
            .IsRequired();
            
        builder.Property(x => x.Length)
            .IsRequired();
            
        builder.Property(x => x.HasUppercase)
            .IsRequired();
            
        builder.Property(x => x.HasLowercase)
            .IsRequired();
            
        builder.Property(x => x.HasNumbers)
            .IsRequired();
            
        builder.Property(x => x.HasSpecialCharacters)
            .IsRequired();
            
        builder.Property(x => x.HasRepeatingCharacters)
            .IsRequired();
            
        builder.Property(x => x.HasSequentialCharacters)
            .IsRequired();
            
        builder.Property(x => x.MeetsComplexityRequirements)
            .IsRequired();
            
        // Change Information
        builder.Property(x => x.ChangedAt)
            .IsRequired();
            
        builder.Property(x => x.ChangedBy)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.ChangeReason)
            .IsRequired();
            
        builder.Property(x => x.ChangeReasonDetails)
            .HasMaxLength(500);
            
        builder.Property(x => x.ChangedFromIP)
            .HasMaxLength(50);
            
        builder.Property(x => x.ChangedFromDevice)
            .HasMaxLength(200);
            
        builder.Property(x => x.ChangedFromLocation)
            .HasMaxLength(200);
            
        // Security
        builder.Property(x => x.WasCompromised)
            .IsRequired();
            
        builder.Property(x => x.CompromisedAt);
        
        builder.Property(x => x.CompromiseReason)
            .HasMaxLength(500);
            
        builder.Property(x => x.ForcedChange)
            .IsRequired();
        
        // Expiration
        builder.Property(x => x.ExpirationDate);
        
        builder.Property(x => x.WasExpired)
            .IsRequired();
            
        builder.Property(x => x.DaysUsed)
            .IsRequired();
            
        // Validation
        builder.Property(x => x.LastValidatedAt);
        
        builder.Property(x => x.FailedAttemptCount)
            .IsRequired();
            
        builder.Property(x => x.LastFailedAttemptAt);
        
        // Indexes
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.ChangedAt);
        builder.HasIndex(x => x.ChangeReason);
        builder.HasIndex(x => x.WasCompromised);
        builder.HasIndex(x => x.ExpirationDate);
        builder.HasIndex(x => new { x.UserId, x.ChangedAt });
    }
}