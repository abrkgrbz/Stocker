using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApprovalGroups",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ApprovalType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RequiredApprovals = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalWorkflowConfigs",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    WorkflowType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartmentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    CategoryName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    MinAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalWorkflowConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PriceLists",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: true),
                    SupplierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SupplierName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "numeric", nullable: false),
                    GlobalDiscountRate = table.Column<decimal>(type: "numeric", nullable: true),
                    IncludesVat = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultVatRate = table.Column<decimal>(type: "numeric", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    PreviousVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeNotes = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseBudgets",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PeriodType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Quarter = table.Column<int>(type: "integer", nullable: true),
                    Month = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartmentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CostCenterCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CostCenterName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    CategoryName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AllocatedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CommittedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SpentAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AvailableAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    WarningThreshold = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    CriticalThreshold = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    AlertOnWarning = table.Column<bool>(type: "boolean", nullable: false),
                    AlertOnCritical = table.Column<bool>(type: "boolean", nullable: false),
                    BlockOnExceed = table.Column<bool>(type: "boolean", nullable: false),
                    ParentBudgetId = table.Column<Guid>(type: "uuid", nullable: true),
                    ParentBudgetCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseBudgets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseContracts",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TerminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AutoRenew = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalPeriodMonths = table.Column<int>(type: "integer", nullable: true),
                    RenewalNoticeDays = table.Column<int>(type: "integer", nullable: true),
                    MinimumOrderValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumOrderValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalContractValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    UsedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    MinimumQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    MaximumQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    UsedQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentTermDays = table.Column<int>(type: "integer", nullable: false),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: true),
                    DiscountRate = table.Column<decimal>(type: "numeric", nullable: true),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: true),
                    DeliveryTerms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ShippingMethod = table.Column<string>(type: "text", nullable: true),
                    ContactPerson = table.Column<string>(type: "text", nullable: true),
                    ContactEmail = table.Column<string>(type: "text", nullable: true),
                    ContactPhone = table.Column<string>(type: "text", nullable: true),
                    Terms = table.Column<string>(type: "text", nullable: true),
                    PenaltyClause = table.Column<string>(type: "text", nullable: true),
                    WarrantyTerms = table.Column<string>(type: "text", nullable: true),
                    QualityRequirements = table.Column<string>(type: "text", nullable: true),
                    PaymentTerms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    QualityTerms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    PenaltyTerms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    OtherTerms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    WarrantyPeriodMonths = table.Column<int>(type: "integer", precision: 5, scale: 2, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DocumentPath = table.Column<string>(type: "text", nullable: true),
                    DocumentUrl = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TerminationReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseContracts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Quotations",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    QuotationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RequesterId = table.Column<Guid>(type: "uuid", nullable: true),
                    RequesterName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartmentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PurchaseRequestId = table.Column<Guid>(type: "uuid", nullable: true),
                    PurchaseRequestNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EstimatedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SelectedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SelectedSupplierId = table.Column<Guid>(type: "uuid", nullable: true),
                    SelectedSupplierName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    SelectedQuoteResponseId = table.Column<Guid>(type: "uuid", nullable: true),
                    SelectionReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SelectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SelectionById = table.Column<Guid>(type: "uuid", nullable: true),
                    SelectionByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    PurchaseOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ConvertedPurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    ConvertedOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Terms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SupplierEvaluations",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PeriodType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Quarter = table.Column<int>(type: "integer", nullable: true),
                    Month = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    QualityScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DeliveryScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    PriceScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    ServiceScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CommunicationScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    OverallScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    QualityWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DeliveryWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    PriceWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    ServiceWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CommunicationWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TotalOrders = table.Column<int>(type: "integer", nullable: false),
                    OnTimeDeliveries = table.Column<int>(type: "integer", nullable: false),
                    OnTimeDeliveryRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TotalItems = table.Column<int>(type: "integer", nullable: false),
                    AcceptedItems = table.Column<int>(type: "integer", nullable: false),
                    RejectedItems = table.Column<int>(type: "integer", nullable: false),
                    AcceptanceRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    AverageLeadTimeDays = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalReturns = table.Column<int>(type: "integer", nullable: false),
                    ReturnRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TotalPurchaseAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AverageOrderValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PreviousOverallScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ScoreChange = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ScoreTrend = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Rating = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RankInCategory = table.Column<int>(type: "integer", nullable: true),
                    TotalSuppliersInCategory = table.Column<int>(type: "integer", nullable: true),
                    EvaluatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    EvaluatedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EvaluationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Strengths = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Weaknesses = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ImprovementAreas = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Recommendations = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RequiresFollowUp = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FollowUpNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FollowUpCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierEvaluations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalGroupMembers",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CanDelegate = table.Column<bool>(type: "boolean", nullable: false),
                    DelegateToId = table.Column<Guid>(type: "uuid", nullable: true),
                    DelegateToName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DelegationStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DelegationEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalGroupMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalGroupMembers_ApprovalGroups_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "purchase",
                        principalTable: "ApprovalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalWorkflowRules",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowConfigId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RuleType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Operator = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NumericValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalWorkflowRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalWorkflowRules_ApprovalWorkflowConfigs_WorkflowConfi~",
                        column: x => x.WorkflowConfigId,
                        principalSchema: "purchase",
                        principalTable: "ApprovalWorkflowConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalWorkflowSteps",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowConfigId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    StepType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    MinAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ApproverId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApproverName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApproverRole = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApproverRoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApproverRoleName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApproverGroupId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovalGroupName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RequiredApprovals = table.Column<int>(type: "integer", nullable: false),
                    RequireAllGroupMembers = table.Column<bool>(type: "boolean", nullable: false),
                    MinApproversRequired = table.Column<int>(type: "integer", nullable: true),
                    AllowSelfApproval = table.Column<bool>(type: "boolean", nullable: false),
                    AllowDelegation = table.Column<bool>(type: "boolean", nullable: false),
                    FallbackApproverId = table.Column<Guid>(type: "uuid", nullable: true),
                    FallbackApproverName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SLAHours = table.Column<int>(type: "integer", nullable: true),
                    AutoEscalate = table.Column<bool>(type: "boolean", nullable: false),
                    EscalateToId = table.Column<Guid>(type: "uuid", nullable: true),
                    EscalateToName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Instructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalWorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalWorkflowSteps_ApprovalWorkflowConfigs_WorkflowConfi~",
                        column: x => x.WorkflowConfigId,
                        principalSchema: "purchase",
                        principalTable: "ApprovalWorkflowConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceListItems",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PriceListId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    PreviousPrice = table.Column<decimal>(type: "numeric", nullable: true),
                    PriceChangeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VatRate = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    MinOrderQuantity = table.Column<int>(type: "integer", nullable: true),
                    MaxOrderQuantity = table.Column<int>(type: "integer", nullable: true),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BasePrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    MinQuantity = table.Column<int>(type: "integer", precision: 18, scale: 4, nullable: true),
                    MaxQuantity = table.Column<int>(type: "integer", precision: 18, scale: 4, nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriceListItems_PriceLists_PriceListId",
                        column: x => x.PriceListId,
                        principalSchema: "purchase",
                        principalTable: "PriceLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseBudgetRevisions",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreviousAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NewAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ChangeAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    RevisedById = table.Column<Guid>(type: "uuid", nullable: false),
                    RevisedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RevisedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseBudgetRevisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseBudgetRevisions_PurchaseBudgets_BudgetId",
                        column: x => x.BudgetId,
                        principalSchema: "purchase",
                        principalTable: "PurchaseBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseBudgetTransactions",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ReferenceId = table.Column<Guid>(type: "uuid", nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseBudgetTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseBudgetTransactions_PurchaseBudgets_BudgetId",
                        column: x => x.BudgetId,
                        principalSchema: "purchase",
                        principalTable: "PurchaseBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseContractItems",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MinQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    MaxQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    ContractedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    UsedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    MinOrderQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaxOrderQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Specifications = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseContractItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseContractItems_PurchaseContracts_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "purchase",
                        principalTable: "PurchaseContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuotationItems",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    EstimatedUnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Specifications = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RequiredDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuotationItems_Quotations_QuotationId",
                        column: x => x.QuotationId,
                        principalSchema: "purchase",
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuotationSuppliers",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    ContactPerson = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ContactPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ResponseDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReminderSentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReminderCount = table.Column<int>(type: "integer", nullable: false),
                    ResponseStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ResponseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    QuotedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    DeliveryDays = table.Column<int>(type: "integer", nullable: true),
                    PaymentTerms = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ValidityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    QuoteValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SupplierNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ResponseNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DeclineReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    InternalEvaluation = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EvaluationScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IsSelected = table.Column<bool>(type: "boolean", nullable: false),
                    SelectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SelectionReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotationSuppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuotationSuppliers_Quotations_QuotationId",
                        column: x => x.QuotationId,
                        principalSchema: "purchase",
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplierEvaluationCriteria",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Weight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    WeightedScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Evidence = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierEvaluationCriteria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierEvaluationCriteria_SupplierEvaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalSchema: "purchase",
                        principalTable: "SupplierEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplierEvaluationHistory",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Quarter = table.Column<int>(type: "integer", nullable: true),
                    Month = table.Column<int>(type: "integer", nullable: true),
                    OverallScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    QualityScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DeliveryScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    PriceScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    ServiceScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CommunicationScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Rating = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierEvaluationHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierEvaluationHistory_SupplierEvaluations_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "purchase",
                        principalTable: "SupplierEvaluations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PriceListItemTiers",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PriceListItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    MinQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MaxQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TierLevel = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListItemTiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriceListItemTiers_PriceListItems_PriceListItemId",
                        column: x => x.PriceListItemId,
                        principalSchema: "purchase",
                        principalTable: "PriceListItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseContractPriceBreaks",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "text", nullable: false),
                    MinQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MaxQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PurchaseContractId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseContractPriceBreaks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseContractPriceBreaks_PurchaseContractItems_ContractI~",
                        column: x => x.ContractItemId,
                        principalSchema: "purchase",
                        principalTable: "PurchaseContractItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PurchaseContractPriceBreaks_PurchaseContracts_PurchaseContr~",
                        column: x => x.PurchaseContractId,
                        principalSchema: "purchase",
                        principalTable: "PurchaseContracts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QuotationSupplierItems",
                schema: "purchase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationSupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ProductName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotationSupplierItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuotationSupplierItems_QuotationSuppliers_QuotationSupplier~",
                        column: x => x.QuotationSupplierId,
                        principalSchema: "purchase",
                        principalTable: "QuotationSuppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroupMembers_GroupId",
                schema: "purchase",
                table: "ApprovalGroupMembers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroupMembers_TenantId_GroupId",
                schema: "purchase",
                table: "ApprovalGroupMembers",
                columns: new[] { "TenantId", "GroupId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroupMembers_TenantId_GroupId_UserId",
                schema: "purchase",
                table: "ApprovalGroupMembers",
                columns: new[] { "TenantId", "GroupId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroupMembers_TenantId_UserId",
                schema: "purchase",
                table: "ApprovalGroupMembers",
                columns: new[] { "TenantId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroups_TenantId_Code",
                schema: "purchase",
                table: "ApprovalGroups",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroups_TenantId_IsActive",
                schema: "purchase",
                table: "ApprovalGroups",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalGroups_TenantId_Name",
                schema: "purchase",
                table: "ApprovalGroups",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowConfigs_TenantId_Code",
                schema: "purchase",
                table: "ApprovalWorkflowConfigs",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowConfigs_TenantId_DepartmentId",
                schema: "purchase",
                table: "ApprovalWorkflowConfigs",
                columns: new[] { "TenantId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowConfigs_TenantId_EntityType",
                schema: "purchase",
                table: "ApprovalWorkflowConfigs",
                columns: new[] { "TenantId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowConfigs_TenantId_IsActive",
                schema: "purchase",
                table: "ApprovalWorkflowConfigs",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowConfigs_TenantId_Name",
                schema: "purchase",
                table: "ApprovalWorkflowConfigs",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowRules_TenantId_WorkflowConfigId",
                schema: "purchase",
                table: "ApprovalWorkflowRules",
                columns: new[] { "TenantId", "WorkflowConfigId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowRules_WorkflowConfigId",
                schema: "purchase",
                table: "ApprovalWorkflowRules",
                column: "WorkflowConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowSteps_TenantId_ApproverGroupId",
                schema: "purchase",
                table: "ApprovalWorkflowSteps",
                columns: new[] { "TenantId", "ApproverGroupId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowSteps_TenantId_ApproverId",
                schema: "purchase",
                table: "ApprovalWorkflowSteps",
                columns: new[] { "TenantId", "ApproverId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowSteps_TenantId_WorkflowConfigId",
                schema: "purchase",
                table: "ApprovalWorkflowSteps",
                columns: new[] { "TenantId", "WorkflowConfigId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWorkflowSteps_WorkflowConfigId",
                schema: "purchase",
                table: "ApprovalWorkflowSteps",
                column: "WorkflowConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_PriceListId",
                schema: "purchase",
                table: "PriceListItems",
                column: "PriceListId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_TenantId_PriceListId",
                schema: "purchase",
                table: "PriceListItems",
                columns: new[] { "TenantId", "PriceListId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_TenantId_PriceListId_ProductId",
                schema: "purchase",
                table: "PriceListItems",
                columns: new[] { "TenantId", "PriceListId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItems_TenantId_ProductId",
                schema: "purchase",
                table: "PriceListItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItemTiers_PriceListItemId",
                schema: "purchase",
                table: "PriceListItemTiers",
                column: "PriceListItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItemTiers_TenantId_PriceListItemId",
                schema: "purchase",
                table: "PriceListItemTiers",
                columns: new[] { "TenantId", "PriceListItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_Code_Version",
                schema: "purchase",
                table: "PriceLists",
                columns: new[] { "TenantId", "Code", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_EffectiveFrom_EffectiveTo",
                schema: "purchase",
                table: "PriceLists",
                columns: new[] { "TenantId", "EffectiveFrom", "EffectiveTo" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_IsDefault",
                schema: "purchase",
                table: "PriceLists",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_Status",
                schema: "purchase",
                table: "PriceLists",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_TenantId_SupplierId",
                schema: "purchase",
                table: "PriceLists",
                columns: new[] { "TenantId", "SupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetRevisions_BudgetId",
                schema: "purchase",
                table: "PurchaseBudgetRevisions",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetRevisions_TenantId_BudgetId",
                schema: "purchase",
                table: "PurchaseBudgetRevisions",
                columns: new[] { "TenantId", "BudgetId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetRevisions_TenantId_RevisedAt",
                schema: "purchase",
                table: "PurchaseBudgetRevisions",
                columns: new[] { "TenantId", "RevisedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgets_TenantId_CategoryId",
                schema: "purchase",
                table: "PurchaseBudgets",
                columns: new[] { "TenantId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgets_TenantId_Code",
                schema: "purchase",
                table: "PurchaseBudgets",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgets_TenantId_DepartmentId",
                schema: "purchase",
                table: "PurchaseBudgets",
                columns: new[] { "TenantId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgets_TenantId_ParentBudgetId",
                schema: "purchase",
                table: "PurchaseBudgets",
                columns: new[] { "TenantId", "ParentBudgetId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgets_TenantId_Status",
                schema: "purchase",
                table: "PurchaseBudgets",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgets_TenantId_Year",
                schema: "purchase",
                table: "PurchaseBudgets",
                columns: new[] { "TenantId", "Year" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetTransactions_BudgetId",
                schema: "purchase",
                table: "PurchaseBudgetTransactions",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetTransactions_TenantId_BudgetId",
                schema: "purchase",
                table: "PurchaseBudgetTransactions",
                columns: new[] { "TenantId", "BudgetId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetTransactions_TenantId_ReferenceId",
                schema: "purchase",
                table: "PurchaseBudgetTransactions",
                columns: new[] { "TenantId", "ReferenceId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseBudgetTransactions_TenantId_TransactionDate",
                schema: "purchase",
                table: "PurchaseBudgetTransactions",
                columns: new[] { "TenantId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContractItems_ContractId",
                schema: "purchase",
                table: "PurchaseContractItems",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContractItems_TenantId_ContractId",
                schema: "purchase",
                table: "PurchaseContractItems",
                columns: new[] { "TenantId", "ContractId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContractItems_TenantId_ProductId",
                schema: "purchase",
                table: "PurchaseContractItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContractPriceBreaks_ContractItemId",
                schema: "purchase",
                table: "PurchaseContractPriceBreaks",
                column: "ContractItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContractPriceBreaks_PurchaseContractId",
                schema: "purchase",
                table: "PurchaseContractPriceBreaks",
                column: "PurchaseContractId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContractPriceBreaks_TenantId_ContractItemId",
                schema: "purchase",
                table: "PurchaseContractPriceBreaks",
                columns: new[] { "TenantId", "ContractItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContracts_TenantId_ContractNumber",
                schema: "purchase",
                table: "PurchaseContracts",
                columns: new[] { "TenantId", "ContractNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContracts_TenantId_StartDate_EndDate",
                schema: "purchase",
                table: "PurchaseContracts",
                columns: new[] { "TenantId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContracts_TenantId_Status",
                schema: "purchase",
                table: "PurchaseContracts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseContracts_TenantId_SupplierId",
                schema: "purchase",
                table: "PurchaseContracts",
                columns: new[] { "TenantId", "SupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_QuotationId",
                schema: "purchase",
                table: "QuotationItems",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_TenantId_ProductId",
                schema: "purchase",
                table: "QuotationItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_TenantId_QuotationId",
                schema: "purchase",
                table: "QuotationItems",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId_PurchaseRequestId",
                schema: "purchase",
                table: "Quotations",
                columns: new[] { "TenantId", "PurchaseRequestId" });

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId_QuotationDate",
                schema: "purchase",
                table: "Quotations",
                columns: new[] { "TenantId", "QuotationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId_QuotationNumber",
                schema: "purchase",
                table: "Quotations",
                columns: new[] { "TenantId", "QuotationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId_Status",
                schema: "purchase",
                table: "Quotations",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId_WarehouseId",
                schema: "purchase",
                table: "Quotations",
                columns: new[] { "TenantId", "WarehouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationSupplierItems_QuotationSupplierId",
                schema: "purchase",
                table: "QuotationSupplierItems",
                column: "QuotationSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationSupplierItems_TenantId_QuotationItemId",
                schema: "purchase",
                table: "QuotationSupplierItems",
                columns: new[] { "TenantId", "QuotationItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationSupplierItems_TenantId_QuotationSupplierId",
                schema: "purchase",
                table: "QuotationSupplierItems",
                columns: new[] { "TenantId", "QuotationSupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationSuppliers_QuotationId",
                schema: "purchase",
                table: "QuotationSuppliers",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationSuppliers_TenantId_QuotationId",
                schema: "purchase",
                table: "QuotationSuppliers",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationSuppliers_TenantId_SupplierId",
                schema: "purchase",
                table: "QuotationSuppliers",
                columns: new[] { "TenantId", "SupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluationCriteria_EvaluationId",
                schema: "purchase",
                table: "SupplierEvaluationCriteria",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluationCriteria_TenantId_EvaluationId",
                schema: "purchase",
                table: "SupplierEvaluationCriteria",
                columns: new[] { "TenantId", "EvaluationId" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluationHistory_SupplierId",
                schema: "purchase",
                table: "SupplierEvaluationHistory",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluationHistory_TenantId_SupplierId",
                schema: "purchase",
                table: "SupplierEvaluationHistory",
                columns: new[] { "TenantId", "SupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluationHistory_TenantId_Year_Quarter",
                schema: "purchase",
                table: "SupplierEvaluationHistory",
                columns: new[] { "TenantId", "Year", "Quarter" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluations_TenantId_EvaluationNumber",
                schema: "purchase",
                table: "SupplierEvaluations",
                columns: new[] { "TenantId", "EvaluationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluations_TenantId_Rating",
                schema: "purchase",
                table: "SupplierEvaluations",
                columns: new[] { "TenantId", "Rating" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluations_TenantId_Status",
                schema: "purchase",
                table: "SupplierEvaluations",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluations_TenantId_SupplierId",
                schema: "purchase",
                table: "SupplierEvaluations",
                columns: new[] { "TenantId", "SupplierId" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluations_TenantId_Year_Quarter",
                schema: "purchase",
                table: "SupplierEvaluations",
                columns: new[] { "TenantId", "Year", "Quarter" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApprovalGroupMembers",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "ApprovalWorkflowRules",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "ApprovalWorkflowSteps",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PriceListItemTiers",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PurchaseBudgetRevisions",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PurchaseBudgetTransactions",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PurchaseContractPriceBreaks",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "QuotationItems",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "QuotationSupplierItems",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "SupplierEvaluationCriteria",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "SupplierEvaluationHistory",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "ApprovalGroups",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "ApprovalWorkflowConfigs",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PriceListItems",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PurchaseBudgets",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PurchaseContractItems",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "QuotationSuppliers",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "SupplierEvaluations",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PriceLists",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "PurchaseContracts",
                schema: "purchase");

            migrationBuilder.DropTable(
                name: "Quotations",
                schema: "purchase");
        }
    }
}
