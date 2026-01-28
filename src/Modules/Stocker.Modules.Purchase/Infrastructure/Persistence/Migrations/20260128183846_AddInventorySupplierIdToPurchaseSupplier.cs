using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInventorySupplierIdToPurchaseSupplier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InventorySupplierId",
                schema: "purchase",
                table: "Suppliers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_InventorySupplierId",
                schema: "purchase",
                table: "Suppliers",
                columns: new[] { "TenantId", "InventorySupplierId" },
                unique: true,
                filter: "\"InventorySupplierId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_InventorySupplierId",
                schema: "purchase",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "InventorySupplierId",
                schema: "purchase",
                table: "Suppliers");
        }
    }
}
