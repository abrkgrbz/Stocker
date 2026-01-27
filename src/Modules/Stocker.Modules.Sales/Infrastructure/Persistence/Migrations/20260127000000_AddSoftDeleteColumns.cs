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
            AddSoftDeleteColumnsToTable(migrationBuilder, "Quotations");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesOrders");
            AddSoftDeleteColumnsToTable(migrationBuilder, "QuotationItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SalesOrderItems");

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

            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesOrderItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QuotationItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SalesOrders");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Quotations");
        }

        private static void AddSoftDeleteColumnsToTable(MigrationBuilder migrationBuilder, string tableName)
        {
            // Use conditional SQL to avoid errors if columns already exist
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND table_name = '{tableNameLower}' AND column_name = 'IsDeleted') THEN
                        ALTER TABLE sales.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND table_name = '{tableNameLower}' AND column_name = 'DeletedAt') THEN
                        ALTER TABLE sales.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sales' AND table_name = '{tableNameLower}' AND column_name = 'DeletedBy') THEN
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
