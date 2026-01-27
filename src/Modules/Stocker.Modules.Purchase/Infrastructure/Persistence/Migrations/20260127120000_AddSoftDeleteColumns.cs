using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Supplier tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Suppliers");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierContacts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierProducts");

            // Purchase Request tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseRequests");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseRequestItems");

            // Purchase Order tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseOrders");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseOrderItems");

            // Goods Receipt tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "GoodsReceipts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "GoodsReceiptItems");

            // Purchase Invoice tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseInvoices");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseInvoiceItems");

            // Purchase Return tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseReturns");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseReturnItems");

            // Payment table
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierPayments");

            // Quotation tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "Quotations");
            AddSoftDeleteColumnsToTable(migrationBuilder, "QuotationItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "QuotationSuppliers");
            AddSoftDeleteColumnsToTable(migrationBuilder, "QuotationSupplierItems");

            // Contract tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseContracts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseContractItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseContractPriceBreaks");

            // Price List tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceLists");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceListItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PriceListItemTiers");

            // Budget tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseBudgets");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseBudgetRevisions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PurchaseBudgetTransactions");

            // Supplier Evaluation tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierEvaluations");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierEvaluationCriteria");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SupplierEvaluationHistory");

            // Approval Workflow tables
            AddSoftDeleteColumnsToTable(migrationBuilder, "ApprovalWorkflowConfigs");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ApprovalWorkflowRules");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ApprovalWorkflowSteps");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ApprovalGroups");
            AddSoftDeleteColumnsToTable(migrationBuilder, "ApprovalGroupMembers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Supplier tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Suppliers");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierContacts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierProducts");

            // Purchase Request tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseRequests");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseRequestItems");

            // Purchase Order tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseOrders");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseOrderItems");

            // Goods Receipt tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "GoodsReceipts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "GoodsReceiptItems");

            // Purchase Invoice tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseInvoices");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseInvoiceItems");

            // Purchase Return tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseReturns");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseReturnItems");

            // Payment table
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierPayments");

            // Quotation tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Quotations");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QuotationItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QuotationSuppliers");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "QuotationSupplierItems");

            // Contract tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseContracts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseContractItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseContractPriceBreaks");

            // Price List tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceLists");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceListItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PriceListItemTiers");

            // Budget tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseBudgets");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseBudgetRevisions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PurchaseBudgetTransactions");

            // Supplier Evaluation tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierEvaluations");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierEvaluationCriteria");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SupplierEvaluationHistory");

            // Approval Workflow tables
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ApprovalWorkflowConfigs");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ApprovalWorkflowRules");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ApprovalWorkflowSteps");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ApprovalGroups");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "ApprovalGroupMembers");
        }

        private static void AddSoftDeleteColumnsToTable(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "purchase",
                table: tableName,
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "purchase",
                table: tableName,
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "purchase",
                table: tableName,
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        private static void RemoveSoftDeleteColumnsFromTable(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "purchase",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "purchase",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "purchase",
                table: tableName);
        }
    }
}
