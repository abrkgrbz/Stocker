using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.TenantDb
{
    /// <inheritdoc />
    public partial class AddChatMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChatMessages",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    RoomName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RecipientId = table.Column<Guid>(type: "uuid", nullable: true),
                    RecipientName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IsPrivate = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MessageType = table.Column<int>(type: "integer", nullable: false),
                    AttachmentUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AttachmentName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_IsDeleted",
                schema: "tenant",
                table: "ChatMessages",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_IsPrivate",
                schema: "tenant",
                table: "ChatMessages",
                column: "IsPrivate");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_IsRead",
                schema: "tenant",
                table: "ChatMessages",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_RecipientId",
                schema: "tenant",
                table: "ChatMessages",
                column: "RecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_RoomName",
                schema: "tenant",
                table: "ChatMessages",
                column: "RoomName");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderId",
                schema: "tenant",
                table: "ChatMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SentAt",
                schema: "tenant",
                table: "ChatMessages",
                column: "SentAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_TenantId",
                schema: "tenant",
                table: "ChatMessages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_TenantId_RecipientId_IsRead_IsDeleted",
                schema: "tenant",
                table: "ChatMessages",
                columns: new[] { "TenantId", "RecipientId", "IsRead", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_TenantId_RoomName_SentAt",
                schema: "tenant",
                table: "ChatMessages",
                columns: new[] { "TenantId", "RoomName", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_TenantId_SenderId_RecipientId_SentAt",
                schema: "tenant",
                table: "ChatMessages",
                columns: new[] { "TenantId", "SenderId", "RecipientId", "SentAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessages",
                schema: "tenant");
        }
    }
}
