using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerGeoLocationFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CountryId",
                schema: "crm",
                table: "Customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CityId",
                schema: "crm",
                table: "Customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DistrictId",
                schema: "crm",
                table: "Customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "District",
                schema: "crm",
                table: "Customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_CountryId",
                schema: "crm",
                table: "Customers",
                columns: new[] { "TenantId", "CountryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_CityId",
                schema: "crm",
                table: "Customers",
                columns: new[] { "TenantId", "CityId" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_DistrictId",
                schema: "crm",
                table: "Customers",
                columns: new[] { "TenantId", "DistrictId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantId_CountryId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantId_CityId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantId_DistrictId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CountryId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CityId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "DistrictId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "District",
                schema: "crm",
                table: "Customers");
        }
    }
}
