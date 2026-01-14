using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBackupTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "TenantBackups",
                schema: "Master",
                newName: "TenantBackups",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "BackupSchedules",
                schema: "Master",
                newName: "BackupSchedules",
                newSchema: "master");

            migrationBuilder.AddColumn<string>(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionModules_SubscriptionId_ModuleCode",
                schema: "master",
                table: "SubscriptionModules",
                columns: new[] { "SubscriptionId", "ModuleCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SubscriptionModules_SubscriptionId_ModuleCode",
                schema: "master",
                table: "SubscriptionModules");

            migrationBuilder.DropColumn(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages");

            migrationBuilder.RenameTable(
                name: "TenantBackups",
                schema: "master",
                newName: "TenantBackups",
                newSchema: "Master");

            migrationBuilder.RenameTable(
                name: "BackupSchedules",
                schema: "master",
                newName: "BackupSchedules",
                newSchema: "Master");
        }
    }
}
