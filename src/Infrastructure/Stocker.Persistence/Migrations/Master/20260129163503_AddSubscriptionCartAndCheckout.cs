using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddSubscriptionCartAndCheckout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CancellationReason",
                schema: "master",
                table: "SubscriptionAddOns",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AddOnName",
                schema: "master",
                table: "SubscriptionAddOns",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "AddOnCode",
                schema: "master",
                table: "SubscriptionAddOns",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.CreateTable(
                name: "SubscriptionCarts",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Active"),
                    BillingCycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CouponCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionCarts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionOrders",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CartId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Pending"),
                    BillingCycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SubTotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SubTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    DiscountTotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    CouponCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CouponDiscountPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    PaymentMethod = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    PaymentProviderOrderId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PaymentProviderToken = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PaymentInitiatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentFailureReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingZipCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    TaxId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionCartItems",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CartId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ItemName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UnitPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    TrialDays = table.Column<int>(type: "integer", nullable: true),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IncludedModuleCodesJson = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RequiredModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    StorageGB = table.Column<int>(type: "integer", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionCartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionCartItems_SubscriptionCarts_CartId",
                        column: x => x.CartId,
                        principalSchema: "master",
                        principalTable: "SubscriptionCarts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionOrderItems",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ItemName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UnitPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    LineTotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LineTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    IsActivated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivationError = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TrialDays = table.Column<int>(type: "integer", nullable: true),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IncludedModuleCodesJson = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RequiredModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    StorageGB = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionOrderItems_SubscriptionOrders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "master",
                        principalTable: "SubscriptionOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionAddOns_AddOnCode",
                schema: "master",
                table: "SubscriptionAddOns",
                column: "AddOnCode");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCartItems_CartId",
                schema: "master",
                table: "SubscriptionCartItems",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCartItems_CartId_ItemCode",
                schema: "master",
                table: "SubscriptionCartItems",
                columns: new[] { "CartId", "ItemCode" });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCartItems_CartId_ItemType",
                schema: "master",
                table: "SubscriptionCartItems",
                columns: new[] { "CartId", "ItemType" });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCarts_ExpiresAt",
                schema: "master",
                table: "SubscriptionCarts",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCarts_Status",
                schema: "master",
                table: "SubscriptionCarts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCarts_TenantId",
                schema: "master",
                table: "SubscriptionCarts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCarts_TenantId_Status",
                schema: "master",
                table: "SubscriptionCarts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionCarts_UserId",
                schema: "master",
                table: "SubscriptionCarts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrderItems_IsActivated",
                schema: "master",
                table: "SubscriptionOrderItems",
                column: "IsActivated");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrderItems_OrderId",
                schema: "master",
                table: "SubscriptionOrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrderItems_OrderId_ItemType",
                schema: "master",
                table: "SubscriptionOrderItems",
                columns: new[] { "OrderId", "ItemType" });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_CartId",
                schema: "master",
                table: "SubscriptionOrders",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_CreatedAt",
                schema: "master",
                table: "SubscriptionOrders",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_OrderNumber",
                schema: "master",
                table: "SubscriptionOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_PaymentProviderOrderId",
                schema: "master",
                table: "SubscriptionOrders",
                column: "PaymentProviderOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_Status",
                schema: "master",
                table: "SubscriptionOrders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_SubscriptionId",
                schema: "master",
                table: "SubscriptionOrders",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_TenantId",
                schema: "master",
                table: "SubscriptionOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_TenantId_Status",
                schema: "master",
                table: "SubscriptionOrders",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_UserId",
                schema: "master",
                table: "SubscriptionOrders",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubscriptionCartItems",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionOrderItems",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionCarts",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionOrders",
                schema: "master");

            migrationBuilder.DropIndex(
                name: "IX_SubscriptionAddOns_AddOnCode",
                schema: "master",
                table: "SubscriptionAddOns");

            migrationBuilder.AlterColumn<string>(
                name: "CancellationReason",
                schema: "master",
                table: "SubscriptionAddOns",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AddOnName",
                schema: "master",
                table: "SubscriptionAddOns",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "AddOnCode",
                schema: "master",
                table: "SubscriptionAddOns",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
