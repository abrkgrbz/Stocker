using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceXminWithRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BarcodeDefinitions_PackagingTypes_PackagingTypeId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_BarcodeDefinitions_ProductVariants_ProductVariantId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_BarcodeDefinitions_Units_UnitId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Locations_LocationId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Products_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Suppliers_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Warehouses_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCountItems_Locations_LocationId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCountItems_Products_ProductId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCounts_Categories_CategoryId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCounts_WarehouseZones_ZoneId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCounts_Warehouses_WarehouseId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustmentItems_Products_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustments_Locations_LocationId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustments_StockCounts_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustments_Warehouses_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.DropForeignKey(
                name: "FK_LotBatches_Products_ProductId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_LotBatches_Suppliers_SupplierId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_QualityControls_Products_ProductId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropForeignKey(
                name: "FK_QualityControls_Suppliers_SupplierId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropForeignKey(
                name: "FK_QualityControls_Warehouses_WarehouseId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropForeignKey(
                name: "FK_SerialNumbers_Locations_LocationId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropForeignKey(
                name: "FK_SerialNumbers_Products_ProductId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropForeignKey(
                name: "FK_SerialNumbers_Warehouses_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropForeignKey(
                name: "FK_Stocks_LotBatches_LotBatchId",
                schema: "inventory",
                table: "Stocks");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierProducts_Products_ProductId1",
                schema: "inventory",
                table: "SupplierProducts");

            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones");

            migrationBuilder.DropIndex(
                name: "IX_SupplierProducts_ProductId1",
                schema: "inventory",
                table: "SupplierProducts");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                schema: "inventory",
                table: "SupplierProducts");

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "WarehouseZones",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Warehouses",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Units",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Suppliers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "SupplierProducts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "SupplierProductPriceTiers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "StockTransfers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "StockTransferItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Stocks",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "StockReservations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "StockMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "SequenceNumber",
                schema: "inventory",
                table: "StockMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "StockCounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "StockCountItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "StorageConditions",
                schema: "inventory",
                table: "ShelfLives",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MinSalesShelfLifePercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MinReceivingShelfLifePercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CriticalThresholdPercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AlertThresholdPercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ShelfLives",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "SupplierSerial",
                schema: "inventory",
                table: "SerialNumbers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Serial",
                schema: "inventory",
                table: "SerialNumbers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "SerialNumbers",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BatchNumber",
                schema: "inventory",
                table: "SerialNumbers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "SerialNumbers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "reorder_suggestions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "reorder_rules",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "SupplierNotification",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SampleQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RejectionReason",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "RejectedQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "QualityScore",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "QualityGrade",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "QcNumber",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "PurchaseOrderNumber",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InternalNotes",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectorName",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionStandard",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionNotes",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionLocation",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "InspectedQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "ActionDescription",
                schema: "inventory",
                table: "QualityControls",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AcceptedQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "QualityControls",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "Specification",
                schema: "inventory",
                table: "QualityControlItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "QualityControlItems",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MeasuredValue",
                schema: "inventory",
                table: "QualityControlItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckName",
                schema: "inventory",
                table: "QualityControlItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "AcceptanceCriteria",
                schema: "inventory",
                table: "QualityControlItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "QualityControlItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "FilePath",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductVariants",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductVariantOptions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Products",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductImages",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductBundles",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductBundleItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductAttributeValues",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductAttributes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductAttributeOptions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "PriceLists",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "PriceListItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "Width",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Volume",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,6)",
                precision: 18,
                scale: 6,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "inventory",
                table: "PackagingTypes",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxWeightCapacity",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxQuantity",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MaterialType",
                schema: "inventory",
                table: "PackagingTypes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Length",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Height",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "EmptyWeight",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "PackagingTypes",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DepositAmount",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DefaultQuantity",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "inventory",
                table: "PackagingTypes",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "BarcodePrefix",
                schema: "inventory",
                table: "PackagingTypes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "PackagingTypes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "SupplierLotNumber",
                schema: "inventory",
                table: "LotBatches",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ReservedQuantity",
                schema: "inventory",
                table: "LotBatches",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "QuarantineReason",
                schema: "inventory",
                table: "LotBatches",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "LotBatches",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "LotBatches",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "InspectionNotes",
                schema: "inventory",
                table: "LotBatches",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "InitialQuantity",
                schema: "inventory",
                table: "LotBatches",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "CurrentQuantity",
                schema: "inventory",
                table: "LotBatches",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "CertificateNumber",
                schema: "inventory",
                table: "LotBatches",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "LotBatches",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Locations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalCostImpact",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "RejectionReason",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceType",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InternalNotes",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "ApprovedBy",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AdjustmentNumber",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "AccountingNotes",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "SystemQuantity",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "SerialNumber",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ActualQuantity",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "ValueTolerance",
                schema: "inventory",
                table: "CycleCounts",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "QuantityTolerancePercent",
                schema: "inventory",
                table: "CycleCounts",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "PlanningNotes",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PlanNumber",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "PlanName",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CountNotes",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AssignedTo",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ApprovedBy",
                schema: "inventory",
                table: "CycleCounts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AccuracyPercent",
                schema: "inventory",
                table: "CycleCounts",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "CycleCounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "inventory",
                table: "CycleCountItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SystemQuantity",
                schema: "inventory",
                table: "CycleCountItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "CycleCountItems",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "CycleCountItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CountedQuantity",
                schema: "inventory",
                table: "CycleCountItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CountedBy",
                schema: "inventory",
                table: "CycleCountItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "CycleCountItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalSalesAmount",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "SoldQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "SellingPrice",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ReturnedQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "PaidAmount",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InternalNotes",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "InitialQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "DamagedQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "CurrentQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "ConsignmentNumber",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "CommissionRate",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AgreementNotes",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Categories",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "Brands",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<decimal>(
                name: "QuantityPerUnit",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "ManufacturerCode",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Gtin",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "character varying(14)",
                maxLength: 14,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Barcode",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "ProcessedRequests",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CommandName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessedRequests", x => x.Id);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Stocks_Quantity_NonNegative",
                schema: "inventory",
                table: "Stocks",
                sql: "\"Quantity\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Stocks_ReservedQuantity_NonNegative",
                schema: "inventory",
                table: "Stocks",
                sql: "\"ReservedQuantity\" >= 0");

            // Fix existing duplicate SequenceNumber=0 values before creating unique index
            migrationBuilder.Sql(@"
                UPDATE inventory.""StockMovements"" SET ""SequenceNumber"" = sub.rn
                FROM (
                    SELECT ""Id"", ROW_NUMBER() OVER (
                        PARTITION BY ""TenantId"", ""ProductId"", ""WarehouseId""
                        ORDER BY ""MovementDate"", ""Id""
                    ) as rn
                    FROM inventory.""StockMovements""
                ) sub
                WHERE inventory.""StockMovements"".""Id"" = sub.""Id"";
            ");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_ProductId_WarehouseId_SequenceNumber",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "ProductId", "WarehouseId", "SequenceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShelfLives_TenantId",
                schema: "inventory",
                table: "ShelfLives",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ShelfLives_TenantId_IsActive",
                schema: "inventory",
                table: "ShelfLives",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ShelfLives_TenantId_ProductId",
                schema: "inventory",
                table: "ShelfLives",
                columns: new[] { "TenantId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShelfLives_TenantId_RequiresSpecialStorage",
                schema: "inventory",
                table: "ShelfLives",
                columns: new[] { "TenantId", "RequiresSpecialStorage" });

            migrationBuilder.CreateIndex(
                name: "IX_ShelfLives_TenantId_ShelfLifeType",
                schema: "inventory",
                table: "ShelfLives",
                columns: new[] { "TenantId", "ShelfLifeType" });

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_BatchNumber",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "BatchNumber" },
                filter: "[BatchNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_CustomerId",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "CustomerId" },
                filter: "[CustomerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_ProductId",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_ProductId_Serial",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "ProductId", "Serial" });

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_SalesOrderId",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "SalesOrderId" },
                filter: "[SalesOrderId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_Serial",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "Serial" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_Status",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "WarehouseId" },
                filter: "[WarehouseId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_TenantId_WarrantyEndDate",
                schema: "inventory",
                table: "SerialNumbers",
                columns: new[] { "TenantId", "WarrantyEndDate" },
                filter: "[WarrantyEndDate] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId",
                schema: "inventory",
                table: "QualityControls",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_InspectionDate",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "InspectionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_LotNumber",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "LotNumber" },
                filter: "[LotNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_ProductId",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_QcNumber",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "QcNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_QcType",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "QcType" });

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_Result",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "Result" });

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_Status",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_TenantId_SupplierId",
                schema: "inventory",
                table: "QualityControls",
                columns: new[] { "TenantId", "SupplierId" },
                filter: "[SupplierId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControlItems_TenantId",
                schema: "inventory",
                table: "QualityControlItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControlItems_TenantId_QualityControlId",
                schema: "inventory",
                table: "QualityControlItems",
                columns: new[] { "TenantId", "QualityControlId" });

            migrationBuilder.CreateIndex(
                name: "IX_QualityControlAttachment_TenantId",
                schema: "inventory",
                table: "QualityControlAttachment",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControlAttachment_TenantId_QualityControlId",
                schema: "inventory",
                table: "QualityControlAttachment",
                columns: new[] { "TenantId", "QualityControlId" });

            migrationBuilder.CreateIndex(
                name: "IX_PackagingTypes_TenantId",
                schema: "inventory",
                table: "PackagingTypes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PackagingTypes_TenantId_Category",
                schema: "inventory",
                table: "PackagingTypes",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_PackagingTypes_TenantId_Code",
                schema: "inventory",
                table: "PackagingTypes",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PackagingTypes_TenantId_IsActive",
                schema: "inventory",
                table: "PackagingTypes",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_PackagingTypes_TenantId_Name",
                schema: "inventory",
                table: "PackagingTypes",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId",
                schema: "inventory",
                table: "LotBatches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_ExpiryDate",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "ExpiryDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_IsQuarantined",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "IsQuarantined" });

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_LotNumber",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "LotNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_ProductId",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_ProductId_LotNumber",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "ProductId", "LotNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_Status",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_TenantId_SupplierId",
                schema: "inventory",
                table: "LotBatches",
                columns: new[] { "TenantId", "SupplierId" },
                filter: "[SupplierId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_AdjustmentDate",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "AdjustmentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_AdjustmentNumber",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "AdjustmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_AdjustmentType",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "AdjustmentType" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_Reason",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "Reason" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_Status",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "StockCountId" },
                filter: "[StockCountId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_TenantId_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustmentItems_TenantId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustmentItems_TenantId_InventoryAdjustmentId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                columns: new[] { "TenantId", "InventoryAdjustmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustmentItems_TenantId_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId",
                schema: "inventory",
                table: "CycleCounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId_AssignedUserId",
                schema: "inventory",
                table: "CycleCounts",
                columns: new[] { "TenantId", "AssignedUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId_NextScheduledDate",
                schema: "inventory",
                table: "CycleCounts",
                columns: new[] { "TenantId", "NextScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId_PlanNumber",
                schema: "inventory",
                table: "CycleCounts",
                columns: new[] { "TenantId", "PlanNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId_ScheduledStartDate",
                schema: "inventory",
                table: "CycleCounts",
                columns: new[] { "TenantId", "ScheduledStartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId_Status",
                schema: "inventory",
                table: "CycleCounts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_TenantId_WarehouseId",
                schema: "inventory",
                table: "CycleCounts",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_TenantId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_TenantId_CycleCountId",
                schema: "inventory",
                table: "CycleCountItems",
                columns: new[] { "TenantId", "CycleCountId" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_TenantId_IsCounted",
                schema: "inventory",
                table: "CycleCountItems",
                columns: new[] { "TenantId", "IsCounted" });

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_TenantId_ProductId",
                schema: "inventory",
                table: "CycleCountItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_AgreementDate",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "AgreementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_ConsignmentNumber",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "ConsignmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_NextReconciliationDate",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "NextReconciliationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_Status",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "SupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_TenantId_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStockMovements_TenantId",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStockMovements_TenantId_ConsignmentStockId",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                columns: new[] { "TenantId", "ConsignmentStockId" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStockMovements_TenantId_MovementDate",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                columns: new[] { "TenantId", "MovementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStockMovements_TenantId_MovementType",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                columns: new[] { "TenantId", "MovementType" });

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_TenantId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_TenantId_Barcode",
                schema: "inventory",
                table: "BarcodeDefinitions",
                columns: new[] { "TenantId", "Barcode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_TenantId_Gtin",
                schema: "inventory",
                table: "BarcodeDefinitions",
                columns: new[] { "TenantId", "Gtin" },
                filter: "[Gtin] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_TenantId_IsActive",
                schema: "inventory",
                table: "BarcodeDefinitions",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_TenantId_ProductId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_TenantId_ProductId_IsPrimary",
                schema: "inventory",
                table: "BarcodeDefinitions",
                columns: new[] { "TenantId", "ProductId", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedRequests_ProcessedAt",
                schema: "inventory",
                table: "ProcessedRequests",
                column: "ProcessedAt");

            migrationBuilder.AddForeignKey(
                name: "FK_BarcodeDefinitions_PackagingTypes_PackagingTypeId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "PackagingTypeId",
                principalSchema: "inventory",
                principalTable: "PackagingTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BarcodeDefinitions_ProductVariants_ProductVariantId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "ProductVariantId",
                principalSchema: "inventory",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BarcodeDefinitions_Units_UnitId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "UnitId",
                principalSchema: "inventory",
                principalTable: "Units",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Locations_LocationId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Products_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Suppliers_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "SupplierId",
                principalSchema: "inventory",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Warehouses_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCountItems_Locations_LocationId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCountItems_Products_ProductId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCounts_Categories_CategoryId",
                schema: "inventory",
                table: "CycleCounts",
                column: "CategoryId",
                principalSchema: "inventory",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCounts_WarehouseZones_ZoneId",
                schema: "inventory",
                table: "CycleCounts",
                column: "ZoneId",
                principalSchema: "inventory",
                principalTable: "WarehouseZones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCounts_Warehouses_WarehouseId",
                schema: "inventory",
                table: "CycleCounts",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustmentItems_Products_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustments_Locations_LocationId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustments_StockCounts_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "StockCountId",
                principalSchema: "inventory",
                principalTable: "StockCounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustments_Warehouses_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LotBatches_Products_ProductId",
                schema: "inventory",
                table: "LotBatches",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LotBatches_Suppliers_SupplierId",
                schema: "inventory",
                table: "LotBatches",
                column: "SupplierId",
                principalSchema: "inventory",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_QualityControls_Products_ProductId",
                schema: "inventory",
                table: "QualityControls",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QualityControls_Suppliers_SupplierId",
                schema: "inventory",
                table: "QualityControls",
                column: "SupplierId",
                principalSchema: "inventory",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_QualityControls_Warehouses_WarehouseId",
                schema: "inventory",
                table: "QualityControls",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SerialNumbers_Locations_LocationId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SerialNumbers_Products_ProductId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SerialNumbers_Warehouses_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Stocks_LotBatches_LotBatchId",
                schema: "inventory",
                table: "Stocks",
                column: "LotBatchId",
                principalSchema: "inventory",
                principalTable: "LotBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

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
            migrationBuilder.DropForeignKey(
                name: "FK_BarcodeDefinitions_PackagingTypes_PackagingTypeId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_BarcodeDefinitions_ProductVariants_ProductVariantId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_BarcodeDefinitions_Units_UnitId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Locations_LocationId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Products_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Suppliers_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsignmentStocks_Warehouses_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCountItems_Locations_LocationId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCountItems_Products_ProductId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCounts_Categories_CategoryId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCounts_WarehouseZones_ZoneId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CycleCounts_Warehouses_WarehouseId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustmentItems_Products_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustments_Locations_LocationId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustments_StockCounts_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryAdjustments_Warehouses_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.DropForeignKey(
                name: "FK_LotBatches_Products_ProductId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_LotBatches_Suppliers_SupplierId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_QualityControls_Products_ProductId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropForeignKey(
                name: "FK_QualityControls_Suppliers_SupplierId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropForeignKey(
                name: "FK_QualityControls_Warehouses_WarehouseId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropForeignKey(
                name: "FK_SerialNumbers_Locations_LocationId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropForeignKey(
                name: "FK_SerialNumbers_Products_ProductId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropForeignKey(
                name: "FK_SerialNumbers_Warehouses_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropForeignKey(
                name: "FK_Stocks_LotBatches_LotBatchId",
                schema: "inventory",
                table: "Stocks");

            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones");

            migrationBuilder.DropTable(
                name: "ProcessedRequests",
                schema: "inventory");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Stocks_Quantity_NonNegative",
                schema: "inventory",
                table: "Stocks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Stocks_ReservedQuantity_NonNegative",
                schema: "inventory",
                table: "Stocks");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_TenantId_ProductId_WarehouseId_SequenceNumber",
                schema: "inventory",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ShelfLives_TenantId",
                schema: "inventory",
                table: "ShelfLives");

            migrationBuilder.DropIndex(
                name: "IX_ShelfLives_TenantId_IsActive",
                schema: "inventory",
                table: "ShelfLives");

            migrationBuilder.DropIndex(
                name: "IX_ShelfLives_TenantId_ProductId",
                schema: "inventory",
                table: "ShelfLives");

            migrationBuilder.DropIndex(
                name: "IX_ShelfLives_TenantId_RequiresSpecialStorage",
                schema: "inventory",
                table: "ShelfLives");

            migrationBuilder.DropIndex(
                name: "IX_ShelfLives_TenantId_ShelfLifeType",
                schema: "inventory",
                table: "ShelfLives");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_BatchNumber",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_CustomerId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_ProductId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_ProductId_Serial",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_SalesOrderId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_Serial",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_Status",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_SerialNumbers_TenantId_WarrantyEndDate",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_InspectionDate",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_LotNumber",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_ProductId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_QcNumber",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_QcType",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_Result",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_Status",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControls_TenantId_SupplierId",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropIndex(
                name: "IX_QualityControlItems_TenantId",
                schema: "inventory",
                table: "QualityControlItems");

            migrationBuilder.DropIndex(
                name: "IX_QualityControlItems_TenantId_QualityControlId",
                schema: "inventory",
                table: "QualityControlItems");

            migrationBuilder.DropIndex(
                name: "IX_QualityControlAttachment_TenantId",
                schema: "inventory",
                table: "QualityControlAttachment");

            migrationBuilder.DropIndex(
                name: "IX_QualityControlAttachment_TenantId_QualityControlId",
                schema: "inventory",
                table: "QualityControlAttachment");

            migrationBuilder.DropIndex(
                name: "IX_PackagingTypes_TenantId",
                schema: "inventory",
                table: "PackagingTypes");

            migrationBuilder.DropIndex(
                name: "IX_PackagingTypes_TenantId_Category",
                schema: "inventory",
                table: "PackagingTypes");

            migrationBuilder.DropIndex(
                name: "IX_PackagingTypes_TenantId_Code",
                schema: "inventory",
                table: "PackagingTypes");

            migrationBuilder.DropIndex(
                name: "IX_PackagingTypes_TenantId_IsActive",
                schema: "inventory",
                table: "PackagingTypes");

            migrationBuilder.DropIndex(
                name: "IX_PackagingTypes_TenantId_Name",
                schema: "inventory",
                table: "PackagingTypes");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_ExpiryDate",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_IsQuarantined",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_LotNumber",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_ProductId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_ProductId_LotNumber",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_Status",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_LotBatches_TenantId_SupplierId",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_AdjustmentDate",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_AdjustmentNumber",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_AdjustmentType",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_Reason",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_Status",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustments_TenantId_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustmentItems_TenantId",
                schema: "inventory",
                table: "InventoryAdjustmentItems");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustmentItems_TenantId_InventoryAdjustmentId",
                schema: "inventory",
                table: "InventoryAdjustmentItems");

            migrationBuilder.DropIndex(
                name: "IX_InventoryAdjustmentItems_TenantId_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId_AssignedUserId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId_NextScheduledDate",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId_PlanNumber",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId_ScheduledStartDate",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId_Status",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCounts_TenantId_WarehouseId",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropIndex(
                name: "IX_CycleCountItems_TenantId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropIndex(
                name: "IX_CycleCountItems_TenantId_CycleCountId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropIndex(
                name: "IX_CycleCountItems_TenantId_IsCounted",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropIndex(
                name: "IX_CycleCountItems_TenantId_ProductId",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_AgreementDate",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_ConsignmentNumber",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_NextReconciliationDate",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_Status",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStocks_TenantId_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStockMovements_TenantId",
                schema: "inventory",
                table: "ConsignmentStockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStockMovements_TenantId_ConsignmentStockId",
                schema: "inventory",
                table: "ConsignmentStockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStockMovements_TenantId_MovementDate",
                schema: "inventory",
                table: "ConsignmentStockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ConsignmentStockMovements_TenantId_MovementType",
                schema: "inventory",
                table: "ConsignmentStockMovements");

            migrationBuilder.DropIndex(
                name: "IX_BarcodeDefinitions_TenantId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_BarcodeDefinitions_TenantId_Barcode",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_BarcodeDefinitions_TenantId_Gtin",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_BarcodeDefinitions_TenantId_IsActive",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_BarcodeDefinitions_TenantId_ProductId",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_BarcodeDefinitions_TenantId_ProductId_IsPrimary",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "WarehouseZones");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Units");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "SupplierProducts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "SupplierProductPriceTiers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "StockTransfers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "StockTransferItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "StockReservations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                schema: "inventory",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "StockCounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "StockCountItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ShelfLives");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "SerialNumbers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "reorder_suggestions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "reorder_rules");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "QualityControls");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "QualityControlItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "QualityControlAttachment");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductVariantOptions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductBundles");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductBundleItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductAttributeValues");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductAttributes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ProductAttributeOptions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "PriceLists");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "PriceListItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "PackagingTypes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "LotBatches");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "InventoryAdjustments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "InventoryAdjustmentItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "CycleCounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "CycleCountItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ConsignmentStocks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "ConsignmentStockMovements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "inventory",
                table: "BarcodeDefinitions");

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                schema: "inventory",
                table: "SupplierProducts",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StorageConditions",
                schema: "inventory",
                table: "ShelfLives",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MinSalesShelfLifePercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MinReceivingShelfLifePercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CriticalThresholdPercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AlertThresholdPercent",
                schema: "inventory",
                table: "ShelfLives",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SupplierSerial",
                schema: "inventory",
                table: "SerialNumbers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Serial",
                schema: "inventory",
                table: "SerialNumbers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "SerialNumbers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BatchNumber",
                schema: "inventory",
                table: "SerialNumbers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "SupplierNotification",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SampleQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RejectionReason",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "RejectedQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "QualityScore",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "QualityGrade",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "QcNumber",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "PurchaseOrderNumber",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InternalNotes",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectorName",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionStandard",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionNotes",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionLocation",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "InspectedQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "ActionDescription",
                schema: "inventory",
                table: "QualityControls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AcceptedQuantity",
                schema: "inventory",
                table: "QualityControls",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "Specification",
                schema: "inventory",
                table: "QualityControlItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "QualityControlItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MeasuredValue",
                schema: "inventory",
                table: "QualityControlItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckName",
                schema: "inventory",
                table: "QualityControlItems",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "AcceptanceCriteria",
                schema: "inventory",
                table: "QualityControlItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FilePath",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "QualityControlAttachment",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Width",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Volume",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,6)",
                oldPrecision: 18,
                oldScale: 6,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "inventory",
                table: "PackagingTypes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxWeightCapacity",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxQuantity",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MaterialType",
                schema: "inventory",
                table: "PackagingTypes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Length",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Height",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "EmptyWeight",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "PackagingTypes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DepositAmount",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DefaultQuantity",
                schema: "inventory",
                table: "PackagingTypes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "inventory",
                table: "PackagingTypes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "BarcodePrefix",
                schema: "inventory",
                table: "PackagingTypes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SupplierLotNumber",
                schema: "inventory",
                table: "LotBatches",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ReservedQuantity",
                schema: "inventory",
                table: "LotBatches",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "QuarantineReason",
                schema: "inventory",
                table: "LotBatches",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "LotBatches",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "LotBatches",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionNotes",
                schema: "inventory",
                table: "LotBatches",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "InitialQuantity",
                schema: "inventory",
                table: "LotBatches",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "CurrentQuantity",
                schema: "inventory",
                table: "LotBatches",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "CertificateNumber",
                schema: "inventory",
                table: "LotBatches",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalCostImpact",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "RejectionReason",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceType",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InternalNotes",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(3)",
                oldMaxLength: 3);

            migrationBuilder.AlterColumn<string>(
                name: "ApprovedBy",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AdjustmentNumber",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "AccountingNotes",
                schema: "inventory",
                table: "InventoryAdjustments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "SystemQuantity",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "SerialNumber",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ActualQuantity",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "ValueTolerance",
                schema: "inventory",
                table: "CycleCounts",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "QuantityTolerancePercent",
                schema: "inventory",
                table: "CycleCounts",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "PlanningNotes",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PlanNumber",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "PlanName",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CountNotes",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AssignedTo",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ApprovedBy",
                schema: "inventory",
                table: "CycleCounts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AccuracyPercent",
                schema: "inventory",
                table: "CycleCounts",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "inventory",
                table: "CycleCountItems",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SystemQuantity",
                schema: "inventory",
                table: "CycleCountItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "CycleCountItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "CycleCountItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CountedQuantity",
                schema: "inventory",
                table: "CycleCountItems",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CountedBy",
                schema: "inventory",
                table: "CycleCountItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalSalesAmount",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "SoldQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "SellingPrice",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ReturnedQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "PaidAmount",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "LotNumber",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InternalNotes",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "InitialQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "DamagedQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "CurrentQuantity",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(3)",
                oldMaxLength: 3);

            migrationBuilder.AlterColumn<string>(
                name: "ConsignmentNumber",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<decimal>(
                name: "CommissionRate",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AgreementNotes",
                schema: "inventory",
                table: "ConsignmentStocks",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "QuantityPerUnit",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<string>(
                name: "ManufacturerCode",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Gtin",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(14)",
                oldMaxLength: 14,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Barcode",
                schema: "inventory",
                table: "BarcodeDefinitions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProducts_ProductId1",
                schema: "inventory",
                table: "SupplierProducts",
                column: "ProductId1");

            migrationBuilder.AddForeignKey(
                name: "FK_BarcodeDefinitions_PackagingTypes_PackagingTypeId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "PackagingTypeId",
                principalSchema: "inventory",
                principalTable: "PackagingTypes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BarcodeDefinitions_ProductVariants_ProductVariantId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "ProductVariantId",
                principalSchema: "inventory",
                principalTable: "ProductVariants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BarcodeDefinitions_Units_UnitId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "UnitId",
                principalSchema: "inventory",
                principalTable: "Units",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Locations_LocationId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Products_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Suppliers_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "SupplierId",
                principalSchema: "inventory",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsignmentStocks_Warehouses_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCountItems_Locations_LocationId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCountItems_Products_ProductId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCounts_Categories_CategoryId",
                schema: "inventory",
                table: "CycleCounts",
                column: "CategoryId",
                principalSchema: "inventory",
                principalTable: "Categories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCounts_WarehouseZones_ZoneId",
                schema: "inventory",
                table: "CycleCounts",
                column: "ZoneId",
                principalSchema: "inventory",
                principalTable: "WarehouseZones",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CycleCounts_Warehouses_WarehouseId",
                schema: "inventory",
                table: "CycleCounts",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustmentItems_Products_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustments_Locations_LocationId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustments_StockCounts_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "StockCountId",
                principalSchema: "inventory",
                principalTable: "StockCounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryAdjustments_Warehouses_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Warehouses_WarehouseId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LotBatches_Products_ProductId",
                schema: "inventory",
                table: "LotBatches",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LotBatches_Suppliers_SupplierId",
                schema: "inventory",
                table: "LotBatches",
                column: "SupplierId",
                principalSchema: "inventory",
                principalTable: "Suppliers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QualityControls_Products_ProductId",
                schema: "inventory",
                table: "QualityControls",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QualityControls_Suppliers_SupplierId",
                schema: "inventory",
                table: "QualityControls",
                column: "SupplierId",
                principalSchema: "inventory",
                principalTable: "Suppliers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QualityControls_Warehouses_WarehouseId",
                schema: "inventory",
                table: "QualityControls",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SerialNumbers_Locations_LocationId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "LocationId",
                principalSchema: "inventory",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SerialNumbers_Products_ProductId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "ProductId",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SerialNumbers_Warehouses_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Stocks_LotBatches_LotBatchId",
                schema: "inventory",
                table: "Stocks",
                column: "LotBatchId",
                principalSchema: "inventory",
                principalTable: "LotBatches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierProducts_Products_ProductId1",
                schema: "inventory",
                table: "SupplierProducts",
                column: "ProductId1",
                principalSchema: "inventory",
                principalTable: "Products",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseZones_Warehouses_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones",
                column: "WarehouseId",
                principalSchema: "inventory",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
