using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNewSalesEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeliveryNotes",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryNoteNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Series = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                    DeliveryNoteDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssueTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    DeliveryNoteType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsEDeliveryNote = table.Column<bool>(type: "boolean", nullable: false),
                    EDeliveryNoteUuid = table.Column<Guid>(type: "uuid", nullable: true),
                    EDeliveryNoteStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SenderTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    SenderName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    SenderTaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SenderAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SenderCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SenderDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SenderCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceiverTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    ReceiverName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    ReceiverTaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ReceiverAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ReceiverCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ReceiverDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ReceiverCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReceiverPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DispatchDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DispatchTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    DeliveryAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DeliveryCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeliveryDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TransportMode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CarrierTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    CarrierName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    VehiclePlate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    TrailerPlate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DriverName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DriverNationalId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    TotalLineCount = table.Column<int>(type: "integer", nullable: false),
                    TotalQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalGrossWeight = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalNetWeight = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalVolume = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    PackageCount = table.Column<int>(type: "integer", nullable: true),
                    PackageType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IsPrinted = table.Column<bool>(type: "boolean", nullable: false),
                    PrintDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsSigned = table.Column<bool>(type: "boolean", nullable: false),
                    SignDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDelivered = table.Column<bool>(type: "boolean", nullable: false),
                    DeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ReceiverSignature = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PriceLists",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsTaxIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    MinimumOrderAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MinimumOrderCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    BasePriceListId = table.Column<Guid>(type: "uuid", nullable: true),
                    BaseAdjustmentPercentage = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SalesTerritoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerSegment = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesTargets",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TargetType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PeriodType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    SalesRepresentativeId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesRepresentativeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SalesTeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesTeamName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SalesTerritoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesTerritoryName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    TotalTargetAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalTargetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalActualAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalActualCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MetricType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TargetQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MinimumAchievementPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ParentTargetId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTargets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryNoteItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    ProductDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UnitCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    GrossWeight = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    NetWeight = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Volume = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    LotNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HsCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CountryOfOrigin = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryNoteItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryNoteItems_DeliveryNotes_DeliveryNoteId",
                        column: x => x.DeliveryNoteId,
                        principalSchema: "sales",
                        principalTable: "DeliveryNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceListCustomers",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PriceListId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListCustomers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriceListCustomers_PriceLists_PriceListId",
                        column: x => x.PriceListId,
                        principalSchema: "sales",
                        principalTable: "PriceLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceListItems",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PriceListId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    UnitOfMeasure = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MinimumQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    LastPriceUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PreviousPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    PreviousPriceCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriceListItems_PriceLists_PriceListId",
                        column: x => x.PriceListId,
                        principalSchema: "sales",
                        principalTable: "PriceLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesTargetAchievements",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    AchievementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTargetAchievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesTargetAchievements_SalesTargets_SalesTargetId",
                        column: x => x.SalesTargetId,
                        principalSchema: "sales",
                        principalTable: "SalesTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesTargetPeriods",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    PeriodNumber = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TargetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ActualAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TargetQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTargetPeriods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesTargetPeriods_SalesTargets_SalesTargetId",
                        column: x => x.SalesTargetId,
                        principalSchema: "sales",
                        principalTable: "SalesTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesTargetProducts",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TargetAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TargetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ActualAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TargetQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Weight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTargetProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesTargetProducts_SalesTargets_SalesTargetId",
                        column: x => x.SalesTargetId,
                        principalSchema: "sales",
                        principalTable: "SalesTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNoteItems_DeliveryNoteId",
                schema: "sales",
                table: "DeliveryNoteItems",
                column: "DeliveryNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNoteItems_ProductId",
                schema: "sales",
                table: "DeliveryNoteItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_InvoiceId",
                schema: "sales",
                table: "DeliveryNotes",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_ReceiverId",
                schema: "sales",
                table: "DeliveryNotes",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_SalesOrderId",
                schema: "sales",
                table: "DeliveryNotes",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_ShipmentId",
                schema: "sales",
                table: "DeliveryNotes",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_TenantId_DeliveryNoteDate",
                schema: "sales",
                table: "DeliveryNotes",
                columns: new[] { "TenantId", "DeliveryNoteDate" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_TenantId_DeliveryNoteNumber",
                schema: "sales",
                table: "DeliveryNotes",
                columns: new[] { "TenantId", "DeliveryNoteNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryNotes_TenantId_Status",
                schema: "sales",
                table: "DeliveryNotes",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceListCustomers_CustomerId",
                schema: "sales",
                table: "PriceListCustomers",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListCustomers_IsActive",
                schema: "sales",
                table: "PriceListCustomers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListCustomers_PriceListId_CustomerId",
                schema: "sales",
                table: "PriceListCustomers",
                columns: new[] { "PriceListId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_IsActive",
                schema: "sales",
                table: "PriceListItems",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_PriceListId_ProductId",
                schema: "sales",
                table: "PriceListItems",
                columns: new[] { "PriceListId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_ProductId",
                schema: "sales",
                table: "PriceListItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_IsActive",
                schema: "sales",
                table: "PriceLists",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_Priority",
                schema: "sales",
                table: "PriceLists",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId",
                schema: "sales",
                table: "PriceLists",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_Code",
                schema: "sales",
                table: "PriceLists",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_Type",
                schema: "sales",
                table: "PriceLists",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_ValidFrom",
                schema: "sales",
                table: "PriceLists",
                column: "ValidFrom");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_ValidTo",
                schema: "sales",
                table: "PriceLists",
                column: "ValidTo");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargetAchievements_AchievementDate",
                schema: "sales",
                table: "SalesTargetAchievements",
                column: "AchievementDate");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargetAchievements_SalesOrderId",
                schema: "sales",
                table: "SalesTargetAchievements",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargetAchievements_SalesTargetId",
                schema: "sales",
                table: "SalesTargetAchievements",
                column: "SalesTargetId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargetPeriods_SalesTargetId_PeriodNumber",
                schema: "sales",
                table: "SalesTargetPeriods",
                columns: new[] { "SalesTargetId", "PeriodNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargetProducts_SalesTargetId_ProductId",
                schema: "sales",
                table: "SalesTargetProducts",
                columns: new[] { "SalesTargetId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_SalesRepresentativeId",
                schema: "sales",
                table: "SalesTargets",
                column: "SalesRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_SalesTeamId",
                schema: "sales",
                table: "SalesTargets",
                column: "SalesTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_Status",
                schema: "sales",
                table: "SalesTargets",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_TargetCode",
                schema: "sales",
                table: "SalesTargets",
                column: "TargetCode");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_TenantId",
                schema: "sales",
                table: "SalesTargets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_TenantId_TargetCode",
                schema: "sales",
                table: "SalesTargets",
                columns: new[] { "TenantId", "TargetCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_TenantId_Year_Status",
                schema: "sales",
                table: "SalesTargets",
                columns: new[] { "TenantId", "Year", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTargets_Year",
                schema: "sales",
                table: "SalesTargets",
                column: "Year");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveryNoteItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "PriceListCustomers",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "PriceListItems",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesTargetAchievements",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesTargetPeriods",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesTargetProducts",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "DeliveryNotes",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "PriceLists",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "SalesTargets",
                schema: "sales");
        }
    }
}
