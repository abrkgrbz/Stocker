using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddCompanyAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressApartment",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "AddressBuilding",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "AddressFloor",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "AddressState",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "AddressStreet",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "AddressDistrict",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AddressLine",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressDistrict",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "AddressLine",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "AddressApartment",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressBuilding",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressFloor",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressState",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressStreet",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
