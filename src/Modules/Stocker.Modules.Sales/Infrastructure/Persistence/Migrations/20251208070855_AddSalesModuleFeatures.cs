using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesModuleFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CommissionPlans",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CalculationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BaseRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    BaseAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsTiered = table.Column<bool>(type: "boolean", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApplicableProductCategories = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableProducts = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ExcludedProducts = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableSalesPersons = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableRoles = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IncludeVat = table.Column<bool>(type: "boolean", nullable: false),
                    CalculateOnProfit = table.Column<bool>(type: "boolean", nullable: false),
                    MinimumSaleAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumCommissionAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommissionPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Discounts",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ValueType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Value = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MinimumOrderAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumDiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MinimumQuantity = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UsageLimit = table.Column<int>(type: "integer", nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false),
                    IsStackable = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Applicability = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ApplicableProductIds = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableCategoryIds = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableCustomerIds = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableCustomerGroupIds = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ExcludedProductIds = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ExcludedCategoryIds = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    RequiresCouponCode = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Discounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Promotions",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    IsStackable = table.Column<bool>(type: "boolean", nullable: false),
                    IsExclusive = table.Column<bool>(type: "boolean", nullable: false),
                    UsageLimit = table.Column<int>(type: "integer", nullable: true),
                    UsageLimitPerCustomer = table.Column<int>(type: "integer", nullable: true),
                    TotalUsageCount = table.Column<int>(type: "integer", nullable: false),
                    MinimumOrderAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumDiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ApplicableChannels = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TargetCustomerSegments = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    TargetProductCategories = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ExcludedProducts = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BannerUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TermsAndConditions = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promotions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Quotations",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    QuotationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerTaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesPersonId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesPersonName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SubTotal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ShippingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false, defaultValue: 1m),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ShippingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PaymentTerms = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DeliveryTerms = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ValidityDays = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TermsAndConditions = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ApprovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AcceptedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ConvertedToOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    ConvertedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevisionNumber = table.Column<int>(type: "integer", nullable: false),
                    ParentQuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesCommissions",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesPersonId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesPersonName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CommissionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    CommissionPlanName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SaleAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CommissionAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CommissionRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CalculatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    PaidDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesCommissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesReturns",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReturnNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReasonDetails = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubTotal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RefundAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RefundMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RefundReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RefundDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RestockItems = table.Column<bool>(type: "boolean", nullable: false),
                    RestockWarehouseId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsRestocked = table.Column<bool>(type: "boolean", nullable: false),
                    RestockedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProcessedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ProcessedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreditNoteId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesReturns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CommissionTiers",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CommissionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FromAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ToAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CalculationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    FixedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommissionTiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommissionTiers_CommissionPlans_CommissionPlanId",
                        column: x => x.CommissionPlanId,
                        principalSchema: "sales",
                        principalTable: "CommissionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PromotionRules",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PromotionId = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Condition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DiscountType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ApplicableProducts = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ApplicableCategories = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    MinimumQuantity = table.Column<int>(type: "integer", nullable: true),
                    MaximumQuantity = table.Column<int>(type: "integer", nullable: true),
                    FreeProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    FreeProductQuantity = table.Column<int>(type: "integer", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromotionRules_Promotions_PromotionId",
                        column: x => x.PromotionId,
                        principalSchema: "sales",
                        principalTable: "Promotions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuotationItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Adet"),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 20m),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuotationItems_Quotations_QuotationId",
                        column: x => x.QuotationId,
                        principalSchema: "sales",
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesReturnItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesReturnId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    QuantityOrdered = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    QuantityReturned = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Adet"),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Condition = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ConditionNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsRestockable = table.Column<bool>(type: "boolean", nullable: false),
                    IsRestocked = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesReturnItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesReturnItems_SalesReturns_SalesReturnId",
                        column: x => x.SalesReturnId,
                        principalSchema: "sales",
                        principalTable: "SalesReturns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommissionPlans_IsActive",
                schema: "sales",
                table: "CommissionPlans",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_CommissionPlans_TenantId",
                schema: "sales",
                table: "CommissionPlans",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CommissionPlans_Type",
                schema: "sales",
                table: "CommissionPlans",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_CommissionTiers_CommissionPlanId",
                schema: "sales",
                table: "CommissionTiers",
                column: "CommissionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_Code",
                schema: "sales",
                table: "Discounts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_EndDate",
                schema: "sales",
                table: "Discounts",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_IsActive",
                schema: "sales",
                table: "Discounts",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_StartDate",
                schema: "sales",
                table: "Discounts",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_TenantId",
                schema: "sales",
                table: "Discounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_Type",
                schema: "sales",
                table: "Discounts",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionRules_PromotionId",
                schema: "sales",
                table: "PromotionRules",
                column: "PromotionId");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_Code",
                schema: "sales",
                table: "Promotions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_EndDate",
                schema: "sales",
                table: "Promotions",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_IsActive",
                schema: "sales",
                table: "Promotions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_StartDate",
                schema: "sales",
                table: "Promotions",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_Status",
                schema: "sales",
                table: "Promotions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_TenantId",
                schema: "sales",
                table: "Promotions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_ProductId",
                schema: "sales",
                table: "QuotationItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_QuotationId",
                schema: "sales",
                table: "QuotationItems",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_TenantId",
                schema: "sales",
                table: "QuotationItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_CustomerId",
                schema: "sales",
                table: "Quotations",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_QuotationDate",
                schema: "sales",
                table: "Quotations",
                column: "QuotationDate");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_QuotationNumber",
                schema: "sales",
                table: "Quotations",
                column: "QuotationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_SalesPersonId",
                schema: "sales",
                table: "Quotations",
                column: "SalesPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_Status",
                schema: "sales",
                table: "Quotations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId",
                schema: "sales",
                table: "Quotations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesCommissions_CalculatedDate",
                schema: "sales",
                table: "SalesCommissions",
                column: "CalculatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_SalesCommissions_SalesOrderId",
                schema: "sales",
                table: "SalesCommissions",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesCommissions_SalesPersonId",
                schema: "sales",
                table: "SalesCommissions",
                column: "SalesPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesCommissions_Status",
                schema: "sales",
                table: "SalesCommissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SalesCommissions_TenantId",
                schema: "sales",
                table: "SalesCommissions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturnItems_ProductId",
                schema: "sales",
                table: "SalesReturnItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturnItems_SalesReturnId",
                schema: "sales",
                table: "SalesReturnItems",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturnItems_TenantId",
                schema: "sales",
                table: "SalesReturnItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturns_CustomerId",
                schema: "sales",
                table: "SalesReturns",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturns_ReturnDate",
                schema: "sales",
                table: "SalesReturns",
                column: "ReturnDate");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturns_ReturnNumber",
                schema: "sales",
                table: "SalesReturns",
                column: "ReturnNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturns_SalesOrderId",
                schema: "sales",
                table: "SalesReturns",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturns_Status",
                schema: "sales",
                table: "SalesReturns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SalesReturns_TenantId",
                schema: "sales",
                table: "SalesReturns",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommissionTiers",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "Discounts",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "PromotionRules",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "QuotationItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesCommissions",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesReturnItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "CommissionPlans",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "Promotions",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "Quotations",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesReturns",
                schema: "sales");
        }
    }
}
