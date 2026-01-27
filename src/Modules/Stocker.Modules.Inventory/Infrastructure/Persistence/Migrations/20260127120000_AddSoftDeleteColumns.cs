using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Product Management tables
            AddSoftDeleteColumns(migrationBuilder, "Products");
            AddSoftDeleteColumns(migrationBuilder, "Categories");
            AddSoftDeleteColumns(migrationBuilder, "Brands");
            AddSoftDeleteColumns(migrationBuilder, "Units");
            AddSoftDeleteColumns(migrationBuilder, "ProductImages");
            AddSoftDeleteColumns(migrationBuilder, "ProductBundles");
            AddSoftDeleteColumns(migrationBuilder, "ProductBundleItems");
            AddSoftDeleteColumns(migrationBuilder, "ProductVariants");
            AddSoftDeleteColumns(migrationBuilder, "ProductVariantOptions");

            // Product Attribute tables
            AddSoftDeleteColumns(migrationBuilder, "ProductAttributes");
            AddSoftDeleteColumns(migrationBuilder, "ProductAttributeOptions");
            AddSoftDeleteColumns(migrationBuilder, "ProductAttributeValues");

            // Warehouse Management tables
            AddSoftDeleteColumns(migrationBuilder, "Warehouses");
            AddSoftDeleteColumns(migrationBuilder, "Locations");

            // Stock Management tables
            AddSoftDeleteColumns(migrationBuilder, "Stocks");
            AddSoftDeleteColumns(migrationBuilder, "StockMovements");
            AddSoftDeleteColumns(migrationBuilder, "StockReservations");

            // Stock Transfer tables
            AddSoftDeleteColumns(migrationBuilder, "StockTransfers");
            AddSoftDeleteColumns(migrationBuilder, "StockTransferItems");

            // Stock Count tables
            AddSoftDeleteColumns(migrationBuilder, "StockCounts");
            AddSoftDeleteColumns(migrationBuilder, "StockCountItems");

            // Supplier tables
            AddSoftDeleteColumns(migrationBuilder, "Suppliers");
            AddSoftDeleteColumns(migrationBuilder, "SupplierProducts");
            AddSoftDeleteColumns(migrationBuilder, "SupplierProductPriceTiers");

            // Price Management tables
            AddSoftDeleteColumns(migrationBuilder, "PriceLists");
            AddSoftDeleteColumns(migrationBuilder, "PriceListItems");

            // Lot/Batch and Serial Number tables
            AddSoftDeleteColumns(migrationBuilder, "LotBatches");
            AddSoftDeleteColumns(migrationBuilder, "SerialNumbers");

            // Auto-Reorder tables
            AddSoftDeleteColumns(migrationBuilder, "ReorderRules");
            AddSoftDeleteColumns(migrationBuilder, "ReorderSuggestions");

            // Additional feature tables
            AddSoftDeleteColumns(migrationBuilder, "BarcodeDefinitions");
            AddSoftDeleteColumns(migrationBuilder, "PackagingTypes");
            AddSoftDeleteColumns(migrationBuilder, "WarehouseZones");
            AddSoftDeleteColumns(migrationBuilder, "ShelfLives");

            // Quality Control tables
            AddSoftDeleteColumns(migrationBuilder, "QualityControls");
            AddSoftDeleteColumns(migrationBuilder, "QualityControlItems");

            // Consignment Stock tables
            AddSoftDeleteColumns(migrationBuilder, "ConsignmentStocks");
            AddSoftDeleteColumns(migrationBuilder, "ConsignmentStockMovements");

            // Cycle Count tables
            AddSoftDeleteColumns(migrationBuilder, "CycleCounts");
            AddSoftDeleteColumns(migrationBuilder, "CycleCountItems");

            // Inventory Adjustment tables
            AddSoftDeleteColumns(migrationBuilder, "InventoryAdjustments");
            AddSoftDeleteColumns(migrationBuilder, "InventoryAdjustmentItems");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Product Management tables
            RemoveSoftDeleteColumns(migrationBuilder, "Products");
            RemoveSoftDeleteColumns(migrationBuilder, "Categories");
            RemoveSoftDeleteColumns(migrationBuilder, "Brands");
            RemoveSoftDeleteColumns(migrationBuilder, "Units");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductImages");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductBundles");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductBundleItems");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductVariants");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductVariantOptions");

            // Product Attribute tables
            RemoveSoftDeleteColumns(migrationBuilder, "ProductAttributes");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductAttributeOptions");
            RemoveSoftDeleteColumns(migrationBuilder, "ProductAttributeValues");

            // Warehouse Management tables
            RemoveSoftDeleteColumns(migrationBuilder, "Warehouses");
            RemoveSoftDeleteColumns(migrationBuilder, "Locations");

            // Stock Management tables
            RemoveSoftDeleteColumns(migrationBuilder, "Stocks");
            RemoveSoftDeleteColumns(migrationBuilder, "StockMovements");
            RemoveSoftDeleteColumns(migrationBuilder, "StockReservations");

            // Stock Transfer tables
            RemoveSoftDeleteColumns(migrationBuilder, "StockTransfers");
            RemoveSoftDeleteColumns(migrationBuilder, "StockTransferItems");

            // Stock Count tables
            RemoveSoftDeleteColumns(migrationBuilder, "StockCounts");
            RemoveSoftDeleteColumns(migrationBuilder, "StockCountItems");

            // Supplier tables
            RemoveSoftDeleteColumns(migrationBuilder, "Suppliers");
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierProducts");
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierProductPriceTiers");

            // Price Management tables
            RemoveSoftDeleteColumns(migrationBuilder, "PriceLists");
            RemoveSoftDeleteColumns(migrationBuilder, "PriceListItems");

            // Lot/Batch and Serial Number tables
            RemoveSoftDeleteColumns(migrationBuilder, "LotBatches");
            RemoveSoftDeleteColumns(migrationBuilder, "SerialNumbers");

            // Auto-Reorder tables
            RemoveSoftDeleteColumns(migrationBuilder, "ReorderRules");
            RemoveSoftDeleteColumns(migrationBuilder, "ReorderSuggestions");

            // Additional feature tables
            RemoveSoftDeleteColumns(migrationBuilder, "BarcodeDefinitions");
            RemoveSoftDeleteColumns(migrationBuilder, "PackagingTypes");
            RemoveSoftDeleteColumns(migrationBuilder, "WarehouseZones");
            RemoveSoftDeleteColumns(migrationBuilder, "ShelfLives");

            // Quality Control tables
            RemoveSoftDeleteColumns(migrationBuilder, "QualityControls");
            RemoveSoftDeleteColumns(migrationBuilder, "QualityControlItems");

            // Consignment Stock tables
            RemoveSoftDeleteColumns(migrationBuilder, "ConsignmentStocks");
            RemoveSoftDeleteColumns(migrationBuilder, "ConsignmentStockMovements");

            // Cycle Count tables
            RemoveSoftDeleteColumns(migrationBuilder, "CycleCounts");
            RemoveSoftDeleteColumns(migrationBuilder, "CycleCountItems");

            // Inventory Adjustment tables
            RemoveSoftDeleteColumns(migrationBuilder, "InventoryAdjustments");
            RemoveSoftDeleteColumns(migrationBuilder, "InventoryAdjustmentItems");
        }

        private static void AddSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "inventory",
                table: tableName,
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "inventory",
                table: tableName,
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "inventory",
                table: tableName,
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        private static void RemoveSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "inventory",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "inventory",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "inventory",
                table: tableName);
        }
    }
}
