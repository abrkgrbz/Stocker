using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddEmailTemplatesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    TemplateKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    HtmlBody = table.Column<string>(type: "text", maxLength: 256, nullable: false),
                    PlainTextBody = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "tr"),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Variables = table.Column<string>(type: "jsonb", maxLength: 256, nullable: false, defaultValue: "[]"),
                    SampleData = table.Column<string>(type: "jsonb", maxLength: 256, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_Category",
                schema: "master",
                table: "EmailTemplates",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_IsActive",
                schema: "master",
                table: "EmailTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_IsSystem",
                schema: "master",
                table: "EmailTemplates",
                column: "IsSystem");

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_TemplateKey_Language_TenantId",
                schema: "master",
                table: "EmailTemplates",
                columns: new[] { "TemplateKey", "Language", "TenantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_TenantId",
                schema: "master",
                table: "EmailTemplates",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailTemplates",
                schema: "master");
        }
    }
}
