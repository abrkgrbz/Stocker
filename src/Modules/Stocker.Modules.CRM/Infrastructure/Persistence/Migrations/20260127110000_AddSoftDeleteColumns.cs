using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add soft delete columns to all CRM tables
            var tables = new[] {
                "Customers", "Contacts", "Leads", "Accounts", "Opportunities", "Deals",
                "Activities", "Notes", "Campaigns", "Pipelines", "CustomerSegments", "Workflows",
                "Contracts", "Quotes", "Tickets", "SalesTeams", "Territories", "Competitors", "LoyaltyPrograms"
            };

            foreach (var table in tables)
            {
                AddSoftDeleteColumnsToTable(migrationBuilder, table);
            }

            // Add indexes for soft delete queries on main entities (conditional)
            var indexTables = new[] { "Customers", "Contacts", "Leads", "Opportunities", "Deals" };
            foreach (var table in indexTables)
            {
                var tableNameLower = table.ToLowerInvariant();
                migrationBuilder.Sql($@"
                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'crm' AND indexname = 'IX_{table}_IsDeleted') THEN
                            CREATE INDEX ""IX_{table}_IsDeleted"" ON crm.""{table}"" (""IsDeleted"");
                        END IF;
                    END $$;
                ");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop indexes
            migrationBuilder.DropIndex(name: "IX_Deals_IsDeleted", schema: "crm", table: "Deals");
            migrationBuilder.DropIndex(name: "IX_Opportunities_IsDeleted", schema: "crm", table: "Opportunities");
            migrationBuilder.DropIndex(name: "IX_Leads_IsDeleted", schema: "crm", table: "Leads");
            migrationBuilder.DropIndex(name: "IX_Contacts_IsDeleted", schema: "crm", table: "Contacts");
            migrationBuilder.DropIndex(name: "IX_Customers_IsDeleted", schema: "crm", table: "Customers");

            // Drop columns from all tables
            var tables = new[] { "Customers", "Contacts", "Leads", "Accounts", "Opportunities", "Deals",
                "Activities", "Notes", "Campaigns", "Pipelines", "CustomerSegments", "Workflows",
                "Contracts", "Quotes", "Tickets", "SalesTeams", "Territories", "Competitors", "LoyaltyPrograms" };

            foreach (var table in tables)
            {
                migrationBuilder.DropColumn(name: "IsDeleted", schema: "crm", table: table);
                migrationBuilder.DropColumn(name: "DeletedAt", schema: "crm", table: table);
                migrationBuilder.DropColumn(name: "DeletedBy", schema: "crm", table: table);
            }
        }

        private static void AddSoftDeleteColumnsToTable(MigrationBuilder migrationBuilder, string tableName)
        {
            // Use conditional SQL to avoid errors if columns already exist
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = '{tableNameLower}' AND column_name = 'IsDeleted') THEN
                        ALTER TABLE crm.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = '{tableNameLower}' AND column_name = 'DeletedAt') THEN
                        ALTER TABLE crm.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = '{tableNameLower}' AND column_name = 'DeletedBy') THEN
                        ALTER TABLE crm.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
        }
    }
}
