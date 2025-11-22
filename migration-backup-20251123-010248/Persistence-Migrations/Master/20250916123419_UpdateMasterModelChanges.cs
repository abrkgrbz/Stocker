using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class UpdateMasterModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminEmail",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdminFirstName",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdminLastName",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdminPhone",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdminTitle",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdminUsername",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BillingCycle",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyCode",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PackageName",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminEmail",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "AdminFirstName",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "AdminLastName",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "AdminPhone",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "AdminTitle",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "AdminUsername",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "BillingCycle",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "CompanyCode",
                schema: "Master",
                table: "TenantRegistrations");

            migrationBuilder.DropColumn(
                name: "PackageName",
                schema: "Master",
                table: "TenantRegistrations");
        }
    }
}
