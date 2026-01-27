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
            // Use conditional SQL to avoid errors if table doesn't exist or columns already exist
            // PostgreSQL stores identifiers in lowercase in information_schema
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    -- Only add column if table exists and column doesn't exist
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'purchase' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'purchase' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE purchase.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'purchase' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'purchase' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE purchase.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'purchase' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'purchase' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE purchase.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
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
