using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDisasterResilienceChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add SequenceNumber column to StockMovements
            migrationBuilder.AddColumn<long>(
                name: "SequenceNumber",
                schema: "inventory",
                table: "StockMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            // 2. Add unique compound index for clock-skew-independent ordering
            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_ProductId_WarehouseId_SequenceNumber",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "ProductId", "WarehouseId", "SequenceNumber" },
                unique: true);

            // 3. Change Warehouse → Locations FK from Cascade to Restrict
            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 4. Change Warehouse → Zones FK from Cascade to Restrict
            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert Warehouse → Zones FK back to Cascade
            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Revert Warehouse → Locations FK back to Cascade
            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Remove sequence number index
            migrationBuilder.DropIndex(
                name: "IX_StockMovements_TenantId_ProductId_WarehouseId_SequenceNumber",
                schema: "inventory",
                table: "StockMovements");

            // Remove SequenceNumber column
            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                schema: "inventory",
                table: "StockMovements");
        }
    }
}
