using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixCrmInternalFKTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "crm");

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignId",
                schema: "CRM",
                table: "Leads",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Campaigns",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BudgetedCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetedCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ActualCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualCostCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ExpectedRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ExpectedRevenueCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ActualRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualRevenueCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ExpectedResponse = table.Column<int>(type: "int", nullable: false),
                    ActualResponse = table.Column<int>(type: "int", nullable: false),
                    NumberSent = table.Column<int>(type: "int", nullable: false),
                    NumberDelivered = table.Column<int>(type: "int", nullable: false),
                    NumberOpened = table.Column<int>(type: "int", nullable: false),
                    NumberClicked = table.Column<int>(type: "int", nullable: false),
                    NumberUnsubscribed = table.Column<int>(type: "int", nullable: false),
                    NumberBounced = table.Column<int>(type: "int", nullable: false),
                    TargetAudience = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Objective = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentCampaignId = table.Column<int>(type: "int", nullable: true),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    EmailSubject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailTemplateId = table.Column<int>(type: "int", nullable: true),
                    EmailFromAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailFromName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailReplyTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LandingPageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtmSource = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtmMedium = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtmCampaign = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtmTerm = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtmContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentCampaignId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Campaigns_ParentCampaignId1",
                        column: x => x.ParentCampaignId1,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadScoringHistories",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<int>(type: "int", nullable: false),
                    PreviousScore = table.Column<int>(type: "int", nullable: false),
                    NewScore = table.Column<int>(type: "int", nullable: false),
                    RuleApplied = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScoreChange = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScoredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LeadId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadScoringHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadScoringHistories_Leads_LeadId1",
                        column: x => x.LeadId1,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadScoringRules",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Field = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Operator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadScoringRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pipelines",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pipelines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PipelineStages",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PipelineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Probability = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsWon = table.Column<bool>(type: "bit", nullable: false),
                    IsLost = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RottenDays = table.Column<int>(type: "int", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PipelineStages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PipelineStages_Pipelines_PipelineId",
                        column: x => x.PipelineId,
                        principalSchema: "crm",
                        principalTable: "Pipelines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deals",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PipelineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    RecurringValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RecurringCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    RecurringPeriod = table.Column<int>(type: "int", nullable: true),
                    RecurringCycles = table.Column<int>(type: "int", nullable: true),
                    Probability = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualCloseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    LostReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Deal_Currency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RottenDays = table.Column<int>(type: "int", nullable: true),
                    LastActivityDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextActivityDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActivitiesCount = table.Column<int>(type: "int", nullable: false),
                    EmailsCount = table.Column<int>(type: "int", nullable: false),
                    Labels = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deals_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deals_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deals_PipelineStages_StageId",
                        column: x => x.StageId,
                        principalSchema: "crm",
                        principalTable: "PipelineStages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deals_Pipelines_PipelineId",
                        column: x => x.PipelineId,
                        principalSchema: "crm",
                        principalTable: "Pipelines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Opportunities",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PipelineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Probability = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualCloseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    LostReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompetitorName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CampaignId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    Source = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    ParentOpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NextStep = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CampaignId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opportunities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Opportunities_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_Campaigns_CampaignId1",
                        column: x => x.CampaignId1,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Opportunities_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_Opportunities_ParentOpportunityId",
                        column: x => x.ParentOpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_PipelineStages_StageId",
                        column: x => x.StageId,
                        principalSchema: "crm",
                        principalTable: "PipelineStages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_Pipelines_PipelineId",
                        column: x => x.PipelineId,
                        principalSchema: "crm",
                        principalTable: "Pipelines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DealProducts",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DealId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPriceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Tax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false),
                    RecurringPeriod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecurringCycles = table.Column<int>(type: "int", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DealProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DealProducts_Deals_DealId",
                        column: x => x.DealId,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Duration = table.Column<TimeSpan>(type: "time", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedEntityId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DealId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    AssignedToId = table.Column<int>(type: "int", nullable: true),
                    CallDirection = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CallDuration = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CallRecordingUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailFrom = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailCc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailBcc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailSubject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailHasAttachments = table.Column<bool>(type: "bit", nullable: true),
                    MeetingStartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MeetingEndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MeetingAttendees = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MeetingAgenda = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MeetingNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MeetingLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskProgress = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TaskOutcome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeadId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DealId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Contacts_ContactId1",
                        column: x => x.ContactId1,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Customers_CustomerId1",
                        column: x => x.CustomerId1,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Deals_DealId",
                        column: x => x.DealId,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Activities_Deals_DealId1",
                        column: x => x.DealId1,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Leads_LeadId1",
                        column: x => x.LeadId1,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CampaignMembers",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<int>(type: "int", nullable: true),
                    LeadId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RespondedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FirstOpenDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastOpenDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OpenCount = table.Column<int>(type: "int", nullable: false),
                    FirstClickDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastClickDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClickCount = table.Column<int>(type: "int", nullable: false),
                    UnsubscribedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BouncedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BounceReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasConverted = table.Column<bool>(type: "bit", nullable: false),
                    ConvertedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConvertedOpportunityId = table.Column<int>(type: "int", nullable: true),
                    CampaignId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeadId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConvertedOpportunityId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Campaigns_CampaignId1",
                        column: x => x.CampaignId1,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Contacts_ContactId1",
                        column: x => x.ContactId1,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Leads_LeadId1",
                        column: x => x.LeadId1,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Opportunities_ConvertedOpportunityId1",
                        column: x => x.ConvertedOpportunityId1,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OpportunityProducts",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPriceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    OpportunityId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityProducts_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpportunityProducts_Opportunities_OpportunityId1",
                        column: x => x.OpportunityId1,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsPinned = table.Column<bool>(type: "bit", nullable: false),
                    IsPrivate = table.Column<bool>(type: "bit", nullable: false),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedEntityId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DealId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ActivityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedById = table.Column<int>(type: "int", nullable: false),
                    LastModifiedById = table.Column<int>(type: "int", nullable: true),
                    AttachmentUrls = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeadId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DealId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ActivityId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalSchema: "crm",
                        principalTable: "Activities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Activities_ActivityId1",
                        column: x => x.ActivityId1,
                        principalSchema: "crm",
                        principalTable: "Activities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Contacts_ContactId1",
                        column: x => x.ContactId1,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Customers_CustomerId1",
                        column: x => x.CustomerId1,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Deals_DealId",
                        column: x => x.DealId,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_Deals_DealId1",
                        column: x => x.DealId1,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Leads_LeadId1",
                        column: x => x.LeadId1,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notes_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_CampaignId",
                schema: "CRM",
                table: "Leads",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ContactId",
                schema: "crm",
                table: "Activities",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ContactId1",
                schema: "crm",
                table: "Activities",
                column: "ContactId1");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_CustomerId",
                schema: "crm",
                table: "Activities",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_CustomerId1",
                schema: "crm",
                table: "Activities",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_DealId",
                schema: "crm",
                table: "Activities",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_DealId1",
                schema: "crm",
                table: "Activities",
                column: "DealId1");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_LeadId",
                schema: "crm",
                table: "Activities",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_LeadId1",
                schema: "crm",
                table: "Activities",
                column: "LeadId1");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_OpportunityId",
                schema: "crm",
                table: "Activities",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_CampaignId1",
                schema: "crm",
                table: "CampaignMembers",
                column: "CampaignId1");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_ContactId1",
                schema: "crm",
                table: "CampaignMembers",
                column: "ContactId1");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_ConvertedOpportunityId1",
                schema: "crm",
                table: "CampaignMembers",
                column: "ConvertedOpportunityId1");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_LeadId1",
                schema: "crm",
                table: "CampaignMembers",
                column: "LeadId1");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_ParentCampaignId1",
                schema: "crm",
                table: "Campaigns",
                column: "ParentCampaignId1");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TenantId",
                schema: "crm",
                table: "Campaigns",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TenantId_StartDate_EndDate",
                schema: "crm",
                table: "Campaigns",
                columns: new[] { "TenantId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TenantId_Status",
                schema: "crm",
                table: "Campaigns",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TenantId_Type",
                schema: "crm",
                table: "Campaigns",
                columns: new[] { "TenantId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_DealProducts_DealId",
                schema: "crm",
                table: "DealProducts",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_DealProducts_DealId1",
                schema: "crm",
                table: "DealProducts",
                column: "DealId1");

            migrationBuilder.CreateIndex(
                name: "IX_DealProducts_TenantId",
                schema: "crm",
                table: "DealProducts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DealProducts_TenantId_DealId",
                schema: "crm",
                table: "DealProducts",
                columns: new[] { "TenantId", "DealId" });

            migrationBuilder.CreateIndex(
                name: "IX_DealProducts_TenantId_ProductId",
                schema: "crm",
                table: "DealProducts",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_Deals_ContactId",
                schema: "crm",
                table: "Deals",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_CustomerId",
                schema: "crm",
                table: "Deals",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_PipelineId",
                schema: "crm",
                table: "Deals",
                column: "PipelineId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_StageId",
                schema: "crm",
                table: "Deals",
                column: "StageId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_TenantId",
                schema: "crm",
                table: "Deals",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_TenantId_CustomerId",
                schema: "crm",
                table: "Deals",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Deals_TenantId_ExpectedCloseDate",
                schema: "crm",
                table: "Deals",
                columns: new[] { "TenantId", "ExpectedCloseDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Deals_TenantId_PipelineId",
                schema: "crm",
                table: "Deals",
                columns: new[] { "TenantId", "PipelineId" });

            migrationBuilder.CreateIndex(
                name: "IX_Deals_TenantId_StageId",
                schema: "crm",
                table: "Deals",
                columns: new[] { "TenantId", "StageId" });

            migrationBuilder.CreateIndex(
                name: "IX_Deals_TenantId_Status",
                schema: "crm",
                table: "Deals",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LeadScoringHistories_LeadId1",
                schema: "crm",
                table: "LeadScoringHistories",
                column: "LeadId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ActivityId",
                schema: "crm",
                table: "Notes",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ActivityId1",
                schema: "crm",
                table: "Notes",
                column: "ActivityId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ContactId",
                schema: "crm",
                table: "Notes",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ContactId1",
                schema: "crm",
                table: "Notes",
                column: "ContactId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_CustomerId",
                schema: "crm",
                table: "Notes",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_CustomerId1",
                schema: "crm",
                table: "Notes",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_DealId",
                schema: "crm",
                table: "Notes",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_DealId1",
                schema: "crm",
                table: "Notes",
                column: "DealId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_LeadId",
                schema: "crm",
                table: "Notes",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_LeadId1",
                schema: "crm",
                table: "Notes",
                column: "LeadId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_OpportunityId",
                schema: "crm",
                table: "Notes",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_CampaignId",
                schema: "crm",
                table: "Opportunities",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_CampaignId1",
                schema: "crm",
                table: "Opportunities",
                column: "CampaignId1");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ContactId",
                schema: "crm",
                table: "Opportunities",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_CustomerId",
                schema: "crm",
                table: "Opportunities",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_LeadId",
                schema: "crm",
                table: "Opportunities",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ParentOpportunityId",
                schema: "crm",
                table: "Opportunities",
                column: "ParentOpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_PipelineId",
                schema: "crm",
                table: "Opportunities",
                column: "PipelineId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_StageId",
                schema: "crm",
                table: "Opportunities",
                column: "StageId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId",
                schema: "crm",
                table: "Opportunities",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_CustomerId",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_ExpectedCloseDate",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "ExpectedCloseDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_LeadId",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "LeadId" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_PipelineId",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "PipelineId" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_StageId",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "StageId" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_TenantId_Status",
                schema: "crm",
                table: "Opportunities",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityProducts_OpportunityId",
                schema: "crm",
                table: "OpportunityProducts",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityProducts_OpportunityId1",
                schema: "crm",
                table: "OpportunityProducts",
                column: "OpportunityId1");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityProducts_TenantId",
                schema: "crm",
                table: "OpportunityProducts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityProducts_TenantId_OpportunityId",
                schema: "crm",
                table: "OpportunityProducts",
                columns: new[] { "TenantId", "OpportunityId" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityProducts_TenantId_ProductId",
                schema: "crm",
                table: "OpportunityProducts",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_PipelineId",
                schema: "crm",
                table: "PipelineStages",
                column: "PipelineId");

            migrationBuilder.AddForeignKey(
                name: "FK_Leads_Campaigns_CampaignId",
                schema: "CRM",
                table: "Leads",
                column: "CampaignId",
                principalSchema: "crm",
                principalTable: "Campaigns",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Leads_Campaigns_CampaignId",
                schema: "CRM",
                table: "Leads");

            migrationBuilder.DropTable(
                name: "CampaignMembers",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "DealProducts",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LeadScoringHistories",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LeadScoringRules",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Notes",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "OpportunityProducts",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Activities",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Deals",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Opportunities",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Campaigns",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "PipelineStages",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Pipelines",
                schema: "crm");

            migrationBuilder.DropIndex(
                name: "IX_Leads_CampaignId",
                schema: "CRM",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "CampaignId",
                schema: "CRM",
                table: "Leads");
        }
    }
}
