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
            AddSoftDeleteColumns(migrationBuilder, "Suppliers");
            AddSoftDeleteColumns(migrationBuilder, "SupplierContacts");
            AddSoftDeleteColumns(migrationBuilder, "SupplierProducts");

            // Purchase Request tables
            AddSoftDeleteColumns(migrationBuilder, "PurchaseRequests");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseRequestItems");

            // Purchase Order tables
            AddSoftDeleteColumns(migrationBuilder, "PurchaseOrders");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseOrderItems");

            // Goods Receipt tables
            AddSoftDeleteColumns(migrationBuilder, "GoodsReceipts");
            AddSoftDeleteColumns(migrationBuilder, "GoodsReceiptItems");

            // Purchase Invoice tables
            AddSoftDeleteColumns(migrationBuilder, "PurchaseInvoices");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseInvoiceItems");

            // Purchase Return tables
            AddSoftDeleteColumns(migrationBuilder, "PurchaseReturns");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseReturnItems");

            // Payment table
            AddSoftDeleteColumns(migrationBuilder, "SupplierPayments");

            // Quotation tables
            AddSoftDeleteColumns(migrationBuilder, "Quotations");
            AddSoftDeleteColumns(migrationBuilder, "QuotationItems");
            AddSoftDeleteColumns(migrationBuilder, "QuotationSuppliers");
            AddSoftDeleteColumns(migrationBuilder, "QuotationSupplierItems");

            // Contract tables
            AddSoftDeleteColumns(migrationBuilder, "PurchaseContracts");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseContractItems");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseContractPriceBreaks");

            // Price List tables
            AddSoftDeleteColumns(migrationBuilder, "PriceLists");
            AddSoftDeleteColumns(migrationBuilder, "PriceListItems");
            AddSoftDeleteColumns(migrationBuilder, "PriceListItemTiers");

            // Budget tables
            AddSoftDeleteColumns(migrationBuilder, "PurchaseBudgets");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseBudgetRevisions");
            AddSoftDeleteColumns(migrationBuilder, "PurchaseBudgetTransactions");

            // Supplier Evaluation tables
            AddSoftDeleteColumns(migrationBuilder, "SupplierEvaluations");
            AddSoftDeleteColumns(migrationBuilder, "SupplierEvaluationCriteria");
            AddSoftDeleteColumns(migrationBuilder, "SupplierEvaluationHistory");

            // Approval Workflow tables
            AddSoftDeleteColumns(migrationBuilder, "ApprovalWorkflowConfigs");
            AddSoftDeleteColumns(migrationBuilder, "ApprovalWorkflowRules");
            AddSoftDeleteColumns(migrationBuilder, "ApprovalWorkflowSteps");
            AddSoftDeleteColumns(migrationBuilder, "ApprovalGroups");
            AddSoftDeleteColumns(migrationBuilder, "ApprovalGroupMembers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Supplier tables
            RemoveSoftDeleteColumns(migrationBuilder, "Suppliers");
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierContacts");
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierProducts");

            // Purchase Request tables
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseRequests");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseRequestItems");

            // Purchase Order tables
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseOrders");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseOrderItems");

            // Goods Receipt tables
            RemoveSoftDeleteColumns(migrationBuilder, "GoodsReceipts");
            RemoveSoftDeleteColumns(migrationBuilder, "GoodsReceiptItems");

            // Purchase Invoice tables
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseInvoices");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseInvoiceItems");

            // Purchase Return tables
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseReturns");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseReturnItems");

            // Payment table
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierPayments");

            // Quotation tables
            RemoveSoftDeleteColumns(migrationBuilder, "Quotations");
            RemoveSoftDeleteColumns(migrationBuilder, "QuotationItems");
            RemoveSoftDeleteColumns(migrationBuilder, "QuotationSuppliers");
            RemoveSoftDeleteColumns(migrationBuilder, "QuotationSupplierItems");

            // Contract tables
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseContracts");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseContractItems");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseContractPriceBreaks");

            // Price List tables
            RemoveSoftDeleteColumns(migrationBuilder, "PriceLists");
            RemoveSoftDeleteColumns(migrationBuilder, "PriceListItems");
            RemoveSoftDeleteColumns(migrationBuilder, "PriceListItemTiers");

            // Budget tables
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseBudgets");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseBudgetRevisions");
            RemoveSoftDeleteColumns(migrationBuilder, "PurchaseBudgetTransactions");

            // Supplier Evaluation tables
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierEvaluations");
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierEvaluationCriteria");
            RemoveSoftDeleteColumns(migrationBuilder, "SupplierEvaluationHistory");

            // Approval Workflow tables
            RemoveSoftDeleteColumns(migrationBuilder, "ApprovalWorkflowConfigs");
            RemoveSoftDeleteColumns(migrationBuilder, "ApprovalWorkflowRules");
            RemoveSoftDeleteColumns(migrationBuilder, "ApprovalWorkflowSteps");
            RemoveSoftDeleteColumns(migrationBuilder, "ApprovalGroups");
            RemoveSoftDeleteColumns(migrationBuilder, "ApprovalGroupMembers");
        }

        private static void AddSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
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

        private static void RemoveSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
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
