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
