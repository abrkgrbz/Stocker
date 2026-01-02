using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTerritoryGeoLocationFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CityId",
                schema: "crm",
                table: "Territories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CountryId",
                schema: "crm",
                table: "Territories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DistrictId",
                schema: "crm",
                table: "Territories",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_CityId",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "CityId" });

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_CountryId",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "CountryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_DistrictId",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "DistrictId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Territories_TenantId_CityId",
                schema: "crm",
                table: "Territories");

            migrationBuilder.DropIndex(
                name: "IX_Territories_TenantId_CountryId",
                schema: "crm",
                table: "Territories");

            migrationBuilder.DropIndex(
                name: "IX_Territories_TenantId_DistrictId",
                schema: "crm",
                table: "Territories");

            migrationBuilder.DropColumn(
                name: "CityId",
                schema: "crm",
                table: "Territories");

            migrationBuilder.DropColumn(
                name: "CountryId",
                schema: "crm",
                table: "Territories");

            migrationBuilder.DropColumn(
                name: "DistrictId",
                schema: "crm",
                table: "Territories");
        }
    }
}
