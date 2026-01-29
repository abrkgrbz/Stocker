using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesCustomerAndSalesProductEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SalesCustomers",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerType = table.Column<int>(type: "integer", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    IdentityNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    MobilePhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    AddressLine = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "Türkiye"),
                    CountryCode = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false, defaultValue: "TR"),
                    IsEInvoiceRegistered = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EInvoiceAlias = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EInvoiceLastCheckedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    CreditLimit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    CurrentBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    DefaultPaymentTermDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    DefaultVatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 20m),
                    VatExemptionCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    VatExemptionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ShippingAddressLine = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ShippingDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ShippingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingSameAsBilling = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CrmCustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DataSource = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesCustomers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesProducts",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ProductType = table.Column<int>(type: "integer", nullable: false),
                    Barcode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SKU = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    GtipCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Unit = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "C62"),
                    UnitDescription = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Adet"),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    CostPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MinimumSalePrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ListPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 20m),
                    IsPriceIncludingVat = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    VatExemptionCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    VatExemptionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SpecialConsumptionTaxRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    SpecialConsumptionTaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TrackStock = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    StockQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    MinimumStock = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    Weight = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SubCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsAvailableForSale = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ShowOnWeb = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InventoryProductId = table.Column<int>(type: "integer", nullable: true),
                    DataSource = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesProducts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalesCustomers_TenantId",
                schema: "sales",
                table: "SalesCustomers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesCustomers_TenantId_CrmCustomerId",
                schema: "sales",
                table: "SalesCustomers",
                columns: new[] { "TenantId", "CrmCustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesCustomers_TenantId_CustomerCode",
                schema: "sales",
                table: "SalesCustomers",
                columns: new[] { "TenantId", "CustomerCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesCustomers_TenantId_IdentityNumber",
                schema: "sales",
                table: "SalesCustomers",
                columns: new[] { "TenantId", "IdentityNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesCustomers_TenantId_IsActive",
                schema: "sales",
                table: "SalesCustomers",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesCustomers_TenantId_TaxNumber",
                schema: "sales",
                table: "SalesCustomers",
                columns: new[] { "TenantId", "TaxNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId",
                schema: "sales",
                table: "SalesProducts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId_Barcode",
                schema: "sales",
                table: "SalesProducts",
                columns: new[] { "TenantId", "Barcode" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId_Category",
                schema: "sales",
                table: "SalesProducts",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId_InventoryProductId",
                schema: "sales",
                table: "SalesProducts",
                columns: new[] { "TenantId", "InventoryProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId_IsActive_IsAvailableForSale",
                schema: "sales",
                table: "SalesProducts",
                columns: new[] { "TenantId", "IsActive", "IsAvailableForSale" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId_ProductCode",
                schema: "sales",
                table: "SalesProducts",
                columns: new[] { "TenantId", "ProductCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesProducts_TenantId_SKU",
                schema: "sales",
                table: "SalesProducts",
                columns: new[] { "TenantId", "SKU" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SalesCustomers",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesProducts",
                schema: "sales");
        }
    }
}
