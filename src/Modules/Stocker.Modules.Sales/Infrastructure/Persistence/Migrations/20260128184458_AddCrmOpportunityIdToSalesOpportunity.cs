using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCrmOpportunityIdToSalesOpportunity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CrmOpportunityId",
                schema: "sales",
                table: "Opportunities",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_CrmOpportunityId",
                schema: "sales",
                table: "Opportunities",
                columns: new[] { "TenantId", "CrmOpportunityId" },
                unique: true,
                filter: "\"CrmOpportunityId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Opportunities_TenantId_CrmOpportunityId",
                schema: "sales",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "CrmOpportunityId",
                schema: "sales",
                table: "Opportunities");
        }
    }
}
