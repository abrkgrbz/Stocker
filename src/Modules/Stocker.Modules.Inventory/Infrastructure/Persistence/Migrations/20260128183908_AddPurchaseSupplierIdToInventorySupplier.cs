using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseSupplierIdToInventorySupplier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PurchaseSupplierId",
                schema: "inventory",
                table: "Suppliers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_PurchaseSupplierId",
                schema: "inventory",
                table: "Suppliers",
                columns: new[] { "TenantId", "PurchaseSupplierId" },
                unique: true,
                filter: "\"PurchaseSupplierId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_PurchaseSupplierId",
                schema: "inventory",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "PurchaseSupplierId",
                schema: "inventory",
                table: "Suppliers");
        }
    }
}
