using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Core Finance tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "CurrentAccounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CurrentAccountTransactions");

            // Invoice tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Invoices");
            AddSoftDeleteColumnsToTable(migrationBuilder, "InvoiceLines");
            AddSoftDeleteColumnsToTable(migrationBuilder, "InvoiceTaxes");

            // Expense tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Expenses");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CostCenters");

            // Payment tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Payments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PaymentAllocations");

            // Banking tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "BankAccounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "BankTransactions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "BankReconciliations");

            // Cash tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "CashAccounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "CashTransactions");

            // Check and Promissory Note tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Checks");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PromissoryNotes");

            // Accounting tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Accounts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "JournalEntries");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Transactions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "AccountingPeriods");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Budgets");

            // Fixed Asset table
            AddSoftDeleteColumnsToTable(migrationBuilder, "FixedAssets");

            // Loan tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Loans");
            AddSoftDeleteColumnsToTable(migrationBuilder, "InstallmentPlans");

            // Exchange Rate tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "ExchangeRates");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ExchangeRateAdjustments");

            // Tax tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "TaxDeclarations");
            AddSoftDeleteColumnsToTable(migrationBuilder, "BaBsForms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Core Finance tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CurrentAccounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CurrentAccountTransactions");

            // Invoice tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Invoices");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InvoiceLines");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InvoiceTaxes");

            // Expense tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Expenses");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CostCenters");

            // Payment tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Payments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PaymentAllocations");

            // Banking tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BankAccounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BankTransactions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BankReconciliations");

            // Cash tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CashAccounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CashTransactions");

            // Check and Promissory Note tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Checks");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PromissoryNotes");

            // Accounting tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Accounts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "JournalEntries");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Transactions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "AccountingPeriods");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Budgets");

            // Fixed Asset table
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "FixedAssets");

            // Loan tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Loans");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "InstallmentPlans");

            // Exchange Rate tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ExchangeRates");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ExchangeRateAdjustments");

            // Tax tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "TaxDeclarations");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "BaBsForms");
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
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'finance' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'finance' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE finance.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'finance' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'finance' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE finance.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'finance' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'finance' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE finance.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
        }

        private static void RemoveSoftDeleteColumnsFromTable(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "finance",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "finance",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "finance",
                table: tableName);
        }
    }
}
