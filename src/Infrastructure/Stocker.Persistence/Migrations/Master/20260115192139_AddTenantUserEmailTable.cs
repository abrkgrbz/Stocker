using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantUserEmailTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "TenantLimits",
                schema: "Master",
                newName: "TenantLimits",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "TenantHealthChecks",
                schema: "Master",
                newName: "TenantHealthChecks",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "TenantContracts",
                schema: "Master",
                newName: "TenantContracts",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "TenantBillings",
                schema: "Master",
                newName: "TenantBillings",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "MigrationValidationResults",
                schema: "Master",
                newName: "MigrationValidationResults",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "MigrationSessions",
                schema: "Master",
                newName: "MigrationSessions",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "MigrationChunks",
                schema: "Master",
                newName: "MigrationChunks",
                newSchema: "master");

            migrationBuilder.CreateTable(
                name: "TenantUserEmails",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActivated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUserEmails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantUserEmails_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantUserEmails_Email",
                schema: "master",
                table: "TenantUserEmails",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUserEmails_TenantId_TenantUserId",
                schema: "master",
                table: "TenantUserEmails",
                columns: new[] { "TenantId", "TenantUserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantUserEmails",
                schema: "master");

            migrationBuilder.EnsureSchema(
                name: "Master");

            migrationBuilder.RenameTable(
                name: "TenantLimits",
                schema: "master",
                newName: "TenantLimits",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "TenantHealthChecks",
                schema: "master",
                newName: "TenantHealthChecks",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "TenantContracts",
                schema: "master",
                newName: "TenantContracts",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "TenantBillings",
                schema: "master",
                newName: "TenantBillings",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "MigrationValidationResults",
                schema: "master",
                newName: "MigrationValidationResults",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "MigrationSessions",
                schema: "master",
                newName: "MigrationSessions",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "MigrationChunks",
                schema: "master",
                newName: "MigrationChunks",
                newSchema: "Master");
        }
    }
}
