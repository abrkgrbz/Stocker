using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add soft delete columns to all Sales tables
            // Core Sales tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Quotations");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesOrders");
            AddSoftDeleteColumnsToTable(migrationBuilder, "QuotationItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesOrderItems");

            // Customer & Contract tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "CustomerContracts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ContractPriceAgreements");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ContractPaymentTerms");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ContractCommitments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ContractDocuments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CustomerSegments");

            // Financial tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Invoices");
            AddSoftDeleteColumnsToTable(migrationBuilder, "InvoiceItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Payments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "AdvancePayments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CreditNotes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CreditNoteItems");

            // Fulfillment tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Shipments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "DeliveryNotes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "BackOrders");
            AddSoftDeleteColumnsToTable(migrationBuilder, "BackOrderItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "InventoryReservations");

            // Returns & After-sales
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesReturns");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesReturnItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ServiceOrders");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ServiceOrderItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ServiceOrderNotes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Warranties");
            AddSoftDeleteColumnsToTable(migrationBuilder, "WarrantyClaims");

            // Pricing & Promotions
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceLists");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceListItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Discounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Promotions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PromotionUsages");

            // Sales Management
            AddSoftDeleteColumnsToTable(migrationBuilder, "Opportunities");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesPipelines");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PipelineStages");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesTerritories");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesTargets");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CommissionPlans");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesCommissions");

            // Add indexes for soft delete queries (conditional)
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'sales' AND indexname = 'IX_Quotations_IsDeleted') THEN
                        CREATE INDEX ""IX_Quotations_IsDeleted"" ON sales.""Quotations"" (""IsDeleted"");
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'sales' AND indexname = 'IX_SalesOrders_IsDeleted') THEN
                        CREATE INDEX ""IX_SalesOrders_IsDeleted"" ON sales.""SalesOrders"" (""IsDeleted"");
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_IsDeleted",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_Quotations_IsDeleted",
                schema: "sales",
                table: "Quotations");

            // Remove in reverse order
            // Sales Management
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesCommissions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CommissionPlans");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesTargets");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesTerritories");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PipelineStages");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesPipelines");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Opportunities");

            // Pricing & Promotions
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PromotionUsages");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Promotions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Discounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceListItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceLists");

            // Returns & After-sales
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "WarrantyClaims");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Warranties");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ServiceOrderNotes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ServiceOrderItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ServiceOrders");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesReturnItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesReturns");

            // Fulfillment tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InventoryReservations");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BackOrderItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BackOrders");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "DeliveryNotes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Shipments");

            // Financial tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CreditNoteItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CreditNotes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "AdvancePayments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Payments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InvoiceItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Invoices");

            // Customer & Contract tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CustomerSegments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ContractDocuments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ContractCommitments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ContractPaymentTerms");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ContractPriceAgreements");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CustomerContracts");

            // Core Sales tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesOrderItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QuotationItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesOrders");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Quotations");
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
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'sales' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE sales.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'sales' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE sales.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'sales' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE sales.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
        }

        private static void RemoveSoftDeleteColumnsFromTable(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(name: "IsDeleted", schema: "sales", table: tableName);
            migrationBuilder.DropColumn(name: "DeletedAt", schema: "sales", table: tableName);
            migrationBuilder.DropColumn(name: "DeletedBy", schema: "sales", table: tableName);
        }
    }
}
