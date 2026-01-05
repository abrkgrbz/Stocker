using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCRM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "District",
                schema: "crm",
                table: "Competitors");

            migrationBuilder.DropColumn(
                name: "DistrictId",
                schema: "crm",
                table: "Competitors");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "crm",
                table: "Pipelines",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "crm",
                table: "Pipelines",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "crm",
                table: "Pipelines");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "crm",
                table: "Pipelines");

            migrationBuilder.AddColumn<string>(
                name: "District",
                schema: "crm",
                table: "Competitors",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DistrictId",
                schema: "crm",
                table: "Competitors",
                type: "uuid",
                nullable: true);
        }
    }
}
