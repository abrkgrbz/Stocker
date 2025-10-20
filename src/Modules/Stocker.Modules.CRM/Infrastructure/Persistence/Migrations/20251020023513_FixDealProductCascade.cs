using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixDealProductCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the duplicate foreign key (DealId1) first to avoid circular cascade paths
            migrationBuilder.DropForeignKey(
                name: "FK_DealProducts_Deals_DealId1",
                schema: "crm",
                table: "DealProducts");

            // Drop the duplicate DealId1 column
            migrationBuilder.DropColumn(
                name: "DealId1",
                schema: "crm",
                table: "DealProducts");

            // Now fix the main DealId foreign key to use NO ACTION instead of CASCADE
            migrationBuilder.DropForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts");

            migrationBuilder.AddForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts",
                column: "DealId",
                principalSchema: "crm",
                principalTable: "Deals",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts");

            migrationBuilder.AddForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts",
                column: "DealId",
                principalSchema: "crm",
                principalTable: "Deals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
