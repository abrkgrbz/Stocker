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
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "finance",
                table: tableName,
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "finance",
                table: tableName,
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "finance",
                table: tableName,
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
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
