using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "inventory");

            migrationBuilder.CreateTable(
                name: "Brands",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ParentCategoryId = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Categories_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalSchema: "inventory",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PriceLists",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    GlobalDiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    GlobalMarkupPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerGroupId = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributes",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AttributeType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    IsFilterable = table.Column<bool>(type: "boolean", nullable: false),
                    IsSearchable = table.Column<bool>(type: "boolean", nullable: false),
                    ShowInList = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    DefaultValue = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ValidationPattern = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductBundles",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BundleType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PricingType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FixedPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    FixedPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    RequireAllItems = table.Column<bool>(type: "boolean", nullable: false),
                    MinSelectableItems = table.Column<int>(type: "integer", nullable: true),
                    MaxSelectableItems = table.Column<int>(type: "integer", nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBundles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Fax = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Building = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Floor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Apartment = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ContactPerson = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreditLimit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentTerm = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsBaseUnit = table.Column<bool>(type: "boolean", nullable: false),
                    BaseUnitId = table.Column<int>(type: "integer", nullable: true),
                    ConversionFactor = table.Column<decimal>(type: "numeric(18,8)", precision: 18, scale: 8, nullable: false),
                    AllowDecimals = table.Column<bool>(type: "boolean", nullable: false),
                    DecimalPlaces = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    UnitId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Units_Units_BaseUnitId",
                        column: x => x.BaseUnitId,
                        principalSchema: "inventory",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Units_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "inventory",
                        principalTable: "Units",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BranchId = table.Column<int>(type: "integer", nullable: true),
                    Street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Building = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Floor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Apartment = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Manager = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TotalArea = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeOptions",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductAttributeId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ColorCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeOptions_ProductAttributes_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalSchema: "inventory",
                        principalTable: "ProductAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Barcode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    BrandId = table.Column<int>(type: "integer", nullable: true),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CostPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CostPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    MinimumStock = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MaximumStock = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ReorderPoint = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsStockTracked = table.Column<bool>(type: "boolean", nullable: false),
                    IsSerialTracked = table.Column<bool>(type: "boolean", nullable: false),
                    IsLotTracked = table.Column<bool>(type: "boolean", nullable: false),
                    UnitId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Brands_BrandId",
                        column: x => x.BrandId,
                        principalSchema: "inventory",
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "inventory",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Products_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "inventory",
                        principalTable: "Units",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Aisle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Shelf = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Bin = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Capacity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UsedCapacity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Locations_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StockTransfers",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TransferNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SourceWarehouseId = table.Column<int>(type: "integer", nullable: false),
                    DestinationWarehouseId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TransferType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ExpectedArrivalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ShippedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ShippedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ReceivedByUserId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockTransfers_Warehouses_DestinationWarehouseId",
                        column: x => x.DestinationWarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTransfers_Warehouses_SourceWarehouseId",
                        column: x => x.SourceWarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LotBatches",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LotNumber = table.Column<string>(type: "text", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ManufacturedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InitialQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    CurrentQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    ReservedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    SupplierLotNumber = table.Column<string>(type: "text", nullable: true),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    CertificateNumber = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsQuarantined = table.Column<bool>(type: "boolean", nullable: false),
                    QuarantinedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    QuarantineReason = table.Column<string>(type: "text", nullable: true),
                    InspectedByUserId = table.Column<int>(type: "integer", nullable: true),
                    InspectedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InspectionNotes = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotBatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LotBatches_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LotBatches_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PriceListItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PriceListId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MinQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaxQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriceListItems_PriceLists_PriceListId",
                        column: x => x.PriceListId,
                        principalSchema: "inventory",
                        principalTable: "PriceLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PriceListItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeValues",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductAttributeId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OptionId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValues_ProductAttributeOptions_OptionId",
                        column: x => x.OptionId,
                        principalSchema: "inventory",
                        principalTable: "ProductAttributeOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValues_ProductAttributes_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalSchema: "inventory",
                        principalTable: "ProductAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValues_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductBundleItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductBundleId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    OverridePriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    OverridePriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    MinQuantity = table.Column<int>(type: "integer", nullable: true),
                    MaxQuantity = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBundleItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductBundleItems_ProductBundles_ProductBundleId",
                        column: x => x.ProductBundleId,
                        principalSchema: "inventory",
                        principalTable: "ProductBundles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductBundleItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductImages",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AltText = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ImageType = table.Column<int>(type: "integer", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    Width = table.Column<int>(type: "integer", nullable: true),
                    Height = table.Column<int>(type: "integer", nullable: true),
                    MimeType = table.Column<string>(type: "text", nullable: true),
                    OriginalFileName = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Sku = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    VariantName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    PriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    CostPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CostPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    CompareAtPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CompareAtPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Weight = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    WeightUnit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Dimensions = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TrackInventory = table.Column<bool>(type: "boolean", nullable: false),
                    AllowBackorder = table.Column<bool>(type: "boolean", nullable: false),
                    LowStockThreshold = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplierProducts",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SupplierId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    SupplierProductCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SupplierProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SupplierBarcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UnitCostAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    LastPurchasePriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    LastPurchasePriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LastPurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MinOrderQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OrderMultiple = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: false),
                    IsPreferred = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    ProductId1 = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierProducts_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplierProducts_Products_ProductId1",
                        column: x => x.ProductId1,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SupplierProducts_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SerialNumbers",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Serial = table.Column<string>(type: "text", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: true),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ManufacturedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SoldDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarrantyStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarrantyEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    BatchNumber = table.Column<string>(type: "text", nullable: true),
                    SupplierSerial = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SerialNumbers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SerialNumbers_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SerialNumbers_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SerialNumbers_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StockCounts",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CountNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CountDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    CountType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    CountedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    AutoAdjust = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockCounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockCounts_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockCounts_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockMovements",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    FromLocationId = table.Column<int>(type: "integer", nullable: true),
                    ToLocationId = table.Column<int>(type: "integer", nullable: true),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceDocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceDocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceDocumentId = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    IsReversed = table.Column<bool>(type: "boolean", nullable: false),
                    ReversedMovementId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockMovements_Locations_FromLocationId",
                        column: x => x.FromLocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_Locations_ToLocationId",
                        column: x => x.ToLocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockMovements_StockMovements_ReversedMovementId",
                        column: x => x.ReversedMovementId,
                        principalSchema: "inventory",
                        principalTable: "StockMovements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockReservations",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReservationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    FulfilledQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReservationType = table.Column<int>(type: "integer", nullable: false),
                    ReferenceDocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceDocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReservationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FulfilledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockReservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockReservations_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockReservations_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockReservations_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockTransferItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StockTransferId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    SourceLocationId = table.Column<int>(type: "integer", nullable: true),
                    DestinationLocationId = table.Column<int>(type: "integer", nullable: true),
                    RequestedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ShippedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ReceivedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DamagedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTransferItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockTransferItems_Locations_DestinationLocationId",
                        column: x => x.DestinationLocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockTransferItems_Locations_SourceLocationId",
                        column: x => x.SourceLocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockTransferItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTransferItems_StockTransfers_StockTransferId",
                        column: x => x.StockTransferId,
                        principalSchema: "inventory",
                        principalTable: "StockTransfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariantOptions",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductVariantId = table.Column<int>(type: "integer", nullable: false),
                    ProductAttributeId = table.Column<int>(type: "integer", nullable: false),
                    ProductAttributeOptionId = table.Column<int>(type: "integer", nullable: true),
                    Value = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariantOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariantOptions_ProductAttributeOptions_ProductAttrib~",
                        column: x => x.ProductAttributeOptionId,
                        principalSchema: "inventory",
                        principalTable: "ProductAttributeOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductVariantOptions_ProductAttributes_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalSchema: "inventory",
                        principalTable: "ProductAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductVariantOptions_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalSchema: "inventory",
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Stocks",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ReservedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastMovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastCountDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LocationId1 = table.Column<int>(type: "integer", nullable: true),
                    LotBatchId = table.Column<int>(type: "integer", nullable: true),
                    ProductVariantId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stocks_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Stocks_Locations_LocationId1",
                        column: x => x.LocationId1,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Stocks_LotBatches_LotBatchId",
                        column: x => x.LotBatchId,
                        principalSchema: "inventory",
                        principalTable: "LotBatches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Stocks_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalSchema: "inventory",
                        principalTable: "ProductVariants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Stocks_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Stocks_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SupplierProductPriceTiers",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SupplierProductId = table.Column<int>(type: "integer", nullable: false),
                    MinQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MaxQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    UnitPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierProductPriceTiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierProductPriceTiers_SupplierProducts_SupplierProductId",
                        column: x => x.SupplierProductId,
                        principalSchema: "inventory",
                        principalTable: "SupplierProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StockCountItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StockCountId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    SystemQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CountedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CountedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsAdjusted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockCountItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockCountItems_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockCountItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockCountItems_StockCounts_StockCountId",
                        column: x => x.StockCountId,
                        principalSchema: "inventory",
                        principalTable: "StockCounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Brands_TenantId",
                schema: "inventory",
                table: "Brands",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Brands_TenantId_Code",
                schema: "inventory",
                table: "Brands",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brands_TenantId_IsActive",
                schema: "inventory",
                table: "Brands",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Brands_TenantId_Name",
                schema: "inventory",
                table: "Brands",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ParentCategoryId",
                schema: "inventory",
                table: "Categories",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId",
                schema: "inventory",
                table: "Categories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_Code",
                schema: "inventory",
                table: "Categories",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_DisplayOrder",
                schema: "inventory",
                table: "Categories",
                columns: new[] { "TenantId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_IsActive",
                schema: "inventory",
                table: "Categories",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_ParentCategoryId",
                schema: "inventory",
                table: "Categories",
                columns: new[] { "TenantId", "ParentCategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId",
                schema: "inventory",
                table: "Locations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId_IsActive",
                schema: "inventory",
                table: "Locations",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId_WarehouseId",
                schema: "inventory",
                table: "Locations",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId_WarehouseId_Code",
                schema: "inventory",
                table: "Locations",
                columns: new[] { "TenantId", "WarehouseId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_WarehouseId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_ProductId",
                schema: "inventory",
                table: "LotBatches",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_LotBatches_SupplierId",
                schema: "inventory",
                table: "LotBatches",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_PriceListId",
                schema: "inventory",
                table: "PriceListItems",
                column: "PriceListId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_ProductId",
                schema: "inventory",
                table: "PriceListItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_TenantId",
                schema: "inventory",
                table: "PriceListItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_TenantId_PriceListId_ProductId",
                schema: "inventory",
                table: "PriceListItems",
                columns: new[] { "TenantId", "PriceListId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_TenantId_ProductId",
                schema: "inventory",
                table: "PriceListItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId",
                schema: "inventory",
                table: "PriceLists",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_Code",
                schema: "inventory",
                table: "PriceLists",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_CustomerGroupId",
                schema: "inventory",
                table: "PriceLists",
                columns: new[] { "TenantId", "CustomerGroupId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_IsActive",
                schema: "inventory",
                table: "PriceLists",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_IsDefault",
                schema: "inventory",
                table: "PriceLists",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_ValidFrom_ValidTo",
                schema: "inventory",
                table: "PriceLists",
                columns: new[] { "TenantId", "ValidFrom", "ValidTo" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeOptions_ProductAttributeId_DisplayOrder",
                schema: "inventory",
                table: "ProductAttributeOptions",
                columns: new[] { "ProductAttributeId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeOptions_TenantId",
                schema: "inventory",
                table: "ProductAttributeOptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_TenantId",
                schema: "inventory",
                table: "ProductAttributes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_TenantId_Code",
                schema: "inventory",
                table: "ProductAttributes",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_TenantId_IsActive",
                schema: "inventory",
                table: "ProductAttributes",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_OptionId",
                schema: "inventory",
                table: "ProductAttributeValues",
                column: "OptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_ProductAttributeId",
                schema: "inventory",
                table: "ProductAttributeValues",
                column: "ProductAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_ProductId_ProductAttributeId",
                schema: "inventory",
                table: "ProductAttributeValues",
                columns: new[] { "ProductId", "ProductAttributeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_TenantId",
                schema: "inventory",
                table: "ProductAttributeValues",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundleItems_ProductBundleId_ProductId",
                schema: "inventory",
                table: "ProductBundleItems",
                columns: new[] { "ProductBundleId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundleItems_ProductId",
                schema: "inventory",
                table: "ProductBundleItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundleItems_TenantId",
                schema: "inventory",
                table: "ProductBundleItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundles_TenantId",
                schema: "inventory",
                table: "ProductBundles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundles_TenantId_Code",
                schema: "inventory",
                table: "ProductBundles",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundles_TenantId_IsActive",
                schema: "inventory",
                table: "ProductBundles",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId_DisplayOrder",
                schema: "inventory",
                table: "ProductImages",
                columns: new[] { "ProductId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_TenantId",
                schema: "inventory",
                table: "ProductImages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BrandId",
                schema: "inventory",
                table: "Products",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                schema: "inventory",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SupplierId",
                schema: "inventory",
                table: "Products",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId",
                schema: "inventory",
                table: "Products",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Barcode",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "Barcode" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_BrandId",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "BrandId" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_CategoryId",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Code",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_IsActive",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Name",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_UnitId",
                schema: "inventory",
                table: "Products",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantOptions_ProductAttributeId",
                schema: "inventory",
                table: "ProductVariantOptions",
                column: "ProductAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantOptions_ProductAttributeOptionId",
                schema: "inventory",
                table: "ProductVariantOptions",
                column: "ProductAttributeOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantOptions_ProductVariantId_ProductAttributeId",
                schema: "inventory",
                table: "ProductVariantOptions",
                columns: new[] { "ProductVariantId", "ProductAttributeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantOptions_TenantId",
                schema: "inventory",
                table: "ProductVariantOptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId_IsActive",
                schema: "inventory",
                table: "ProductVariants",
                columns: new[] { "ProductId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_TenantId",
                schema: "inventory",
                table: "ProductVariants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_TenantId_Sku",
                schema: "inventory",
                table: "ProductVariants",
                columns: new[] { "TenantId", "Sku" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_LocationId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_ProductId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SerialNumbers_WarehouseId",
                schema: "inventory",
                table: "SerialNumbers",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCountItems_LocationId",
                schema: "inventory",
                table: "StockCountItems",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCountItems_ProductId",
                schema: "inventory",
                table: "StockCountItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCountItems_StockCountId",
                schema: "inventory",
                table: "StockCountItems",
                column: "StockCountId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCountItems_TenantId",
                schema: "inventory",
                table: "StockCountItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCountItems_TenantId_ProductId",
                schema: "inventory",
                table: "StockCountItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCountItems_TenantId_StockCountId",
                schema: "inventory",
                table: "StockCountItems",
                columns: new[] { "TenantId", "StockCountId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_LocationId",
                schema: "inventory",
                table: "StockCounts",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_TenantId",
                schema: "inventory",
                table: "StockCounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_TenantId_CountDate",
                schema: "inventory",
                table: "StockCounts",
                columns: new[] { "TenantId", "CountDate" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_TenantId_CountNumber",
                schema: "inventory",
                table: "StockCounts",
                columns: new[] { "TenantId", "CountNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_TenantId_Status",
                schema: "inventory",
                table: "StockCounts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_TenantId_WarehouseId",
                schema: "inventory",
                table: "StockCounts",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCounts_WarehouseId",
                schema: "inventory",
                table: "StockCounts",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_FromLocationId",
                schema: "inventory",
                table: "StockMovements",
                column: "FromLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ProductId",
                schema: "inventory",
                table: "StockMovements",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ReversedMovementId",
                schema: "inventory",
                table: "StockMovements",
                column: "ReversedMovementId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId",
                schema: "inventory",
                table: "StockMovements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_DocumentNumber",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "DocumentNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_MovementDate",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "MovementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_MovementType",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "MovementType" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_ProductId",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_ReferenceDocumentType_ReferenceDocu~",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "ReferenceDocumentType", "ReferenceDocumentNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_WarehouseId",
                schema: "inventory",
                table: "StockMovements",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ToLocationId",
                schema: "inventory",
                table: "StockMovements",
                column: "ToLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_WarehouseId",
                schema: "inventory",
                table: "StockMovements",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_LocationId",
                schema: "inventory",
                table: "StockReservations",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_ProductId",
                schema: "inventory",
                table: "StockReservations",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_TenantId",
                schema: "inventory",
                table: "StockReservations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_TenantId_ExpirationDate",
                schema: "inventory",
                table: "StockReservations",
                columns: new[] { "TenantId", "ExpirationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_TenantId_ProductId_WarehouseId",
                schema: "inventory",
                table: "StockReservations",
                columns: new[] { "TenantId", "ProductId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_TenantId_ReservationNumber",
                schema: "inventory",
                table: "StockReservations",
                columns: new[] { "TenantId", "ReservationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_TenantId_ReservationType_ReferenceDocumen~",
                schema: "inventory",
                table: "StockReservations",
                columns: new[] { "TenantId", "ReservationType", "ReferenceDocumentId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_TenantId_Status",
                schema: "inventory",
                table: "StockReservations",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_WarehouseId",
                schema: "inventory",
                table: "StockReservations",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_LocationId",
                schema: "inventory",
                table: "Stocks",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_LocationId1",
                schema: "inventory",
                table: "Stocks",
                column: "LocationId1");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_LotBatchId",
                schema: "inventory",
                table: "Stocks",
                column: "LotBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_ProductId",
                schema: "inventory",
                table: "Stocks",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_ProductVariantId",
                schema: "inventory",
                table: "Stocks",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId",
                schema: "inventory",
                table: "Stocks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_ExpiryDate",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "ExpiryDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_LocationId",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "LocationId" });

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_LotNumber",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "LotNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_ProductId",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_ProductId_WarehouseId_LocationId",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "ProductId", "WarehouseId", "LocationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_SerialNumber",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "SerialNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_TenantId_WarehouseId",
                schema: "inventory",
                table: "Stocks",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_WarehouseId",
                schema: "inventory",
                table: "Stocks",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_DestinationLocationId",
                schema: "inventory",
                table: "StockTransferItems",
                column: "DestinationLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_ProductId",
                schema: "inventory",
                table: "StockTransferItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_SourceLocationId",
                schema: "inventory",
                table: "StockTransferItems",
                column: "SourceLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_StockTransferId",
                schema: "inventory",
                table: "StockTransferItems",
                column: "StockTransferId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_TenantId",
                schema: "inventory",
                table: "StockTransferItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_TenantId_ProductId",
                schema: "inventory",
                table: "StockTransferItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferItems_TenantId_StockTransferId",
                schema: "inventory",
                table: "StockTransferItems",
                columns: new[] { "TenantId", "StockTransferId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_DestinationWarehouseId",
                schema: "inventory",
                table: "StockTransfers",
                column: "DestinationWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_SourceWarehouseId",
                schema: "inventory",
                table: "StockTransfers",
                column: "SourceWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TenantId",
                schema: "inventory",
                table: "StockTransfers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TenantId_DestinationWarehouseId",
                schema: "inventory",
                table: "StockTransfers",
                columns: new[] { "TenantId", "DestinationWarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TenantId_SourceWarehouseId",
                schema: "inventory",
                table: "StockTransfers",
                columns: new[] { "TenantId", "SourceWarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TenantId_Status",
                schema: "inventory",
                table: "StockTransfers",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TenantId_TransferDate",
                schema: "inventory",
                table: "StockTransfers",
                columns: new[] { "TenantId", "TransferDate" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TenantId_TransferNumber",
                schema: "inventory",
                table: "StockTransfers",
                columns: new[] { "TenantId", "TransferNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProductPriceTiers_SupplierProductId_MinQuantity",
                schema: "inventory",
                table: "SupplierProductPriceTiers",
                columns: new[] { "SupplierProductId", "MinQuantity" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProductPriceTiers_TenantId",
                schema: "inventory",
                table: "SupplierProductPriceTiers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProducts_ProductId_IsPreferred",
                schema: "inventory",
                table: "SupplierProducts",
                columns: new[] { "ProductId", "IsPreferred" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProducts_ProductId1",
                schema: "inventory",
                table: "SupplierProducts",
                column: "ProductId1");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProducts_SupplierId_ProductId",
                schema: "inventory",
                table: "SupplierProducts",
                columns: new[] { "SupplierId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierProducts_TenantId",
                schema: "inventory",
                table: "SupplierProducts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId",
                schema: "inventory",
                table: "Suppliers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_Code",
                schema: "inventory",
                table: "Suppliers",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_IsActive",
                schema: "inventory",
                table: "Suppliers",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_Name",
                schema: "inventory",
                table: "Suppliers",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Units_BaseUnitId",
                schema: "inventory",
                table: "Units",
                column: "BaseUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Units_TenantId",
                schema: "inventory",
                table: "Units",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Units_TenantId_Code",
                schema: "inventory",
                table: "Units",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Units_TenantId_IsActive",
                schema: "inventory",
                table: "Units",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Units_UnitId",
                schema: "inventory",
                table: "Units",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_TenantId",
                schema: "inventory",
                table: "Warehouses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_TenantId_BranchId",
                schema: "inventory",
                table: "Warehouses",
                columns: new[] { "TenantId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_TenantId_Code",
                schema: "inventory",
                table: "Warehouses",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_TenantId_IsActive",
                schema: "inventory",
                table: "Warehouses",
                columns: new[] { "TenantId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PriceListItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductAttributeValues",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductBundleItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductImages",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductVariantOptions",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "SerialNumbers",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "StockCountItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "StockMovements",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "StockReservations",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Stocks",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "StockTransferItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "SupplierProductPriceTiers",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "PriceLists",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductBundles",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductAttributeOptions",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "StockCounts",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "LotBatches",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductVariants",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "StockTransfers",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "SupplierProducts",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ProductAttributes",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Locations",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Products",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Warehouses",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Brands",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Suppliers",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "Units",
                schema: "inventory");
        }
    }
}
