using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Transactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "TaxDeclarations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "TaxDeclarationPayments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "TaxDeclarationDetails",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "PromissoryNotes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "PromissoryNoteMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Payments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "PaymentAllocations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "LoanSchedules",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Loans",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "LoanPayments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "JournalEntryLines",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "JournalEntries",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "InvoiceTaxes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Invoices",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "InvoiceLines",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Installments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "InstallmentPlans",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssets",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssetMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssetMaintenances",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssetDepreciations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Expenses",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "ExchangeRates",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "CurrentAccountTransactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "CurrentAccounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Currencies",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "CostCenters",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Checks",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "CheckMovements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "CashTransactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "CashAccounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BudgetTransfers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Budgets",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BudgetItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BankTransactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BankReconciliations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BankReconciliationItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BankAccounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BaBsForms",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "BaBsFormItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "Accounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "finance",
                table: "AccountingPeriods",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "TaxDeclarations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "TaxDeclarationPayments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "TaxDeclarationDetails");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "PromissoryNotes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "PromissoryNoteMovements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "PaymentAllocations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "LoanSchedules");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Loans");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "LoanPayments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "JournalEntryLines");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "InvoiceTaxes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Installments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "InstallmentPlans");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssets");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssetMovements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssetMaintenances");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "FixedAssetDepreciations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "ExchangeRates");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "ExchangeRateAdjustments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "CurrentAccountTransactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "CurrentAccounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Currencies");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "CostCenters");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Checks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "CheckMovements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "CashAccounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BudgetTransfers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BudgetItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BankReconciliations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BankReconciliationItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BaBsForms");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "BaBsFormItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "finance",
                table: "AccountingPeriods");
        }
    }
}
