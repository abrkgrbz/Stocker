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
            AddSoftDeleteColumns(migrationBuilder, "CurrentAccounts");
            AddSoftDeleteColumns(migrationBuilder, "CurrentAccountTransactions");

            // Invoice tables
            AddSoftDeleteColumns(migrationBuilder, "Invoices");
            AddSoftDeleteColumns(migrationBuilder, "InvoiceLines");
            AddSoftDeleteColumns(migrationBuilder, "InvoiceTaxes");

            // Expense tables
            AddSoftDeleteColumns(migrationBuilder, "Expenses");
            AddSoftDeleteColumns(migrationBuilder, "CostCenters");

            // Payment tables
            AddSoftDeleteColumns(migrationBuilder, "Payments");
            AddSoftDeleteColumns(migrationBuilder, "PaymentAllocations");

            // Banking tables
            AddSoftDeleteColumns(migrationBuilder, "BankAccounts");
            AddSoftDeleteColumns(migrationBuilder, "BankTransactions");
            AddSoftDeleteColumns(migrationBuilder, "BankReconciliations");

            // Cash tables
            AddSoftDeleteColumns(migrationBuilder, "CashAccounts");
            AddSoftDeleteColumns(migrationBuilder, "CashTransactions");

            // Check and Promissory Note tables
            AddSoftDeleteColumns(migrationBuilder, "Checks");
            AddSoftDeleteColumns(migrationBuilder, "PromissoryNotes");

            // Accounting tables
            AddSoftDeleteColumns(migrationBuilder, "Accounts");
            AddSoftDeleteColumns(migrationBuilder, "JournalEntries");
            AddSoftDeleteColumns(migrationBuilder, "Transactions");
            AddSoftDeleteColumns(migrationBuilder, "AccountingPeriods");
            AddSoftDeleteColumns(migrationBuilder, "Budgets");

            // Fixed Asset table
            AddSoftDeleteColumns(migrationBuilder, "FixedAssets");

            // Loan tables
            AddSoftDeleteColumns(migrationBuilder, "Loans");
            AddSoftDeleteColumns(migrationBuilder, "InstallmentPlans");

            // Exchange Rate tables
            AddSoftDeleteColumns(migrationBuilder, "ExchangeRates");
            AddSoftDeleteColumns(migrationBuilder, "ExchangeRateAdjustments");

            // Tax tables
            AddSoftDeleteColumns(migrationBuilder, "TaxDeclarations");
            AddSoftDeleteColumns(migrationBuilder, "BaBsForms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Core Finance tables
            RemoveSoftDeleteColumns(migrationBuilder, "CurrentAccounts");
            RemoveSoftDeleteColumns(migrationBuilder, "CurrentAccountTransactions");

            // Invoice tables
            RemoveSoftDeleteColumns(migrationBuilder, "Invoices");
            RemoveSoftDeleteColumns(migrationBuilder, "InvoiceLines");
            RemoveSoftDeleteColumns(migrationBuilder, "InvoiceTaxes");

            // Expense tables
            RemoveSoftDeleteColumns(migrationBuilder, "Expenses");
            RemoveSoftDeleteColumns(migrationBuilder, "CostCenters");

            // Payment tables
            RemoveSoftDeleteColumns(migrationBuilder, "Payments");
            RemoveSoftDeleteColumns(migrationBuilder, "PaymentAllocations");

            // Banking tables
            RemoveSoftDeleteColumns(migrationBuilder, "BankAccounts");
            RemoveSoftDeleteColumns(migrationBuilder, "BankTransactions");
            RemoveSoftDeleteColumns(migrationBuilder, "BankReconciliations");

            // Cash tables
            RemoveSoftDeleteColumns(migrationBuilder, "CashAccounts");
            RemoveSoftDeleteColumns(migrationBuilder, "CashTransactions");

            // Check and Promissory Note tables
            RemoveSoftDeleteColumns(migrationBuilder, "Checks");
            RemoveSoftDeleteColumns(migrationBuilder, "PromissoryNotes");

            // Accounting tables
            RemoveSoftDeleteColumns(migrationBuilder, "Accounts");
            RemoveSoftDeleteColumns(migrationBuilder, "JournalEntries");
            RemoveSoftDeleteColumns(migrationBuilder, "Transactions");
            RemoveSoftDeleteColumns(migrationBuilder, "AccountingPeriods");
            RemoveSoftDeleteColumns(migrationBuilder, "Budgets");

            // Fixed Asset table
            RemoveSoftDeleteColumns(migrationBuilder, "FixedAssets");

            // Loan tables
            RemoveSoftDeleteColumns(migrationBuilder, "Loans");
            RemoveSoftDeleteColumns(migrationBuilder, "InstallmentPlans");

            // Exchange Rate tables
            RemoveSoftDeleteColumns(migrationBuilder, "ExchangeRates");
            RemoveSoftDeleteColumns(migrationBuilder, "ExchangeRateAdjustments");

            // Tax tables
            RemoveSoftDeleteColumns(migrationBuilder, "TaxDeclarations");
            RemoveSoftDeleteColumns(migrationBuilder, "BaBsForms");
        }

        private static void AddSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
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

        private static void RemoveSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
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
