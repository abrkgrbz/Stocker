using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumnsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add soft delete columns to all Inventory tables using idempotent SQL
            var tables = new[]
            {
                "audit_logs",
                "BarcodeDefinitions",
                "Brands",
                "Categories",
                "ConsignmentStocks",
                "ConsignmentStockMovements",
                "CycleCounts",
                "CycleCountItems",
                "InventoryAdjustments",
                "InventoryAdjustmentItems",
                "Locations",
                "LotBatches",
                "PackagingTypes",
                "PriceLists",
                "PriceListItems",
                "ProcessedRequests",
                "Products",
                "ProductAttributes",
                "ProductAttributeOptions",
                "ProductAttributeValues",
                "ProductBundles",
                "ProductBundleItems",
                "ProductImages",
                "ProductVariants",
                "ProductVariantOptions",
                "QualityControls",
                "QualityControlAttachment",
                "QualityControlItems",
                "reorder_rules",
                "reorder_suggestions",
                "SerialNumbers",
                "ShelfLives",
                "Stocks",
                "StockCounts",
                "StockCountItems",
                "StockMovements",
                "StockReservations",
                "StockTransfers",
                "StockTransferItems",
                "Suppliers",
                "SupplierProducts",
                "SupplierProductPriceTiers",
                "Units",
                "Warehouses",
                "WarehouseZones"
            };

            foreach (var tableName in tables)
            {
                AddSoftDeleteColumnsToTable(migrationBuilder, "inventory", tableName);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var tables = new[]
            {
                "audit_logs",
                "BarcodeDefinitions",
                "Brands",
                "Categories",
                "ConsignmentStocks",
                "ConsignmentStockMovements",
                "CycleCounts",
                "CycleCountItems",
                "InventoryAdjustments",
                "InventoryAdjustmentItems",
                "Locations",
                "LotBatches",
                "PackagingTypes",
                "PriceLists",
                "PriceListItems",
                "ProcessedRequests",
                "Products",
                "ProductAttributes",
                "ProductAttributeOptions",
                "ProductAttributeValues",
                "ProductBundles",
                "ProductBundleItems",
                "ProductImages",
                "ProductVariants",
                "ProductVariantOptions",
                "QualityControls",
                "QualityControlAttachment",
                "QualityControlItems",
                "reorder_rules",
                "reorder_suggestions",
                "SerialNumbers",
                "ShelfLives",
                "Stocks",
                "StockCounts",
                "StockCountItems",
                "StockMovements",
                "StockReservations",
                "StockTransfers",
                "StockTransferItems",
                "Suppliers",
                "SupplierProducts",
                "SupplierProductPriceTiers",
                "Units",
                "Warehouses",
                "WarehouseZones"
            };

            foreach (var tableName in tables)
            {
                RemoveSoftDeleteColumnsFromTable(migrationBuilder, "inventory", tableName);
            }
        }

        private static void AddSoftDeleteColumnsToTable(MigrationBuilder migrationBuilder, string schema, string tableName)
        {
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE {schema}.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE {schema}.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE {schema}.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
        }

        private static void RemoveSoftDeleteColumnsFromTable(MigrationBuilder migrationBuilder, string schema, string tableName)
        {
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE {schema}.""{tableName}"" DROP COLUMN ""IsDeleted"";
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE {schema}.""{tableName}"" DROP COLUMN ""DeletedAt"";
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = '{schema}' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE {schema}.""{tableName}"" DROP COLUMN ""DeletedBy"";
                    END IF;
                END $$;
            ");
        }
    }
}
