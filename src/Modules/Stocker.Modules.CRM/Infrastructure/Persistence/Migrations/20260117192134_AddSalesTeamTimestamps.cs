using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesTeamTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "crm",
                table: "SalesTeams",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "crm",
                table: "SalesTeams",
                type: "timestamp with time zone",
                nullable: true);

            // Update existing records with current timestamp
            migrationBuilder.Sql("UPDATE crm.\"SalesTeams\" SET \"CreatedAt\" = NOW() WHERE \"CreatedAt\" = '0001-01-01 00:00:00'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "crm",
                table: "SalesTeams");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "crm",
                table: "SalesTeams");
        }
    }
}
