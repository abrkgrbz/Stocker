using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class ChatMessageConfiguration : BaseEntityTypeConfiguration<ChatMessage>
{
    public override void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        base.Configure(builder);

        builder.ToTable("ChatMessages", "tenant");

        // Properties
        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.SenderId)
            .IsRequired();

        builder.Property(m => m.SenderName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(m => m.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(m => m.RoomName)
            .HasMaxLength(256);

        builder.Property(m => m.RecipientId)
            .IsRequired(false);

        builder.Property(m => m.RecipientName)
            .HasMaxLength(256);

        builder.Property(m => m.IsPrivate)
            .IsRequired();

        builder.Property(m => m.SentAt)
            .IsRequired();

        builder.Property(m => m.IsRead)
            .IsRequired();

        builder.Property(m => m.ReadAt)
            .IsRequired(false);

        builder.Property(m => m.IsDeleted)
            .IsRequired();

        builder.Property(m => m.DeletedAt)
            .IsRequired(false);

        builder.Property(m => m.MessageType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(m => m.AttachmentUrl)
            .HasMaxLength(1000);

        builder.Property(m => m.AttachmentName)
            .HasMaxLength(256);

        // Indexes for efficient querying
        builder.HasIndex(m => m.TenantId)
            .HasDatabaseName("IX_ChatMessages_TenantId");

        builder.HasIndex(m => m.SenderId)
            .HasDatabaseName("IX_ChatMessages_SenderId");

        builder.HasIndex(m => m.RecipientId)
            .HasDatabaseName("IX_ChatMessages_RecipientId");

        builder.HasIndex(m => m.RoomName)
            .HasDatabaseName("IX_ChatMessages_RoomName");

        builder.HasIndex(m => m.SentAt)
            .IsDescending()
            .HasDatabaseName("IX_ChatMessages_SentAt");

        builder.HasIndex(m => m.IsPrivate)
            .HasDatabaseName("IX_ChatMessages_IsPrivate");

        builder.HasIndex(m => m.IsRead)
            .HasDatabaseName("IX_ChatMessages_IsRead");

        builder.HasIndex(m => m.IsDeleted)
            .HasDatabaseName("IX_ChatMessages_IsDeleted");

        // Composite indexes for common queries
        // Room messages query: Get messages for a specific room
        builder.HasIndex(m => new { m.TenantId, m.RoomName, m.SentAt })
            .HasDatabaseName("IX_ChatMessages_TenantId_RoomName_SentAt");

        // Private messages query: Get private messages between two users
        builder.HasIndex(m => new { m.TenantId, m.SenderId, m.RecipientId, m.SentAt })
            .HasDatabaseName("IX_ChatMessages_TenantId_SenderId_RecipientId_SentAt");

        // Unread messages query
        builder.HasIndex(m => new { m.TenantId, m.RecipientId, m.IsRead, m.IsDeleted })
            .HasDatabaseName("IX_ChatMessages_TenantId_RecipientId_IsRead_IsDeleted");
    }
}
