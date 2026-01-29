using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantModuleTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentUserCount",
                schema: "master",
                table: "Tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EnabledModuleCodes",
                schema: "master",
                table: "Tenants",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxUsers",
                schema: "master",
                table: "Tenants",
                type: "integer",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentUserCount",
                schema: "master",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "EnabledModuleCodes",
                schema: "master",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "MaxUsers",
                schema: "master",
                table: "Tenants");
        }
    }
}
