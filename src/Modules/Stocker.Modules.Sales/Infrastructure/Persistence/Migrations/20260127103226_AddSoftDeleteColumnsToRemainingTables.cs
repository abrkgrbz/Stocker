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
            // Add soft delete columns to all Sales tables using idempotent SQL
            var tables = new[]
            {
                "WarrantyClaims",
                "Warranties",
                "ServiceOrders",
                "ServiceOrderNotes",
                "ServiceOrderItems",
                "SalesTerritories",
                "SalesTargets",
                "SalesReturns",
                "SalesReturnItems",
                "SalesPipelines",
                "SalesOrders",
                "SalesOrderItems",
                "SalesCommissions",
                "Quotations",
                "QuotationItems",
                "Promotions",
                "PriceLists",
                "PipelineStages",
                "Payments",
                "Opportunities",
                "Invoices",
                "InvoiceItems",
                "InventoryReservations",
                "Discounts",
                "DeliveryNotes",
                "CustomerSegments",
                "CustomerContracts",
                "CreditNotes",
                "CreditNoteItems",
                "CommissionPlans",
                "BackOrders",
                "BackOrderItems",
                "AdvancePayments"
            };

            foreach (var tableName in tables)
            {
                AddSoftDeleteColumnsToTable(migrationBuilder, "sales", tableName);
            }

            // Add xmin column to SalesOrders for concurrency
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'sales' AND lower(table_name) = 'salesorders')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND lower(table_name) = 'salesorders' AND lower(column_name) = 'xmin') THEN
                        -- xmin is a system column in PostgreSQL, no need to add it
                        NULL;
                    END IF;
                END $$;
            ");

            // Create audit_logs table if not exists
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS sales.audit_logs (
                    ""Id"" uuid NOT NULL,
                    ""EntityName"" character varying(100) NOT NULL,
                    ""EntityId"" character varying(100) NOT NULL,
                    ""Action"" character varying(50) NOT NULL,
                    ""OldValues"" text NULL,
                    ""NewValues"" text NULL,
                    ""Changes"" text NULL,
                    ""UserId"" character varying(100) NOT NULL,
                    ""UserName"" character varying(255) NOT NULL,
                    ""UserEmail"" character varying(255) NULL,
                    ""IpAddress"" character varying(50) NULL,
                    ""UserAgent"" character varying(500) NULL,
                    ""Timestamp"" timestamp with time zone NOT NULL,
                    ""AdditionalData"" text NULL,
                    ""TenantId"" uuid NOT NULL,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""DeletedAt"" timestamp with time zone NULL,
                    ""DeletedBy"" text NULL,
                    CONSTRAINT ""PK_audit_logs"" PRIMARY KEY (""Id"")
                );
            ");

            // Create processed_requests table if not exists
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS sales.processed_requests (
                    ""Id"" uuid NOT NULL,
                    ""CommandName"" character varying(255) NOT NULL,
                    ""ProcessedAt"" timestamp with time zone NOT NULL,
                    ""TenantId"" uuid NOT NULL,
                    CONSTRAINT ""PK_processed_requests"" PRIMARY KEY (""Id"")
                );
            ");

            // Create PromotionUsages table if not exists
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS sales.""PromotionUsages"" (
                    ""Id"" uuid NOT NULL,
                    ""PromotionId"" uuid NOT NULL,
                    ""CustomerId"" uuid NOT NULL,
                    ""OrderId"" uuid NOT NULL,
                    ""DiscountApplied"" numeric(18,2) NOT NULL,
                    ""UsedAt"" timestamp with time zone NOT NULL,
                    ""TenantId"" uuid NOT NULL,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""DeletedAt"" timestamp with time zone NULL,
                    ""DeletedBy"" text NULL,
                    CONSTRAINT ""PK_PromotionUsages"" PRIMARY KEY (""Id"")
                );
            ");

            // Create indexes if not exist
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_SalesOrders_TenantId_IsDeleted"" ON sales.""SalesOrders"" (""TenantId"", ""IsDeleted"");
                CREATE INDEX IF NOT EXISTS ""IX_audit_logs_EntityName_EntityId"" ON sales.audit_logs (""EntityName"", ""EntityId"");
                CREATE INDEX IF NOT EXISTS ""IX_audit_logs_Timestamp"" ON sales.audit_logs (""Timestamp"");
                CREATE INDEX IF NOT EXISTS ""IX_audit_logs_UserId"" ON sales.audit_logs (""UserId"");
                CREATE INDEX IF NOT EXISTS ""ix_processed_requests_processed_at"" ON sales.processed_requests (""ProcessedAt"");
                CREATE INDEX IF NOT EXISTS ""ix_processed_requests_tenant_id"" ON sales.processed_requests (""TenantId"");
                CREATE INDEX IF NOT EXISTS ""IX_PromotionUsages_TenantId_CustomerId"" ON sales.""PromotionUsages"" (""TenantId"", ""CustomerId"");
                CREATE INDEX IF NOT EXISTS ""IX_PromotionUsages_TenantId_PromotionId_CustomerId"" ON sales.""PromotionUsages"" (""TenantId"", ""PromotionId"", ""CustomerId"");
            ");

            // Create unique index if not exists
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'sales' AND indexname = 'IX_PromotionUsages_TenantId_PromotionId_OrderId') THEN
                        CREATE UNIQUE INDEX ""IX_PromotionUsages_TenantId_PromotionId_OrderId"" ON sales.""PromotionUsages"" (""TenantId"", ""PromotionId"", ""OrderId"");
                    END IF;
                END $$;
            ");
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

            var tables = new[]
            {
                "WarrantyClaims",
                "Warranties",
                "ServiceOrders",
                "ServiceOrderNotes",
                "ServiceOrderItems",
                "SalesTerritories",
                "SalesTargets",
                "SalesReturns",
                "SalesReturnItems",
                "SalesPipelines",
                "SalesOrders",
                "SalesOrderItems",
                "SalesCommissions",
                "Quotations",
                "QuotationItems",
                "Promotions",
                "PriceLists",
                "PipelineStages",
                "Payments",
                "Opportunities",
                "Invoices",
                "InvoiceItems",
                "InventoryReservations",
                "Discounts",
                "DeliveryNotes",
                "CustomerSegments",
                "CustomerContracts",
                "CreditNotes",
                "CreditNoteItems",
                "CommissionPlans",
                "BackOrders",
                "BackOrderItems",
                "AdvancePayments"
            };

            foreach (var tableName in tables)
            {
                RemoveSoftDeleteColumnsFromTable(migrationBuilder, "sales", tableName);
            }

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_IsDeleted",
                schema: "sales",
                table: "SalesOrders");
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
                        ALTER TABLE {schema}.""{tableName}"" ADD COLUMN ""DeletedBy"" text NULL;
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
