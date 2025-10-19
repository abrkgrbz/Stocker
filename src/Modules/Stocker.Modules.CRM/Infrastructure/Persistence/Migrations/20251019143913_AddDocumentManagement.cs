using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId1",
                schema: "crm",
                table: "CustomerTags",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Documents",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    StoragePath = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    StorageProvider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    ParentDocumentId = table.Column<int>(type: "int", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AccessLevel = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    EncryptionKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_CustomerId1",
                schema: "crm",
                table: "CustomerTags",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Category",
                schema: "crm",
                table: "Documents",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Entity_Tenant",
                schema: "crm",
                table: "Documents",
                columns: new[] { "EntityId", "EntityType", "TenantId" });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_IsArchived",
                schema: "crm",
                table: "Documents",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ParentDocumentId",
                schema: "crm",
                table: "Documents",
                column: "ParentDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId",
                schema: "crm",
                table: "Documents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UploadedBy",
                schema: "crm",
                table: "Documents",
                column: "UploadedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerSegmentMembers_Customers_CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers",
                column: "CustomerId1",
                principalSchema: "CRM",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerTags_Customers_CustomerId1",
                schema: "crm",
                table: "CustomerTags",
                column: "CustomerId1",
                principalSchema: "CRM",
                principalTable: "Customers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerSegmentMembers_Customers_CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerTags_Customers_CustomerId1",
                schema: "crm",
                table: "CustomerTags");

            migrationBuilder.DropTable(
                name: "Documents",
                schema: "crm");

            migrationBuilder.DropIndex(
                name: "IX_CustomerTags_CustomerId1",
                schema: "crm",
                table: "CustomerTags");

            migrationBuilder.DropIndex(
                name: "IX_CustomerSegmentMembers_CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers");

            migrationBuilder.DropColumn(
                name: "CustomerId1",
                schema: "crm",
                table: "CustomerTags");

            migrationBuilder.DropColumn(
                name: "CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers");
        }
    }
}
