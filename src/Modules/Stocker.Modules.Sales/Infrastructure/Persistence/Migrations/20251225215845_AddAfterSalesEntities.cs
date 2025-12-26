using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAfterSalesEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Billing_AddressLine1",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_AddressLine2",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_City",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_CompanyName",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_Country",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_District",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_PostalCode",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_RecipientName",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_RecipientPhone",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_State",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_TaxId",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_TaxOffice",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_Town",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompletedShipmentCount",
                schema: "sales",
                table: "SalesOrders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerContractId",
                schema: "sales",
                table: "SalesOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FulfillmentStatus",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvoicingStatus",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsStockReserved",
                schema: "sales",
                table: "SalesOrders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "OpportunityId",
                schema: "sales",
                table: "SalesOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDueDate",
                schema: "sales",
                table: "SalesOrders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "QuotationId",
                schema: "sales",
                table: "SalesOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuotationNumber",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReservationExpiryDate",
                schema: "sales",
                table: "SalesOrders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_AddressLine1",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_AddressLine2",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_City",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_CompanyName",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_Country",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_District",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_PostalCode",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_RecipientName",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_RecipientPhone",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_State",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_TaxId",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_TaxOffice",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shipping_Town",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TerritoryId",
                schema: "sales",
                table: "SalesOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TerritoryName",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAdvancePaymentAmount",
                schema: "sales",
                table: "SalesOrders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalInvoicedAmount",
                schema: "sales",
                table: "SalesOrders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPaymentAmount",
                schema: "sales",
                table: "SalesOrders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalReservedQuantity",
                schema: "sales",
                table: "SalesOrders",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "UnresolvedBackOrderCount",
                schema: "sales",
                table: "SalesOrders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Billing_AddressLine1",
                schema: "sales",
                table: "Invoices",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_AddressLine2",
                schema: "sales",
                table: "Invoices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_City",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_CompanyName",
                schema: "sales",
                table: "Invoices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_Country",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_District",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_PostalCode",
                schema: "sales",
                table: "Invoices",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_RecipientName",
                schema: "sales",
                table: "Invoices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_RecipientPhone",
                schema: "sales",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_State",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_TaxId",
                schema: "sales",
                table: "Invoices",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_TaxOffice",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Billing_Town",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                schema: "sales",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerTaxOffice",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryNoteId",
                schema: "sales",
                table: "Invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryNoteNumber",
                schema: "sales",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "QuotationId",
                schema: "sales",
                table: "Invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SalesOrderNumber",
                schema: "sales",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ShipmentId",
                schema: "sales",
                table: "Invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipmentNumber",
                schema: "sales",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AdvancePayments",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CustomerTaxNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    OrderTotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AppliedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RefundedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false, defaultValue: 1m),
                    PaymentMethod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BankName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BankAccountNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CheckNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CheckDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CapturedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CapturedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CapturedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RefundedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RefundedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    RefundReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ReceiptNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReceiptDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdvancePayments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BackOrders",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BackOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BackOrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EstimatedRestockDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualFulfillmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CustomerNotified = table.Column<bool>(type: "boolean", nullable: false),
                    CustomerNotifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsAutoFulfill = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BackOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditNotes",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreditNoteNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreditNoteDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ReasonDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SalesReturnId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesReturnNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CustomerTaxNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CustomerAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SubTotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false, defaultValue: 1m),
                    AppliedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsVoided = table.Column<bool>(type: "boolean", nullable: false),
                    VoidReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    VoidedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsEDocument = table.Column<bool>(type: "boolean", nullable: false),
                    EDocumentId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EDocumentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerContracts",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ContractType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CustomerTaxNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ContractValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ContractValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    MinimumAnnualCommitment = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MinimumAnnualCommitmentCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    PriceListId = table.Column<Guid>(type: "uuid", nullable: true),
                    GeneralDiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    DefaultPaymentDueDays = table.Column<int>(type: "integer", nullable: false),
                    CreditLimit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CreditLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    AutoRenewal = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalPeriodMonths = table.Column<int>(type: "integer", nullable: true),
                    RenewalNoticeBeforeDays = table.Column<int>(type: "integer", nullable: true),
                    SalesRepresentativeId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesRepresentativeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerSignatory = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerSignatoryTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CompanySignatory = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CompanySignatoryTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SpecialTerms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    InternalNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TerminatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TerminationReason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TerminationType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ServiceLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ResponseTimeHours = table.Column<int>(type: "integer", nullable: true),
                    ResolutionTimeHours = table.Column<int>(type: "integer", nullable: true),
                    SupportHours = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DedicatedSupportContact = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SupportPriority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IncludesOnSiteSupport = table.Column<bool>(type: "boolean", nullable: false),
                    CurrentCreditBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreditLimitLastReviewDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RenewalGracePeriodDays = table.Column<int>(type: "integer", nullable: false),
                    IsBlocked = table.Column<bool>(type: "boolean", nullable: false),
                    BlockReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerContracts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerSegments",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    MinimumOrderAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaximumOrderAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AllowSpecialPricing = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultCreditLimit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DefaultPaymentTermDays = table.Column<int>(type: "integer", nullable: false),
                    RequiresAdvancePayment = table.Column<bool>(type: "boolean", nullable: false),
                    AdvancePaymentPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ServiceLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MaxResponseTimeHours = table.Column<int>(type: "integer", nullable: true),
                    HasDedicatedSupport = table.Column<bool>(type: "boolean", nullable: false),
                    MinimumAnnualRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MinimumOrderCount = table.Column<int>(type: "integer", nullable: true),
                    MinimumMonthsAsCustomer = table.Column<int>(type: "integer", nullable: true),
                    FreeShipping = table.Column<bool>(type: "boolean", nullable: false),
                    FreeShippingThreshold = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    EarlyAccessToProducts = table.Column<bool>(type: "boolean", nullable: false),
                    ExclusivePromotions = table.Column<bool>(type: "boolean", nullable: false),
                    BenefitsDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BadgeIcon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    CustomerCount = table.Column<int>(type: "integer", nullable: false),
                    TotalRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AverageOrderValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventoryReservations",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReservationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReservedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AllocatedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Adet"),
                    LotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SalesOrderItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ReservedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReservedUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReleasedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AllocatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FulfilledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    IsAutoRelease = table.Column<bool>(type: "boolean", nullable: false),
                    ReservedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReservedByName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryReservations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Opportunities",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpportunityNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ContactName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Stage = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PipelineId = table.Column<Guid>(type: "uuid", nullable: true),
                    PipelineStageId = table.Column<Guid>(type: "uuid", nullable: true),
                    EstimatedValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    Probability = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualCloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsWon = table.Column<bool>(type: "boolean", nullable: false),
                    IsLost = table.Column<bool>(type: "boolean", nullable: false),
                    ClosedReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LostToCompetitor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SalesPersonId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesPersonName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SalesTeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    TerritoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                    QuotationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opportunities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesPipelines",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TotalOpportunities = table.Column<int>(type: "integer", nullable: false),
                    TotalPipelineValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AverageConversionRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    AverageDaysToClose = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesPipelines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesTerritories",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TerritoryCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TerritoryType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ParentTerritoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    HierarchyLevel = table.Column<int>(type: "integer", nullable: false),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Region = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GeoBoundary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TerritoryManagerId = table.Column<Guid>(type: "uuid", nullable: true),
                    TerritoryManagerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DefaultPriceListId = table.Column<Guid>(type: "uuid", nullable: true),
                    PotentialValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    PotentialValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    AnnualTarget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AnnualTargetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LastPerformanceScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    LastPerformanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTerritories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesTerritories_SalesTerritories_ParentTerritoryId",
                        column: x => x.ParentTerritoryId,
                        principalSchema: "sales",
                        principalTable: "SalesTerritories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceOrders",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AssetTag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    WarrantyId = table.Column<Guid>(type: "uuid", nullable: true),
                    WarrantyNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsCoveredByWarranty = table.Column<bool>(type: "boolean", nullable: false),
                    ReportedIssue = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DiagnosisNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RepairNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IssueCategory = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ScheduledEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedDuration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    Location = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ServiceAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TechnicianId = table.Column<Guid>(type: "uuid", nullable: true),
                    TechnicianName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AssignedTeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssignedTeamName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActualDuration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    IsBillable = table.Column<bool>(type: "boolean", nullable: false),
                    LaborCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PartsCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TravelCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OtherCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    IsInvoiced = table.Column<bool>(type: "boolean", nullable: false),
                    ServiceInvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceInvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InvoicedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerRating = table.Column<int>(type: "integer", nullable: true),
                    CustomerFeedback = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    FeedbackDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warranties",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WarrantyNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LotNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SalesOrderItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CoverageType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CoverageDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MaxClaimAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxClaimCount = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsVoid = table.Column<bool>(type: "boolean", nullable: false),
                    VoidReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    VoidedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsExtended = table.Column<bool>(type: "boolean", nullable: false),
                    OriginalWarrantyId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExtensionPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ExtendedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsRegistered = table.Column<bool>(type: "boolean", nullable: false),
                    RegisteredDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RegisteredBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warranties", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BackOrderItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BackOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    SalesOrderItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Adet"),
                    OrderedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AvailableQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    FulfilledQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AllowSubstitution = table.Column<bool>(type: "boolean", nullable: false),
                    SubstituteProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    SubstituteProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ItemEstimatedRestockDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    PurchaseOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BackOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BackOrderItems_BackOrders_BackOrderId",
                        column: x => x.BackOrderId,
                        principalSchema: "sales",
                        principalTable: "BackOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditNoteItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreditNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    InvoiceItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Adet"),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditNoteItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditNoteItems_CreditNotes_CreditNoteId",
                        column: x => x.CreditNoteId,
                        principalSchema: "sales",
                        principalTable: "CreditNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractCommitments",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    CommitmentType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Period = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TargetAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TargetAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ActualAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BonusPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PenaltyPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IsAchieved = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractCommitments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractCommitments_CustomerContracts_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "sales",
                        principalTable: "CustomerContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractDocuments",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractDocuments_CustomerContracts_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "sales",
                        principalTable: "CustomerContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractPaymentTerms",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    TermType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DueDays = table.Column<int>(type: "integer", nullable: false),
                    EarlyPaymentDiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    EarlyPaymentDiscountDays = table.Column<int>(type: "integer", nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractPaymentTerms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractPaymentTerms_CustomerContracts_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "sales",
                        principalTable: "CustomerContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractPriceAgreements",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SpecialPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SpecialPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    MinimumQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractPriceAgreements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractPriceAgreements_CustomerContracts_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "sales",
                        principalTable: "CustomerContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PipelineStages",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PipelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SuccessProbability = table.Column<int>(type: "integer", nullable: false),
                    OpportunityCount = table.Column<int>(type: "integer", nullable: false),
                    StageValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RequiredDocuments = table.Column<string>(type: "text", nullable: false),
                    RequiredActions = table.Column<string>(type: "text", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    MaxDaysInStage = table.Column<int>(type: "integer", nullable: true),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PipelineStages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PipelineStages_SalesPipelines_PipelineId",
                        column: x => x.PipelineId,
                        principalSchema: "sales",
                        principalTable: "SalesPipelines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TerritoryAssignments",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TerritoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesRepresentativeId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesRepresentativeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CommissionRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TerritoryAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TerritoryAssignments_SalesTerritories_TerritoryId",
                        column: x => x.TerritoryId,
                        principalSchema: "sales",
                        principalTable: "SalesTerritories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TerritoryCustomers",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TerritoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PrimarySalesRepresentativeId = table.Column<Guid>(type: "uuid", nullable: true),
                    PrimarySalesRepresentativeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TerritoryCustomers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TerritoryCustomers_SalesTerritories_TerritoryId",
                        column: x => x.TerritoryId,
                        principalSchema: "sales",
                        principalTable: "SalesTerritories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TerritoryPostalCodes",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TerritoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AreaName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TerritoryPostalCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TerritoryPostalCodes_SalesTerritories_TerritoryId",
                        column: x => x.TerritoryId,
                        principalSchema: "sales",
                        principalTable: "SalesTerritories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceOrderItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ItemType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Adet"),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    HoursWorked = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    HourlyRate = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    IsCoveredByWarranty = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceOrderItems_ServiceOrders_ServiceOrderId",
                        column: x => x.ServiceOrderId,
                        principalSchema: "sales",
                        principalTable: "ServiceOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceOrderNotes",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrderNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceOrderNotes_ServiceOrders_ServiceOrderId",
                        column: x => x.ServiceOrderId,
                        principalSchema: "sales",
                        principalTable: "ServiceOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyClaims",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WarrantyId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ClaimDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssueDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ClaimType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FailureCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DiagnosticNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Resolution = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ResolutionType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ResolvedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ClaimAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ApprovedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ReplacementProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReplacementSerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ServiceOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_Warranties_WarrantyId",
                        column: x => x.WarrantyId,
                        principalSchema: "sales",
                        principalTable: "Warranties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_PaymentDueDate",
                schema: "sales",
                table: "SalesOrders",
                column: "PaymentDueDate");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_FulfillmentStatus",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "FulfillmentStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_InvoicingStatus",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "InvoicingStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_IsStockReserved",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "IsStockReserved" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_PaymentStatus",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "PaymentStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_QuotationId",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_TenantId_TerritoryId",
                schema: "sales",
                table: "SalesOrders",
                columns: new[] { "TenantId", "TerritoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_DeliveryNoteId",
                schema: "sales",
                table: "Invoices",
                columns: new[] { "TenantId", "DeliveryNoteId" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_QuotationId",
                schema: "sales",
                table: "Invoices",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_ShipmentId",
                schema: "sales",
                table: "Invoices",
                columns: new[] { "TenantId", "ShipmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_CustomerId",
                schema: "sales",
                table: "AdvancePayments",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_PaymentDate",
                schema: "sales",
                table: "AdvancePayments",
                column: "PaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_PaymentNumber",
                schema: "sales",
                table: "AdvancePayments",
                column: "PaymentNumber");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_SalesOrderId",
                schema: "sales",
                table: "AdvancePayments",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_Status",
                schema: "sales",
                table: "AdvancePayments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_TenantId",
                schema: "sales",
                table: "AdvancePayments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_TenantId_CustomerId_Status",
                schema: "sales",
                table: "AdvancePayments",
                columns: new[] { "TenantId", "CustomerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_TenantId_PaymentNumber",
                schema: "sales",
                table: "AdvancePayments",
                columns: new[] { "TenantId", "PaymentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdvancePayments_TenantId_Status",
                schema: "sales",
                table: "AdvancePayments",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BackOrderItems_BackOrderId",
                schema: "sales",
                table: "BackOrderItems",
                column: "BackOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrderItems_ProductId",
                schema: "sales",
                table: "BackOrderItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrderItems_PurchaseOrderId",
                schema: "sales",
                table: "BackOrderItems",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrderItems_SalesOrderItemId",
                schema: "sales",
                table: "BackOrderItems",
                column: "SalesOrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrderItems_TenantId",
                schema: "sales",
                table: "BackOrderItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_BackOrderNumber",
                schema: "sales",
                table: "BackOrders",
                column: "BackOrderNumber");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_CustomerId",
                schema: "sales",
                table: "BackOrders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_EstimatedRestockDate",
                schema: "sales",
                table: "BackOrders",
                column: "EstimatedRestockDate");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_Priority",
                schema: "sales",
                table: "BackOrders",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_SalesOrderId",
                schema: "sales",
                table: "BackOrders",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_Status",
                schema: "sales",
                table: "BackOrders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_TenantId",
                schema: "sales",
                table: "BackOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_TenantId_BackOrderNumber",
                schema: "sales",
                table: "BackOrders",
                columns: new[] { "TenantId", "BackOrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_TenantId_Status_Priority",
                schema: "sales",
                table: "BackOrders",
                columns: new[] { "TenantId", "Status", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_BackOrders_WarehouseId",
                schema: "sales",
                table: "BackOrders",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractCommitments_ContractId",
                schema: "sales",
                table: "ContractCommitments",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractCommitments_ContractId_CommitmentType",
                schema: "sales",
                table: "ContractCommitments",
                columns: new[] { "ContractId", "CommitmentType" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractCommitments_ContractId_IsAchieved",
                schema: "sales",
                table: "ContractCommitments",
                columns: new[] { "ContractId", "IsAchieved" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractDocuments_ContractId",
                schema: "sales",
                table: "ContractDocuments",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractDocuments_ContractId_DocumentType",
                schema: "sales",
                table: "ContractDocuments",
                columns: new[] { "ContractId", "DocumentType" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractPaymentTerms_ContractId",
                schema: "sales",
                table: "ContractPaymentTerms",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractPaymentTerms_ContractId_IsDefault",
                schema: "sales",
                table: "ContractPaymentTerms",
                columns: new[] { "ContractId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractPriceAgreements_ContractId",
                schema: "sales",
                table: "ContractPriceAgreements",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractPriceAgreements_ContractId_IsActive",
                schema: "sales",
                table: "ContractPriceAgreements",
                columns: new[] { "ContractId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractPriceAgreements_ContractId_ProductId",
                schema: "sales",
                table: "ContractPriceAgreements",
                columns: new[] { "ContractId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractPriceAgreements_ProductId",
                schema: "sales",
                table: "ContractPriceAgreements",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNoteItems_CreditNoteId",
                schema: "sales",
                table: "CreditNoteItems",
                column: "CreditNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNoteItems_InvoiceItemId",
                schema: "sales",
                table: "CreditNoteItems",
                column: "InvoiceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNoteItems_ProductId",
                schema: "sales",
                table: "CreditNoteItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNoteItems_TenantId",
                schema: "sales",
                table: "CreditNoteItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_CreditNoteDate",
                schema: "sales",
                table: "CreditNotes",
                column: "CreditNoteDate");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_CreditNoteNumber",
                schema: "sales",
                table: "CreditNotes",
                column: "CreditNoteNumber");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_CustomerId",
                schema: "sales",
                table: "CreditNotes",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_InvoiceId",
                schema: "sales",
                table: "CreditNotes",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_SalesOrderId",
                schema: "sales",
                table: "CreditNotes",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_SalesReturnId",
                schema: "sales",
                table: "CreditNotes",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_Status",
                schema: "sales",
                table: "CreditNotes",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_TenantId",
                schema: "sales",
                table: "CreditNotes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_TenantId_CreditNoteNumber",
                schema: "sales",
                table: "CreditNotes",
                columns: new[] { "TenantId", "CreditNoteNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditNotes_TenantId_Status_IsApproved",
                schema: "sales",
                table: "CreditNotes",
                columns: new[] { "TenantId", "Status", "IsApproved" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_ContractNumber",
                schema: "sales",
                table: "CustomerContracts",
                column: "ContractNumber");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_CustomerId",
                schema: "sales",
                table: "CustomerContracts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_EndDate",
                schema: "sales",
                table: "CustomerContracts",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_IsBlocked",
                schema: "sales",
                table: "CustomerContracts",
                column: "IsBlocked");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_SalesRepresentativeId",
                schema: "sales",
                table: "CustomerContracts",
                column: "SalesRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_ServiceLevel",
                schema: "sales",
                table: "CustomerContracts",
                column: "ServiceLevel");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_Status",
                schema: "sales",
                table: "CustomerContracts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId",
                schema: "sales",
                table: "CustomerContracts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId_ContractNumber",
                schema: "sales",
                table: "CustomerContracts",
                columns: new[] { "TenantId", "ContractNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId_CustomerId",
                schema: "sales",
                table: "CustomerContracts",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId_EndDate",
                schema: "sales",
                table: "CustomerContracts",
                columns: new[] { "TenantId", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId_IsBlocked",
                schema: "sales",
                table: "CustomerContracts",
                columns: new[] { "TenantId", "IsBlocked" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId_ServiceLevel",
                schema: "sales",
                table: "CustomerContracts",
                columns: new[] { "TenantId", "ServiceLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContracts_TenantId_Status",
                schema: "sales",
                table: "CustomerContracts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_Code",
                schema: "sales",
                table: "CustomerSegments",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_IsActive",
                schema: "sales",
                table: "CustomerSegments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_IsDefault",
                schema: "sales",
                table: "CustomerSegments",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_Priority",
                schema: "sales",
                table: "CustomerSegments",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId",
                schema: "sales",
                table: "CustomerSegments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId_Code",
                schema: "sales",
                table: "CustomerSegments",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId_IsActive",
                schema: "sales",
                table: "CustomerSegments",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId_IsDefault",
                schema: "sales",
                table: "CustomerSegments",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_OpportunityId",
                schema: "sales",
                table: "InventoryReservations",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_ProductId",
                schema: "sales",
                table: "InventoryReservations",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_ReservationNumber",
                schema: "sales",
                table: "InventoryReservations",
                column: "ReservationNumber");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_ReservedUntil",
                schema: "sales",
                table: "InventoryReservations",
                column: "ReservedUntil");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_SalesOrderId",
                schema: "sales",
                table: "InventoryReservations",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_SalesOrderItemId",
                schema: "sales",
                table: "InventoryReservations",
                column: "SalesOrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_Status",
                schema: "sales",
                table: "InventoryReservations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_TenantId",
                schema: "sales",
                table: "InventoryReservations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_TenantId_ProductId_Status",
                schema: "sales",
                table: "InventoryReservations",
                columns: new[] { "TenantId", "ProductId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_TenantId_ReservationNumber",
                schema: "sales",
                table: "InventoryReservations",
                columns: new[] { "TenantId", "ReservationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_TenantId_Status_ReservedUntil",
                schema: "sales",
                table: "InventoryReservations",
                columns: new[] { "TenantId", "Status", "ReservedUntil" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_WarehouseId",
                schema: "sales",
                table: "InventoryReservations",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_CustomerId",
                schema: "sales",
                table: "Opportunities",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ExpectedCloseDate",
                schema: "sales",
                table: "Opportunities",
                column: "ExpectedCloseDate");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_OpportunityNumber",
                schema: "sales",
                table: "Opportunities",
                column: "OpportunityNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_PipelineId",
                schema: "sales",
                table: "Opportunities",
                column: "PipelineId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_PipelineStageId",
                schema: "sales",
                table: "Opportunities",
                column: "PipelineStageId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_QuotationId",
                schema: "sales",
                table: "Opportunities",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_SalesOrderId",
                schema: "sales",
                table: "Opportunities",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_SalesPersonId",
                schema: "sales",
                table: "Opportunities",
                column: "SalesPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_Stage",
                schema: "sales",
                table: "Opportunities",
                column: "Stage");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId",
                schema: "sales",
                table: "Opportunities",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_OpportunityNumber",
                schema: "sales",
                table: "Opportunities",
                columns: new[] { "TenantId", "OpportunityNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_PipelineId_PipelineStageId",
                schema: "sales",
                table: "Opportunities",
                columns: new[] { "TenantId", "PipelineId", "PipelineStageId" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_Stage_IsWon_IsLost",
                schema: "sales",
                table: "Opportunities",
                columns: new[] { "TenantId", "Stage", "IsWon", "IsLost" });

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_Category",
                schema: "sales",
                table: "PipelineStages",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_PipelineId",
                schema: "sales",
                table: "PipelineStages",
                column: "PipelineId");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_PipelineId_Code",
                schema: "sales",
                table: "PipelineStages",
                columns: new[] { "PipelineId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_PipelineId_OrderIndex",
                schema: "sales",
                table: "PipelineStages",
                columns: new[] { "PipelineId", "OrderIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_TenantId",
                schema: "sales",
                table: "PipelineStages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesPipelines_Code",
                schema: "sales",
                table: "SalesPipelines",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_SalesPipelines_IsActive",
                schema: "sales",
                table: "SalesPipelines",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SalesPipelines_IsDefault",
                schema: "sales",
                table: "SalesPipelines",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_SalesPipelines_TenantId",
                schema: "sales",
                table: "SalesPipelines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesPipelines_TenantId_Code",
                schema: "sales",
                table: "SalesPipelines",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesPipelines_TenantId_IsDefault",
                schema: "sales",
                table: "SalesPipelines",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_ParentTerritoryId",
                schema: "sales",
                table: "SalesTerritories",
                column: "ParentTerritoryId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_Status",
                schema: "sales",
                table: "SalesTerritories",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TenantId",
                schema: "sales",
                table: "SalesTerritories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TenantId_Country_Region_City",
                schema: "sales",
                table: "SalesTerritories",
                columns: new[] { "TenantId", "Country", "Region", "City" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TenantId_ParentTerritoryId",
                schema: "sales",
                table: "SalesTerritories",
                columns: new[] { "TenantId", "ParentTerritoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TenantId_Status",
                schema: "sales",
                table: "SalesTerritories",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TenantId_TerritoryCode",
                schema: "sales",
                table: "SalesTerritories",
                columns: new[] { "TenantId", "TerritoryCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TenantId_TerritoryManagerId",
                schema: "sales",
                table: "SalesTerritories",
                columns: new[] { "TenantId", "TerritoryManagerId" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TerritoryCode",
                schema: "sales",
                table: "SalesTerritories",
                column: "TerritoryCode");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_TerritoryType",
                schema: "sales",
                table: "SalesTerritories",
                column: "TerritoryType");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderItems_ItemType",
                schema: "sales",
                table: "ServiceOrderItems",
                column: "ItemType");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderItems_ProductId",
                schema: "sales",
                table: "ServiceOrderItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderItems_ServiceOrderId",
                schema: "sales",
                table: "ServiceOrderItems",
                column: "ServiceOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderItems_TenantId",
                schema: "sales",
                table: "ServiceOrderItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderNotes_CreatedAt",
                schema: "sales",
                table: "ServiceOrderNotes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderNotes_ServiceOrderId",
                schema: "sales",
                table: "ServiceOrderNotes",
                column: "ServiceOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderNotes_TenantId",
                schema: "sales",
                table: "ServiceOrderNotes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderNotes_Type",
                schema: "sales",
                table: "ServiceOrderNotes",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_CustomerId",
                schema: "sales",
                table: "ServiceOrders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_Priority",
                schema: "sales",
                table: "ServiceOrders",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_ProductId",
                schema: "sales",
                table: "ServiceOrders",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_SalesOrderId",
                schema: "sales",
                table: "ServiceOrders",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_ScheduledDate",
                schema: "sales",
                table: "ServiceOrders",
                column: "ScheduledDate");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_SerialNumber",
                schema: "sales",
                table: "ServiceOrders",
                column: "SerialNumber");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_ServiceOrderNumber",
                schema: "sales",
                table: "ServiceOrders",
                column: "ServiceOrderNumber");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_Status",
                schema: "sales",
                table: "ServiceOrders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_TechnicianId",
                schema: "sales",
                table: "ServiceOrders",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_TenantId",
                schema: "sales",
                table: "ServiceOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_TenantId_ServiceOrderNumber",
                schema: "sales",
                table: "ServiceOrders",
                columns: new[] { "TenantId", "ServiceOrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_TenantId_Status",
                schema: "sales",
                table: "ServiceOrders",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_TenantId_TechnicianId_Status",
                schema: "sales",
                table: "ServiceOrders",
                columns: new[] { "TenantId", "TechnicianId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_WarrantyId",
                schema: "sales",
                table: "ServiceOrders",
                column: "WarrantyId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_SalesRepresentativeId",
                schema: "sales",
                table: "TerritoryAssignments",
                column: "SalesRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_SalesRepresentativeId_IsActive",
                schema: "sales",
                table: "TerritoryAssignments",
                columns: new[] { "SalesRepresentativeId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_TerritoryId",
                schema: "sales",
                table: "TerritoryAssignments",
                column: "TerritoryId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_TerritoryId_IsActive",
                schema: "sales",
                table: "TerritoryAssignments",
                columns: new[] { "TerritoryId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_TerritoryId_Role_IsActive",
                schema: "sales",
                table: "TerritoryAssignments",
                columns: new[] { "TerritoryId", "Role", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_TerritoryId_SalesRepresentativeId",
                schema: "sales",
                table: "TerritoryAssignments",
                columns: new[] { "TerritoryId", "SalesRepresentativeId" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryCustomers_CustomerId",
                schema: "sales",
                table: "TerritoryCustomers",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryCustomers_CustomerId_IsActive",
                schema: "sales",
                table: "TerritoryCustomers",
                columns: new[] { "CustomerId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryCustomers_PrimarySalesRepresentativeId",
                schema: "sales",
                table: "TerritoryCustomers",
                column: "PrimarySalesRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryCustomers_TerritoryId",
                schema: "sales",
                table: "TerritoryCustomers",
                column: "TerritoryId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryCustomers_TerritoryId_CustomerId",
                schema: "sales",
                table: "TerritoryCustomers",
                columns: new[] { "TerritoryId", "CustomerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryCustomers_TerritoryId_IsActive",
                schema: "sales",
                table: "TerritoryCustomers",
                columns: new[] { "TerritoryId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryPostalCodes_PostalCode",
                schema: "sales",
                table: "TerritoryPostalCodes",
                column: "PostalCode");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryPostalCodes_TerritoryId",
                schema: "sales",
                table: "TerritoryPostalCodes",
                column: "TerritoryId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryPostalCodes_TerritoryId_PostalCode",
                schema: "sales",
                table: "TerritoryPostalCodes",
                columns: new[] { "TerritoryId", "PostalCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_CustomerId",
                schema: "sales",
                table: "Warranties",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_EndDate",
                schema: "sales",
                table: "Warranties",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_InvoiceId",
                schema: "sales",
                table: "Warranties",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_ProductId",
                schema: "sales",
                table: "Warranties",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_SalesOrderId",
                schema: "sales",
                table: "Warranties",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_SerialNumber",
                schema: "sales",
                table: "Warranties",
                column: "SerialNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_Status",
                schema: "sales",
                table: "Warranties",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_TenantId",
                schema: "sales",
                table: "Warranties",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_TenantId_Status_EndDate",
                schema: "sales",
                table: "Warranties",
                columns: new[] { "TenantId", "Status", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_TenantId_WarrantyNumber",
                schema: "sales",
                table: "Warranties",
                columns: new[] { "TenantId", "WarrantyNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_WarrantyNumber",
                schema: "sales",
                table: "Warranties",
                column: "WarrantyNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_ClaimDate",
                schema: "sales",
                table: "WarrantyClaims",
                column: "ClaimDate");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_ClaimNumber",
                schema: "sales",
                table: "WarrantyClaims",
                column: "ClaimNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_Status",
                schema: "sales",
                table: "WarrantyClaims",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_TenantId",
                schema: "sales",
                table: "WarrantyClaims",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_TenantId_ClaimNumber",
                schema: "sales",
                table: "WarrantyClaims",
                columns: new[] { "TenantId", "ClaimNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_TenantId_Status",
                schema: "sales",
                table: "WarrantyClaims",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_WarrantyId",
                schema: "sales",
                table: "WarrantyClaims",
                column: "WarrantyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdvancePayments",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "BackOrderItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ContractCommitments",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ContractDocuments",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ContractPaymentTerms",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ContractPriceAgreements",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "CreditNoteItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "CustomerSegments",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "InventoryReservations",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "Opportunities",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "PipelineStages",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ServiceOrderItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ServiceOrderNotes",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "TerritoryAssignments",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "TerritoryCustomers",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "TerritoryPostalCodes",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "WarrantyClaims",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "BackOrders",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "CustomerContracts",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "CreditNotes",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesPipelines",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "ServiceOrders",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesTerritories",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "Warranties",
                schema: "sales");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_PaymentDueDate",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_FulfillmentStatus",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_InvoicingStatus",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_IsStockReserved",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_PaymentStatus",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_QuotationId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_TenantId_TerritoryId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_DeliveryNoteId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_QuotationId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_ShipmentId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_AddressLine1",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_AddressLine2",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_City",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_CompanyName",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_Country",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_District",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_PostalCode",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_RecipientName",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_RecipientPhone",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_State",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_TaxId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_TaxOffice",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_Town",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "CompletedShipmentCount",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "CustomerContractId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "FulfillmentStatus",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "InvoicingStatus",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "IsStockReserved",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "PaymentDueDate",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "QuotationId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "QuotationNumber",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "ReservationExpiryDate",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_AddressLine1",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_AddressLine2",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_City",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_CompanyName",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_Country",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_District",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_PostalCode",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_RecipientName",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_RecipientPhone",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_State",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_TaxId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_TaxOffice",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Shipping_Town",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TerritoryId",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TerritoryName",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TotalAdvancePaymentAmount",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TotalInvoicedAmount",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TotalPaymentAmount",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TotalReservedQuantity",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "UnresolvedBackOrderCount",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Billing_AddressLine1",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_AddressLine2",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_City",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_CompanyName",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_Country",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_District",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_PostalCode",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_RecipientName",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_RecipientPhone",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_State",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_TaxId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_TaxOffice",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Billing_Town",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "CustomerTaxOffice",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeliveryNoteId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeliveryNoteNumber",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "QuotationId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "SalesOrderNumber",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ShipmentId",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ShipmentNumber",
                schema: "sales",
                table: "Invoices");
        }
    }
}
