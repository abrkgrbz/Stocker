using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddModulePricingAndIyzicoSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IncludedUsers",
                schema: "master",
                table: "Packages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "IyzicoPlanId",
                schema: "master",
                table: "Packages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IyzicoProductId",
                schema: "master",
                table: "Packages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Package_MaxUsers",
                schema: "master",
                table: "Packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PricePerUserAmount",
                schema: "master",
                table: "Packages",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PricePerUserCurrency",
                schema: "master",
                table: "Packages",
                type: "character varying(3)",
                maxLength: 3,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                schema: "master",
                table: "AddOns",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuantityUnit",
                schema: "master",
                table: "AddOns",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequiredModuleCode",
                schema: "master",
                table: "AddOns",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "master",
                table: "AddOns",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Feature");

            migrationBuilder.AddColumn<decimal>(
                name: "YearlyPriceAmount",
                schema: "master",
                table: "AddOns",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YearlyPriceCurrency",
                schema: "master",
                table: "AddOns",
                type: "character varying(3)",
                maxLength: 3,
                nullable: true,
                defaultValue: "TRY");

            migrationBuilder.CreateTable(
                name: "IyzicoSubscriptions",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: true),
                    IyzicoSubscriptionReferenceCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IyzicoCustomerReferenceCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IyzicoPricingPlanReferenceCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IyzicoParentReferenceCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CustomerEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerGsmNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CustomerIdentityNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PlanName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TrialStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrialEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CardToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CardBrand = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CardLastFour = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    CardHolderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CardAssociation = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CardFamily = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    BillingPeriod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "MONTHLY"),
                    BillingPeriodCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    InstallmentCount = table.Column<int>(type: "integer", nullable: true),
                    InstallmentPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    BillingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingZipCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastWebhookEventId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastWebhookAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailureReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IyzicoSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IyzicoSubscriptions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModuleBundles",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BundleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BundleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Icon = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MonthlyPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    YearlyPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    YearlyPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleBundles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModulePricing",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ModuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MonthlyPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    YearlyPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    YearlyPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    IsCore = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    TrialDays = table.Column<int>(type: "integer", nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IncludedFeaturesJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModulePricing", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionAddOns",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddOnId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddOnCode = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AddOnName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CancellationReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionAddOns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionAddOns_AddOns_AddOnId",
                        column: x => x.AddOnId,
                        principalSchema: "master",
                        principalTable: "AddOns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubscriptionAddOns_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalSchema: "master",
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModuleBundleItems",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleBundleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleBundleItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModuleBundleItems_ModuleBundles_ModuleBundleId",
                        column: x => x.ModuleBundleId,
                        principalSchema: "master",
                        principalTable: "ModuleBundles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AddOns_RequiredModuleCode",
                schema: "master",
                table: "AddOns",
                column: "RequiredModuleCode");

            migrationBuilder.CreateIndex(
                name: "IX_AddOns_Type",
                schema: "master",
                table: "AddOns",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_IyzicoSubscriptions_CustomerEmail",
                schema: "master",
                table: "IyzicoSubscriptions",
                column: "CustomerEmail");

            migrationBuilder.CreateIndex(
                name: "IX_IyzicoSubscriptions_CustomerReferenceCode",
                schema: "master",
                table: "IyzicoSubscriptions",
                column: "IyzicoCustomerReferenceCode");

            migrationBuilder.CreateIndex(
                name: "IX_IyzicoSubscriptions_Status",
                schema: "master",
                table: "IyzicoSubscriptions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_IyzicoSubscriptions_SubscriptionReferenceCode",
                schema: "master",
                table: "IyzicoSubscriptions",
                column: "IyzicoSubscriptionReferenceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IyzicoSubscriptions_TenantId",
                schema: "master",
                table: "IyzicoSubscriptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_IyzicoSubscriptions_TenantId_Status",
                schema: "master",
                table: "IyzicoSubscriptions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ModuleBundleItems_BundleId_ModuleCode",
                schema: "master",
                table: "ModuleBundleItems",
                columns: new[] { "ModuleBundleId", "ModuleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModuleBundles_BundleCode",
                schema: "master",
                table: "ModuleBundles",
                column: "BundleCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModuleBundles_IsActive",
                schema: "master",
                table: "ModuleBundles",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ModulePricing_IsActive",
                schema: "master",
                table: "ModulePricing",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ModulePricing_ModuleCode",
                schema: "master",
                table: "ModulePricing",
                column: "ModuleCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionAddOns_AddOnId",
                schema: "master",
                table: "SubscriptionAddOns",
                column: "AddOnId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionAddOns_IsActive",
                schema: "master",
                table: "SubscriptionAddOns",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionAddOns_SubscriptionId",
                schema: "master",
                table: "SubscriptionAddOns",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionAddOns_SubscriptionId_AddOnId",
                schema: "master",
                table: "SubscriptionAddOns",
                columns: new[] { "SubscriptionId", "AddOnId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IyzicoSubscriptions",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ModuleBundleItems",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ModulePricing",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionAddOns",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ModuleBundles",
                schema: "master");

            migrationBuilder.DropIndex(
                name: "IX_AddOns_RequiredModuleCode",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropIndex(
                name: "IX_AddOns_Type",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropColumn(
                name: "IncludedUsers",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "IyzicoPlanId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "IyzicoProductId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "Package_MaxUsers",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "PricePerUserAmount",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "PricePerUserCurrency",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "Quantity",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropColumn(
                name: "QuantityUnit",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropColumn(
                name: "RequiredModuleCode",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropColumn(
                name: "Type",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropColumn(
                name: "YearlyPriceAmount",
                schema: "master",
                table: "AddOns");

            migrationBuilder.DropColumn(
                name: "YearlyPriceCurrency",
                schema: "master",
                table: "AddOns");

            migrationBuilder.AlterColumn<string>(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);
        }
    }
}
