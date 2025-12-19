using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWarehouseZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WarehouseZoneId",
                schema: "inventory",
                table: "Locations",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "audit_logs",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    Changes = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdditionalData = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConsignmentStocks",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsignmentNumber = table.Column<string>(type: "text", nullable: false),
                    SupplierId = table.Column<int>(type: "integer", nullable: false),
                    AgreementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AgreementEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    LotNumber = table.Column<string>(type: "text", nullable: true),
                    InitialQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    CurrentQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    SoldQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    ReturnedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    DamagedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric", nullable: false),
                    SellingPrice = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    CommissionRate = table.Column<decimal>(type: "numeric", nullable: true),
                    LastReconciliationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReconciliationPeriodDays = table.Column<int>(type: "integer", nullable: false),
                    NextReconciliationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalSalesAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    MaxConsignmentDays = table.Column<int>(type: "integer", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AgreementNotes = table.Column<string>(type: "text", nullable: true),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ConsignmentStocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsignmentStocks_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ConsignmentStocks_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsignmentStocks_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsignmentStocks_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryAdjustments",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AdjustmentNumber = table.Column<string>(type: "text", nullable: false),
                    AdjustmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdjustmentType = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    StockCountId = table.Column<int>(type: "integer", nullable: true),
                    ReferenceNumber = table.Column<string>(type: "text", nullable: true),
                    ReferenceType = table.Column<string>(type: "text", nullable: true),
                    TotalCostImpact = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
                    AccountingNotes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_InventoryAdjustments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryAdjustments_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InventoryAdjustments_StockCounts_StockCountId",
                        column: x => x.StockCountId,
                        principalSchema: "inventory",
                        principalTable: "StockCounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InventoryAdjustments_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackagingTypes",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Length = table.Column<decimal>(type: "numeric", nullable: true),
                    Width = table.Column<decimal>(type: "numeric", nullable: true),
                    Height = table.Column<decimal>(type: "numeric", nullable: true),
                    Volume = table.Column<decimal>(type: "numeric", nullable: true),
                    EmptyWeight = table.Column<decimal>(type: "numeric", nullable: true),
                    MaxWeightCapacity = table.Column<decimal>(type: "numeric", nullable: true),
                    DefaultQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    MaxQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    StackableCount = table.Column<int>(type: "integer", nullable: true),
                    IsStackable = table.Column<bool>(type: "boolean", nullable: false),
                    UnitsPerPallet = table.Column<int>(type: "integer", nullable: true),
                    UnitsPerPalletLayer = table.Column<int>(type: "integer", nullable: true),
                    BarcodePrefix = table.Column<string>(type: "text", nullable: true),
                    DefaultBarcodeType = table.Column<int>(type: "integer", nullable: true),
                    MaterialType = table.Column<string>(type: "text", nullable: true),
                    IsRecyclable = table.Column<bool>(type: "boolean", nullable: false),
                    IsReturnable = table.Column<bool>(type: "boolean", nullable: false),
                    DepositAmount = table.Column<decimal>(type: "numeric", nullable: true),
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
                    table.PrimaryKey("PK_PackagingTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QualityControls",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QcNumber = table.Column<string>(type: "text", nullable: false),
                    QcType = table.Column<int>(type: "integer", nullable: false),
                    InspectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    LotNumber = table.Column<string>(type: "text", nullable: true),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    PurchaseOrderId = table.Column<int>(type: "integer", nullable: true),
                    PurchaseOrderNumber = table.Column<string>(type: "text", nullable: true),
                    WarehouseId = table.Column<int>(type: "integer", nullable: true),
                    InspectedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    AcceptedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    RejectedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    SampleQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    Result = table.Column<int>(type: "integer", nullable: false),
                    QualityScore = table.Column<decimal>(type: "numeric", nullable: true),
                    QualityGrade = table.Column<string>(type: "text", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    RejectionCategory = table.Column<int>(type: "integer", nullable: true),
                    InspectorName = table.Column<string>(type: "text", nullable: true),
                    InspectorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    InspectionDurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    InspectionLocation = table.Column<string>(type: "text", nullable: true),
                    InspectionStandard = table.Column<string>(type: "text", nullable: true),
                    RecommendedAction = table.Column<int>(type: "integer", nullable: false),
                    AppliedAction = table.Column<int>(type: "integer", nullable: true),
                    ActionDescription = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InspectionNotes = table.Column<string>(type: "text", nullable: true),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
                    SupplierNotification = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_QualityControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QualityControls_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QualityControls_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_QualityControls_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "reorder_rules",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProductId = table.Column<int>(type: "integer", nullable: true),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    WarehouseId = table.Column<int>(type: "integer", nullable: true),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    TriggerBelowQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TriggerBelowDaysOfStock = table.Column<int>(type: "integer", nullable: true),
                    TriggerOnForecast = table.Column<bool>(type: "boolean", nullable: false),
                    ForecastLeadTimeDays = table.Column<int>(type: "integer", nullable: true),
                    FixedReorderQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ReorderUpToQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    UseEconomicOrderQuantity = table.Column<bool>(type: "boolean", nullable: false),
                    MinimumOrderQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumOrderQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    RoundToPackSize = table.Column<bool>(type: "boolean", nullable: false),
                    PackSize = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    IsScheduled = table.Column<bool>(type: "boolean", nullable: false),
                    CronExpression = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    NextScheduledRun = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    ApproverUserId = table.Column<int>(type: "integer", nullable: true),
                    LastExecutedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExecutionCount = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_reorder_rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reorder_rules_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "inventory",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_reorder_rules_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_reorder_rules_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_reorder_rules_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ShelfLives",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ShelfLifeType = table.Column<int>(type: "integer", nullable: false),
                    TotalShelfLifeDays = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    MinReceivingShelfLifeDays = table.Column<int>(type: "integer", nullable: false),
                    MinReceivingShelfLifePercent = table.Column<decimal>(type: "numeric", nullable: true),
                    ReceivingRuleType = table.Column<int>(type: "integer", nullable: false),
                    MinSalesShelfLifeDays = table.Column<int>(type: "integer", nullable: false),
                    MinSalesShelfLifePercent = table.Column<decimal>(type: "numeric", nullable: true),
                    SalesRuleType = table.Column<int>(type: "integer", nullable: false),
                    AlertThresholdDays = table.Column<int>(type: "integer", nullable: false),
                    AlertThresholdPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    CriticalThresholdDays = table.Column<int>(type: "integer", nullable: false),
                    CriticalThresholdPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    HasCustomerSpecificRules = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultCustomerMinShelfLifeDays = table.Column<int>(type: "integer", nullable: true),
                    ExpiryAction = table.Column<int>(type: "integer", nullable: false),
                    AutoQuarantineOnExpiry = table.Column<bool>(type: "boolean", nullable: false),
                    AutoScrapOnExpiry = table.Column<bool>(type: "boolean", nullable: false),
                    DaysBeforeQuarantineAlert = table.Column<int>(type: "integer", nullable: true),
                    RequiresSpecialStorage = table.Column<bool>(type: "boolean", nullable: false),
                    StorageConditions = table.Column<string>(type: "text", nullable: true),
                    RequiredZoneType = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_ShelfLives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShelfLives_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WarehouseZones",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ZoneType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsTemperatureControlled = table.Column<bool>(type: "boolean", nullable: false),
                    MinTemperature = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    MaxTemperature = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TargetTemperature = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    RequiresTemperatureMonitoring = table.Column<bool>(type: "boolean", nullable: false),
                    IsHumidityControlled = table.Column<bool>(type: "boolean", nullable: false),
                    MinHumidity = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    MaxHumidity = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IsHazardous = table.Column<bool>(type: "boolean", nullable: false),
                    HazardClass = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UnNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    RequiresSpecialAccess = table.Column<bool>(type: "boolean", nullable: false),
                    AccessLevel = table.Column<int>(type: "integer", nullable: true),
                    TotalArea = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    UsableArea = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxPalletCapacity = table.Column<int>(type: "integer", nullable: true),
                    MaxHeight = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    MaxWeightPerArea = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    IsDefaultPickingZone = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefaultPutawayZone = table.Column<bool>(type: "boolean", nullable: false),
                    IsQuarantineZone = table.Column<bool>(type: "boolean", nullable: false),
                    IsReturnsZone = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_WarehouseZones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarehouseZones_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConsignmentStockMovements",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsignmentStockId = table.Column<int>(type: "integer", nullable: false),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ConsignmentStockMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsignmentStockMovements_ConsignmentStocks_ConsignmentStoc~",
                        column: x => x.ConsignmentStockId,
                        principalSchema: "inventory",
                        principalTable: "ConsignmentStocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryAdjustmentItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InventoryAdjustmentId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    SystemQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric", nullable: false),
                    LotNumber = table.Column<string>(type: "text", nullable: true),
                    SerialNumber = table.Column<string>(type: "text", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReasonCode = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_InventoryAdjustmentItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryAdjustmentItems_InventoryAdjustments_InventoryAdju~",
                        column: x => x.InventoryAdjustmentId,
                        principalSchema: "inventory",
                        principalTable: "InventoryAdjustments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventoryAdjustmentItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BarcodeDefinitions",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductVariantId = table.Column<int>(type: "integer", nullable: true),
                    Barcode = table.Column<string>(type: "text", nullable: false),
                    BarcodeType = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UnitId = table.Column<int>(type: "integer", nullable: true),
                    QuantityPerUnit = table.Column<decimal>(type: "numeric", nullable: false),
                    PackagingTypeId = table.Column<int>(type: "integer", nullable: true),
                    IsManufacturerBarcode = table.Column<bool>(type: "boolean", nullable: false),
                    ManufacturerCode = table.Column<string>(type: "text", nullable: true),
                    Gtin = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_BarcodeDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BarcodeDefinitions_PackagingTypes_PackagingTypeId",
                        column: x => x.PackagingTypeId,
                        principalSchema: "inventory",
                        principalTable: "PackagingTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BarcodeDefinitions_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalSchema: "inventory",
                        principalTable: "ProductVariants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BarcodeDefinitions_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BarcodeDefinitions_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "inventory",
                        principalTable: "Units",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QualityControlAttachment",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QualityControlId = table.Column<int>(type: "integer", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FileType = table.Column<string>(type: "text", nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
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
                    table.PrimaryKey("PK_QualityControlAttachment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QualityControlAttachment_QualityControls_QualityControlId",
                        column: x => x.QualityControlId,
                        principalSchema: "inventory",
                        principalTable: "QualityControls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QualityControlItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QualityControlId = table.Column<int>(type: "integer", nullable: false),
                    CheckName = table.Column<string>(type: "text", nullable: false),
                    Specification = table.Column<string>(type: "text", nullable: true),
                    AcceptanceCriteria = table.Column<string>(type: "text", nullable: true),
                    MeasuredValue = table.Column<string>(type: "text", nullable: true),
                    IsPassed = table.Column<bool>(type: "boolean", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_QualityControlItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QualityControlItems_QualityControls_QualityControlId",
                        column: x => x.QualityControlId,
                        principalSchema: "inventory",
                        principalTable: "QualityControls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reorder_suggestions",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GeneratedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: true),
                    CurrentStock = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AvailableStock = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MinStockLevel = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ReorderLevel = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SuggestedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    EstimatedCostAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    EstimatedCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SuggestedSupplierId = table.Column<int>(type: "integer", nullable: true),
                    TriggeredByRuleId = table.Column<int>(type: "integer", nullable: true),
                    TriggerReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    EstimatedDaysUntilStockout = table.Column<int>(type: "integer", nullable: true),
                    ExpectedStockoutDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StatusReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProcessedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PurchaseOrderId = table.Column<int>(type: "integer", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_reorder_suggestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reorder_suggestions_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reorder_suggestions_Suppliers_SuggestedSupplierId",
                        column: x => x.SuggestedSupplierId,
                        principalSchema: "inventory",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_reorder_suggestions_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_reorder_suggestions_reorder_rules_TriggeredByRuleId",
                        column: x => x.TriggeredByRuleId,
                        principalSchema: "inventory",
                        principalTable: "reorder_rules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CycleCounts",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanNumber = table.Column<string>(type: "text", nullable: false),
                    PlanName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CountType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ScheduledStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScheduledEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActualStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Frequency = table.Column<int>(type: "integer", nullable: true),
                    NextScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarehouseId = table.Column<int>(type: "integer", nullable: false),
                    ZoneId = table.Column<int>(type: "integer", nullable: true),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    AbcClassFilter = table.Column<int>(type: "integer", nullable: true),
                    OnlyNegativeStocks = table.Column<bool>(type: "boolean", nullable: false),
                    OnlyZeroStocks = table.Column<bool>(type: "boolean", nullable: false),
                    DaysSinceLastMovement = table.Column<int>(type: "integer", nullable: true),
                    TotalItems = table.Column<int>(type: "integer", nullable: false),
                    CountedItems = table.Column<int>(type: "integer", nullable: false),
                    ItemsWithVariance = table.Column<int>(type: "integer", nullable: false),
                    AccuracyPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    QuantityTolerancePercent = table.Column<decimal>(type: "numeric", nullable: false),
                    ValueTolerance = table.Column<decimal>(type: "numeric", nullable: true),
                    BlockAutoApproveOnToleranceExceeded = table.Column<bool>(type: "boolean", nullable: false),
                    AssignedTo = table.Column<string>(type: "text", nullable: true),
                    AssignedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PlanningNotes = table.Column<string>(type: "text", nullable: true),
                    CountNotes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_CycleCounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CycleCounts_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "inventory",
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CycleCounts_WarehouseZones_ZoneId",
                        column: x => x.ZoneId,
                        principalSchema: "inventory",
                        principalTable: "WarehouseZones",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CycleCounts_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalSchema: "inventory",
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CycleCountItems",
                schema: "inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CycleCountId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    LotNumber = table.Column<string>(type: "text", nullable: true),
                    SystemQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    CountedQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    IsCounted = table.Column<bool>(type: "boolean", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric", nullable: true),
                    CountedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CountedBy = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CountAttempts = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_CycleCountItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CycleCountItems_CycleCounts_CycleCountId",
                        column: x => x.CycleCountId,
                        principalSchema: "inventory",
                        principalTable: "CycleCounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CycleCountItems_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "inventory",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CycleCountItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId_WarehouseZoneId",
                schema: "inventory",
                table: "Locations",
                columns: new[] { "TenantId", "WarehouseZoneId" });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_WarehouseZoneId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_EntityName_EntityId",
                schema: "inventory",
                table: "audit_logs",
                columns: new[] { "EntityName", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Timestamp",
                schema: "inventory",
                table: "audit_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_UserId",
                schema: "inventory",
                table: "audit_logs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_PackagingTypeId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "PackagingTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_ProductId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_ProductVariantId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_BarcodeDefinitions_UnitId",
                schema: "inventory",
                table: "BarcodeDefinitions",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStockMovements_ConsignmentStockId",
                schema: "inventory",
                table: "ConsignmentStockMovements",
                column: "ConsignmentStockId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_LocationId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_ProductId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_SupplierId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsignmentStocks_WarehouseId",
                schema: "inventory",
                table: "ConsignmentStocks",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_CycleCountId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "CycleCountId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_LocationId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCountItems_ProductId",
                schema: "inventory",
                table: "CycleCountItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_CategoryId",
                schema: "inventory",
                table: "CycleCounts",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_WarehouseId",
                schema: "inventory",
                table: "CycleCounts",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_CycleCounts_ZoneId",
                schema: "inventory",
                table: "CycleCounts",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustmentItems_InventoryAdjustmentId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                column: "InventoryAdjustmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustmentItems_ProductId",
                schema: "inventory",
                table: "InventoryAdjustmentItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_LocationId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_StockCountId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "StockCountId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAdjustments_WarehouseId",
                schema: "inventory",
                table: "InventoryAdjustments",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControlAttachment_QualityControlId",
                schema: "inventory",
                table: "QualityControlAttachment",
                column: "QualityControlId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControlItems_QualityControlId",
                schema: "inventory",
                table: "QualityControlItems",
                column: "QualityControlId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_ProductId",
                schema: "inventory",
                table: "QualityControls",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_SupplierId",
                schema: "inventory",
                table: "QualityControls",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityControls_WarehouseId",
                schema: "inventory",
                table: "QualityControls",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_rules_CategoryId",
                schema: "inventory",
                table: "reorder_rules",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_rules_ProductId",
                schema: "inventory",
                table: "reorder_rules",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_rules_Status",
                schema: "inventory",
                table: "reorder_rules",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_rules_Status_NextScheduledRun",
                schema: "inventory",
                table: "reorder_rules",
                columns: new[] { "Status", "NextScheduledRun" });

            migrationBuilder.CreateIndex(
                name: "IX_reorder_rules_SupplierId",
                schema: "inventory",
                table: "reorder_rules",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_rules_WarehouseId",
                schema: "inventory",
                table: "reorder_rules",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_ExpiresAt",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_GeneratedAt",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "GeneratedAt");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_ProductId",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_Status",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_Status_ExpiresAt",
                schema: "inventory",
                table: "reorder_suggestions",
                columns: new[] { "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_SuggestedSupplierId",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "SuggestedSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_TriggeredByRuleId",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "TriggeredByRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_reorder_suggestions_WarehouseId",
                schema: "inventory",
                table: "reorder_suggestions",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ShelfLives_ProductId",
                schema: "inventory",
                table: "ShelfLives",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_TenantId",
                schema: "inventory",
                table: "WarehouseZones",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_TenantId_IsActive",
                schema: "inventory",
                table: "WarehouseZones",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_TenantId_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_TenantId_WarehouseId_Code",
                schema: "inventory",
                table: "WarehouseZones",
                columns: new[] { "TenantId", "WarehouseId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_TenantId_ZoneType",
                schema: "inventory",
                table: "WarehouseZones",
                columns: new[] { "TenantId", "ZoneType" });

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_WarehouseId",
                schema: "inventory",
                table: "WarehouseZones",
                column: "WarehouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_WarehouseZones_WarehouseZoneId",
                schema: "inventory",
                table: "Locations",
                column: "WarehouseZoneId",
                principalSchema: "inventory",
                principalTable: "WarehouseZones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Locations_WarehouseZones_WarehouseZoneId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.DropTable(
                name: "audit_logs",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "BarcodeDefinitions",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ConsignmentStockMovements",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "CycleCountItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "InventoryAdjustmentItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "QualityControlAttachment",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "QualityControlItems",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "reorder_suggestions",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ShelfLives",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "PackagingTypes",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "ConsignmentStocks",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "CycleCounts",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "InventoryAdjustments",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "QualityControls",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "reorder_rules",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "WarehouseZones",
                schema: "inventory");

            migrationBuilder.DropIndex(
                name: "IX_Locations_TenantId_WarehouseZoneId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_WarehouseZoneId",
                schema: "inventory",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "WarehouseZoneId",
                schema: "inventory",
                table: "Locations");
        }
    }
}
