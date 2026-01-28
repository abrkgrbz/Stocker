using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesOpportunityIdToCRMOpportunity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SalesOpportunityId",
                schema: "crm",
                table: "Opportunities",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_SalesOpportunityId",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "SalesOpportunityId" },
                unique: true,
                filter: "\"SalesOpportunityId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Opportunities_TenantId_SalesOpportunityId",
                schema: "crm",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "SalesOpportunityId",
                schema: "crm",
                table: "Opportunities");
        }
    }
}
