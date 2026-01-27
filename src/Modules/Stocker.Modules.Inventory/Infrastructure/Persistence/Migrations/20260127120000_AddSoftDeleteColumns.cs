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
            AddSoftDeleteColumnsToTable(migrationBuilder, "Products");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Categories");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Brands");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Units");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductImages");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductBundles");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductBundleItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductVariants");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductVariantOptions");

            // Product Attribute tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductAttributes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductAttributeOptions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ProductAttributeValues");

            // Warehouse Management tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Warehouses");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Locations");

            // Stock Management tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Stocks");
            AddSoftDeleteColumnsToTable(migrationBuilder, "StockMovements");
            AddSoftDeleteColumnsToTable(migrationBuilder, "StockReservations");

            // Stock Transfer tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "StockTransfers");
            AddSoftDeleteColumnsToTable(migrationBuilder, "StockTransferItems");

            // Stock Count tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "StockCounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "StockCountItems");

            // Supplier tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Suppliers");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierProducts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierProductPriceTiers");

            // Price Management tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceLists");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceListItems");

            // Lot/Batch and Serial Number tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "LotBatches");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SerialNumbers");

            // Auto-Reorder tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "ReorderRules");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ReorderSuggestions");

            // Additional feature tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "BarcodeDefinitions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PackagingTypes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "WarehouseZones");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ShelfLives");

            // Quality Control tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "QualityControls");
            AddSoftDeleteColumnsToTable(migrationBuilder, "QualityControlItems");

            // Consignment Stock tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "ConsignmentStocks");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ConsignmentStockMovements");

            // Cycle Count tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "CycleCounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CycleCountItems");

            // Inventory Adjustment tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "InventoryAdjustments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "InventoryAdjustmentItems");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Product Management tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Products");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Categories");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Brands");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Units");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductImages");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductBundles");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductBundleItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductVariants");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductVariantOptions");

            // Product Attribute tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductAttributes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductAttributeOptions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ProductAttributeValues");

            // Warehouse Management tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Warehouses");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Locations");

            // Stock Management tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Stocks");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "StockMovements");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "StockReservations");

            // Stock Transfer tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "StockTransfers");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "StockTransferItems");

            // Stock Count tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "StockCounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "StockCountItems");

            // Supplier tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Suppliers");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierProducts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierProductPriceTiers");

            // Price Management tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceLists");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceListItems");

            // Lot/Batch and Serial Number tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "LotBatches");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SerialNumbers");

            // Auto-Reorder tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ReorderRules");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ReorderSuggestions");

            // Additional feature tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BarcodeDefinitions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PackagingTypes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "WarehouseZones");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ShelfLives");

            // Quality Control tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QualityControls");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QualityControlItems");

            // Consignment Stock tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ConsignmentStocks");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ConsignmentStockMovements");

            // Cycle Count tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CycleCounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CycleCountItems");

            // Inventory Adjustment tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InventoryAdjustments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InventoryAdjustmentItems");
        }

        private static void AddSoftDeleteColumnsToTable(MigrationBuilder migrationBuilder, string tableName)
        {
            // Use conditional SQL to avoid errors if table doesn't exist or columns already exist
            // PostgreSQL stores identifiers in lowercase in information_schema
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    -- Only add column if table exists and column doesn't exist
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'inventory' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'inventory' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE inventory.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'inventory' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'inventory' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE inventory.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'inventory' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'inventory' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE inventory.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
        }

        private static void RemoveSoftDeleteColumnsFromTable(MigrationBuilder migrationBuilder, string tableName)
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
