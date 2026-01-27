using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumnsToRemainingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "WarrantyClaims",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "WarrantyClaims",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "WarrantyClaims",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Warranties",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Warranties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Warranties",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "ServiceOrders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "ServiceOrders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "ServiceOrderNotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "ServiceOrderNotes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "ServiceOrderNotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "ServiceOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "ServiceOrderItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "ServiceOrderItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesTerritories",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesTerritories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesTerritories",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesTargets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesTargets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesTargets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesReturns",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesReturns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesReturns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesReturnItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesReturnItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesReturnItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesPipelines",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesPipelines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesPipelines",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "sales",
                table: "SalesOrders",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrderItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrderItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesCommissions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesCommissions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesCommissions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Quotations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Quotations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Quotations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "QuotationItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "QuotationItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "QuotationItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Promotions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Promotions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Promotions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "PriceLists",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "PriceLists",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "PriceLists",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "PipelineStages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "PipelineStages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "PipelineStages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Payments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Payments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Payments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Opportunities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Opportunities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Opportunities",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Invoices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Invoices",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "InvoiceItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "InvoiceItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "InvoiceItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "InventoryReservations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "InventoryReservations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "InventoryReservations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Discounts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Discounts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Discounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "DeliveryNotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "DeliveryNotes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "DeliveryNotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "CustomerSegments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "CustomerSegments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "CustomerSegments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "CustomerContracts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "CustomerContracts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "CustomerContracts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "CreditNotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "CreditNotes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "CreditNotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "CreditNoteItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "CreditNoteItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "CreditNoteItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "CommissionPlans",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "CommissionPlans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "CommissionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "BackOrders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "BackOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "BackOrders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "BackOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "BackOrderItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "BackOrderItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "AdvancePayments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "AdvancePayments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "AdvancePayments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "audit_logs",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    Changes = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdditionalData = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "processed_requests",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CommandName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_processed_requests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PromotionUsages",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PromotionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    DiscountApplied = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionUsages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_IsDeleted",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_EntityName_EntityId",
                schema: "sales",
                table: "audit_logs",
                columns: new[] { "EntityName", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Timestamp",
                schema: "sales",
                table: "audit_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_UserId",
                schema: "sales",
                table: "audit_logs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "ix_processed_requests_processed_at",
                schema: "sales",
                table: "processed_requests",
                column: "ProcessedAt");

            migrationBuilder.CreateIndex(
                name: "ix_processed_requests_tenant_id",
                schema: "sales",
                table: "processed_requests",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionUsages_TenantId_CustomerId",
                schema: "sales",
                table: "PromotionUsages",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_PromotionUsages_TenantId_PromotionId_CustomerId",
                schema: "sales",
                table: "PromotionUsages",
                columns: new[] { "TenantId", "PromotionId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_PromotionUsages_TenantId_PromotionId_OrderId",
                schema: "sales",
                table: "PromotionUsages",
                columns: new[] { "TenantId", "PromotionId", "OrderId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "processed_requests",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "PromotionUsages",
                schema: "sales");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_IsDeleted",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "WarrantyClaims");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "WarrantyClaims");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "WarrantyClaims");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Warranties");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Warranties");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Warranties");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "ServiceOrderNotes");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "ServiceOrderNotes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "ServiceOrderNotes");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "ServiceOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "ServiceOrderItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "ServiceOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesTerritories");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesTerritories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesTerritories");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesTargets");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesTargets");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesTargets");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesReturns");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesReturns");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesReturns");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesReturnItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesReturnItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesReturnItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesPipelines");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesPipelines");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesPipelines");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesCommissions");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesCommissions");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesCommissions");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "PriceLists");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "PriceLists");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "PriceLists");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "PipelineStages");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "PipelineStages");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "PipelineStages");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "InvoiceItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "InvoiceItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "InvoiceItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "InventoryReservations");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "InventoryReservations");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "InventoryReservations");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "DeliveryNotes");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "DeliveryNotes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "DeliveryNotes");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "CustomerSegments");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "CustomerSegments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "CustomerSegments");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "CustomerContracts");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "CustomerContracts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "CustomerContracts");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "CreditNotes");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "CreditNotes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "CreditNotes");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "CreditNoteItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "CreditNoteItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "CreditNoteItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "CommissionPlans");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "CommissionPlans");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "CommissionPlans");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "BackOrders");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "BackOrders");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "BackOrders");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "BackOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "BackOrderItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "BackOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "AdvancePayments");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "AdvancePayments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "AdvancePayments");
        }
    }
}
