using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixAccountNavigationProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "crm",
                table: "WorkflowSteps",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "crm",
                table: "WorkflowStepExecutions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContractId",
                schema: "crm",
                table: "Notes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "QuoteId",
                schema: "crm",
                table: "Notes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Accounts",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    AccountNumber = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Industry = table.Column<string>(type: "text", nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "numeric", nullable: true),
                    NumberOfEmployees = table.Column<int>(type: "integer", nullable: true),
                    Website = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Fax = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    BillingStreet = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingState = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingStreet = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ShippingCity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ShippingState = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ShippingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ShippingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ParentAccountId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    SicCode = table.Column<string>(type: "text", nullable: true),
                    TickerSymbol = table.Column<string>(type: "text", nullable: true),
                    Ownership = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Accounts_Accounts_ParentAccountId",
                        column: x => x.ParentAccountId,
                        principalSchema: "crm",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Competitors",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ThreatLevel = table.Column<int>(type: "integer", nullable: false),
                    Website = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Headquarters = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FoundedYear = table.Column<int>(type: "integer", nullable: true),
                    EmployeeCount = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AnnualRevenue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MarketShare = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TargetMarkets = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Industries = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    GeographicCoverage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CustomerSegments = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PricingStrategy = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PriceRange = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PriceComparison = table.Column<int>(type: "integer", nullable: true),
                    SalesChannels = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MarketingStrategy = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    KeyMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SocialMediaLinks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ContactPerson = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SwotSummary = table.Column<string>(type: "text", nullable: true),
                    CompetitiveStrategy = table.Column<string>(type: "text", nullable: true),
                    WinStrategy = table.Column<string>(type: "text", nullable: true),
                    LossReasons = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    LastAnalysisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AnalyzedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EncounterCount = table.Column<int>(type: "integer", nullable: false),
                    WinCount = table.Column<int>(type: "integer", nullable: false),
                    LossCount = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competitors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyPrograms",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ProgramType = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PointsPerSpend = table.Column<decimal>(type: "numeric(10,4)", precision: 10, scale: 4, nullable: false),
                    SpendUnit = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MinimumSpendForPoints = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxPointsPerTransaction = table.Column<int>(type: "integer", nullable: true),
                    PointValue = table.Column<decimal>(type: "numeric(10,4)", precision: 10, scale: 4, nullable: false),
                    MinimumRedemptionPoints = table.Column<int>(type: "integer", nullable: false),
                    MaxRedemptionPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PointsValidityMonths = table.Column<int>(type: "integer", nullable: true),
                    ResetPointsYearly = table.Column<bool>(type: "boolean", nullable: false),
                    BirthdayBonusPoints = table.Column<int>(type: "integer", nullable: true),
                    SignUpBonusPoints = table.Column<int>(type: "integer", nullable: true),
                    ReferralBonusPoints = table.Column<int>(type: "integer", nullable: true),
                    ReviewBonusPoints = table.Column<int>(type: "integer", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "text", nullable: true),
                    PrivacyPolicy = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyPrograms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MeetingType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsAllDay = table.Column<bool>(type: "boolean", nullable: false),
                    Timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ActualStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LocationType = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MeetingRoom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OnlineMeetingLink = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OnlineMeetingPlatform = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MeetingPassword = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DialInNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    DealId = table.Column<Guid>(type: "uuid", nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrganizerId = table.Column<int>(type: "integer", nullable: false),
                    OrganizerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OrganizerEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Agenda = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Outcome = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ActionItems = table.Column<string>(type: "text", nullable: true),
                    HasReminder = table.Column<bool>(type: "boolean", nullable: false),
                    ReminderMinutesBefore = table.Column<int>(type: "integer", nullable: true),
                    ReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ParentMeetingId = table.Column<Guid>(type: "uuid", nullable: true),
                    RecurrenceEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HasRecording = table.Column<bool>(type: "boolean", nullable: false),
                    RecordingUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Meetings_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Meetings_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Meetings_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Meetings_Deals_DealId",
                        column: x => x.DealId,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Meetings_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Meetings_Meetings_ParentMeetingId",
                        column: x => x.ParentMeetingId,
                        principalSchema: "crm",
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Meetings_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProductInterests",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InterestLevel = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProductCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InterestedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EstimatedBudget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    QuotedPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    InterestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedPurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastInteractionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InterestReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Requirements = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CompetitorProducts = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    NotPurchasedReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    InterestScore = table.Column<int>(type: "integer", nullable: false),
                    PurchaseProbability = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    PromoCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductInterests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductInterests_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductInterests_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductInterests_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductInterests_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductInterests_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Referrals",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferralCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReferralType = table.Column<int>(type: "integer", nullable: false),
                    ReferrerCustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferrerContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferrerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ReferrerEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReferrerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferredCustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferredLeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferredName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ReferredEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReferredPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferredCompany = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ReferralDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ContactedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConversionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReferrerReward = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ReferredReward = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    RewardType = table.Column<int>(type: "integer", nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RewardPaid = table.Column<bool>(type: "boolean", nullable: false),
                    RewardPaidDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProgramName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    DealId = table.Column<Guid>(type: "uuid", nullable: true),
                    TotalSalesAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ConversionValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ReferralMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AssignedToUserId = table.Column<int>(type: "integer", nullable: true),
                    FollowUpCount = table.Column<int>(type: "integer", nullable: false),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referrals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Referrals_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referrals_Contacts_ReferrerContactId",
                        column: x => x.ReferrerContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referrals_Customers_ReferredCustomerId",
                        column: x => x.ReferredCustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referrals_Customers_ReferrerCustomerId",
                        column: x => x.ReferrerCustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referrals_Deals_DealId",
                        column: x => x.DealId,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referrals_Leads_ReferredLeadId",
                        column: x => x.ReferredLeadId,
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referrals_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SocialMediaProfiles",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Platform = table.Column<int>(type: "integer", nullable: false),
                    ProfileUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ProfileId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    DisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Bio = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ProfileImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CoverImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Website = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FollowersCount = table.Column<int>(type: "integer", nullable: true),
                    FollowingCount = table.Column<int>(type: "integer", nullable: true),
                    PostsCount = table.Column<int>(type: "integer", nullable: true),
                    LikesCount = table.Column<int>(type: "integer", nullable: true),
                    StatsUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EngagementRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    AverageLikesPerPost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    AverageCommentsPerPost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    AverageSharesPerPost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    InfluencerLevel = table.Column<int>(type: "integer", nullable: true),
                    InfluenceScore = table.Column<int>(type: "integer", nullable: true),
                    TargetAudience = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ContentCategories = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LastInteractionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastInteractionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TotalInteractionsCount = table.Column<int>(type: "integer", nullable: false),
                    FollowsOurBrand = table.Column<bool>(type: "boolean", nullable: false),
                    MentionedOurBrand = table.Column<bool>(type: "boolean", nullable: false),
                    LastBrandMentionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HasActiveCampaign = table.Column<bool>(type: "boolean", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    CollaborationStatus = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialMediaProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SocialMediaProfiles_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SocialMediaProfiles_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SocialMediaProfiles_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SocialMediaProfiles_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Contract",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractNumber = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ContractValue = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    PaymentFrequency = table.Column<string>(type: "text", nullable: true),
                    BillingFrequency = table.Column<string>(type: "text", nullable: true),
                    RenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsAutoRenewal = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalTermMonths = table.Column<int>(type: "integer", nullable: true),
                    NoticePeriodDays = table.Column<int>(type: "integer", nullable: false),
                    SignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SignedByName = table.Column<string>(type: "text", nullable: true),
                    SignedByTitle = table.Column<string>(type: "text", nullable: true),
                    CompanySignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompanySignedById = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SpecialTerms = table.Column<string>(type: "text", nullable: true),
                    CancellationTerms = table.Column<string>(type: "text", nullable: true),
                    CurrencyCode = table.Column<string>(type: "text", nullable: false),
                    BillingStreet = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingState = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contract", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contract_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "crm",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contract_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Contract_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Quote",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuoteNumber = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    PriceListId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuoteDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SubTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    ShippingAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    CurrencyCode = table.Column<string>(type: "text", nullable: false),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    DeliveryTerms = table.Column<string>(type: "text", nullable: true),
                    BillingStreet = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingState = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingStreet = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ShippingCity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ShippingState = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ShippingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ShippingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "text", nullable: true),
                    ApprovalStatus = table.Column<int>(type: "integer", nullable: false),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AcceptedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quote_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "crm",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quote_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Quote_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Ticket",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketNumber = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    RequesterEmail = table.Column<string>(type: "text", nullable: false),
                    RequesterName = table.Column<string>(type: "text", nullable: false),
                    AssignedToId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: true),
                    SubCategory = table.Column<string>(type: "text", nullable: true),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    SlaId = table.Column<Guid>(type: "uuid", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FirstResponseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReopenedCount = table.Column<int>(type: "integer", nullable: false),
                    EscalationLevel = table.Column<int>(type: "integer", nullable: false),
                    IsEscalated = table.Column<bool>(type: "boolean", nullable: false),
                    Resolution = table.Column<string>(type: "text", nullable: true),
                    SatisfactionRating = table.Column<int>(type: "integer", nullable: true),
                    SatisfactionComment = table.Column<string>(type: "text", nullable: true),
                    Source = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ticket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ticket_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "crm",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ticket_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CompetitorProducts",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetitorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PriceRange = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Features = table.Column<string>(type: "text", nullable: true),
                    Differentiators = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OurAdvantage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OurDisadvantage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsDirectCompetitor = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitorProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitorProducts_Competitors_CompetitorId",
                        column: x => x.CompetitorId,
                        principalSchema: "crm",
                        principalTable: "Competitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitorStrengths",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetitorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    ImpactLevel = table.Column<int>(type: "integer", nullable: false),
                    CounterStrategy = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitorStrengths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitorStrengths_Competitors_CompetitorId",
                        column: x => x.CompetitorId,
                        principalSchema: "crm",
                        principalTable: "Competitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitorWeaknesses",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetitorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    OpportunityLevel = table.Column<int>(type: "integer", nullable: false),
                    ExploitStrategy = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitorWeaknesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitorWeaknesses_Competitors_CompetitorId",
                        column: x => x.CompetitorId,
                        principalSchema: "crm",
                        principalTable: "Competitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyRewards",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LoyaltyProgramId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    PointsCost = table.Column<int>(type: "integer", nullable: false),
                    RewardType = table.Column<int>(type: "integer", nullable: false),
                    DiscountValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ProductId = table.Column<int>(type: "integer", nullable: true),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    StockQuantity = table.Column<int>(type: "integer", nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Terms = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    RedemptionCount = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyRewards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyRewards_LoyaltyPrograms_LoyaltyProgramId",
                        column: x => x.LoyaltyProgramId,
                        principalSchema: "crm",
                        principalTable: "LoyaltyPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyTiers",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LoyaltyProgramId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    MinimumPoints = table.Column<int>(type: "integer", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    BonusPointsMultiplier = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Benefits = table.Column<string>(type: "text", nullable: true),
                    IconUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyTiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyTiers_LoyaltyPrograms_LoyaltyProgramId",
                        column: x => x.LoyaltyProgramId,
                        principalSchema: "crm",
                        principalTable: "LoyaltyPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MeetingAttendees",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Response = table.Column<int>(type: "integer", nullable: false),
                    ResponseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResponseNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsOrganizer = table.Column<bool>(type: "boolean", nullable: false),
                    Attended = table.Column<bool>(type: "boolean", nullable: false),
                    CheckInTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingAttendees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MeetingAttendees_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MeetingAttendees_Meetings_MeetingId",
                        column: x => x.MeetingId,
                        principalSchema: "crm",
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractLineItem",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractLineItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractLineItem_Contract_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "crm",
                        principalTable: "Contract",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QuoteLineItem",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Discount = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    QuoteId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteLineItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuoteLineItem_Quote_QuoteId",
                        column: x => x.QuoteId,
                        principalSchema: "crm",
                        principalTable: "Quote",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CallLogs",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CallNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    CallType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    WaitTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    RingTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    CallerNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CalledNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Extension = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ForwardedTo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: true),
                    AgentUserId = table.Column<int>(type: "integer", nullable: true),
                    AgentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    QueueName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Outcome = table.Column<int>(type: "integer", nullable: true),
                    OutcomeDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FollowUpRequired = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FollowUpNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    HasRecording = table.Column<bool>(type: "boolean", nullable: false),
                    RecordingUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RecordingFileSize = table.Column<long>(type: "bigint", nullable: true),
                    Transcript = table.Column<string>(type: "text", nullable: true),
                    QualityScore = table.Column<int>(type: "integer", nullable: true),
                    CustomerSatisfaction = table.Column<int>(type: "integer", nullable: true),
                    QualityNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Summary = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ExternalCallId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PbxType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CallLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CallLogs_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CallLogs_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CallLogs_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CallLogs_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CallLogs_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CallLogs_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "crm",
                        principalTable: "Ticket",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SurveyResponses",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyType = table.Column<int>(type: "integer", nullable: false),
                    SurveyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    RespondentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RespondentEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    RespondentPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsAnonymous = table.Column<bool>(type: "boolean", nullable: false),
                    NpsScore = table.Column<int>(type: "integer", nullable: true),
                    NpsCategory = table.Column<int>(type: "integer", nullable: true),
                    CsatScore = table.Column<int>(type: "integer", nullable: true),
                    CesScore = table.Column<int>(type: "integer", nullable: true),
                    OverallSatisfaction = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: true),
                    WouldRecommend = table.Column<bool>(type: "boolean", nullable: true),
                    WouldRepurchase = table.Column<bool>(type: "boolean", nullable: true),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletionTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    OverallComment = table.Column<string>(type: "text", nullable: true),
                    ImprovementSuggestion = table.Column<string>(type: "text", nullable: true),
                    Praise = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Complaint = table.Column<string>(type: "text", nullable: true),
                    FollowUpRequired = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpDone = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FollowUpNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AssignedToUserId = table.Column<int>(type: "integer", nullable: true),
                    Source = table.Column<int>(type: "integer", nullable: false),
                    DeviceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "crm",
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "crm",
                        principalTable: "Ticket",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TicketAttachment",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketAttachment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketAttachment_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "crm",
                        principalTable: "Ticket",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TicketComment",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketComment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketComment_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "crm",
                        principalTable: "Ticket",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyMemberships",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LoyaltyProgramId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    MembershipNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CurrentTierId = table.Column<Guid>(type: "uuid", nullable: true),
                    TotalPointsEarned = table.Column<int>(type: "integer", nullable: false),
                    TotalPointsRedeemed = table.Column<int>(type: "integer", nullable: false),
                    CurrentPoints = table.Column<int>(type: "integer", nullable: false),
                    LifetimePoints = table.Column<int>(type: "integer", nullable: false),
                    EnrollmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PointsExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyMemberships_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "crm",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LoyaltyMemberships_LoyaltyPrograms_LoyaltyProgramId",
                        column: x => x.LoyaltyProgramId,
                        principalSchema: "crm",
                        principalTable: "LoyaltyPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoyaltyMemberships_LoyaltyTiers_CurrentTierId",
                        column: x => x.CurrentTierId,
                        principalSchema: "crm",
                        principalTable: "LoyaltyTiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SurveyAnswers",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyResponseId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Question = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Answer = table.Column<string>(type: "text", nullable: true),
                    Score = table.Column<int>(type: "integer", nullable: true),
                    AnswerType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyAnswers_SurveyResponses_SurveyResponseId",
                        column: x => x.SurveyResponseId,
                        principalSchema: "crm",
                        principalTable: "SurveyResponses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyTransactions",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LoyaltyMembershipId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionType = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    BalanceAfter = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    RewardId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyTransactions_LoyaltyMemberships_LoyaltyMembershipId",
                        column: x => x.LoyaltyMembershipId,
                        principalSchema: "crm",
                        principalTable: "LoyaltyMemberships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesTeamMembers",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesTeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    UserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    JoinedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LeftDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IndividualTarget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CommissionRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTeamMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesTeams",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TeamLeaderId = table.Column<int>(type: "integer", nullable: true),
                    TeamLeaderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ParentTeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    SalesTarget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TargetPeriod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TerritoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    TerritoryNames = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TeamEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CommunicationChannel = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTeams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesTeams_SalesTeams_ParentTeamId",
                        column: x => x.ParentTeamId,
                        principalSchema: "crm",
                        principalTable: "SalesTeams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Territories",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TerritoryType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentTerritoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    HierarchyLevel = table.Column<int>(type: "integer", nullable: false),
                    HierarchyPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Region = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCodeRange = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    GeoCoordinates = table.Column<string>(type: "text", nullable: true),
                    SalesTarget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TargetYear = table.Column<int>(type: "integer", nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PotentialValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AssignedSalesTeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    PrimarySalesRepId = table.Column<int>(type: "integer", nullable: true),
                    PrimarySalesRepName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerCount = table.Column<int>(type: "integer", nullable: false),
                    OpportunityCount = table.Column<int>(type: "integer", nullable: false),
                    TotalSales = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    StatsUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Territories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Territories_SalesTeams_AssignedSalesTeamId",
                        column: x => x.AssignedSalesTeamId,
                        principalSchema: "crm",
                        principalTable: "SalesTeams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Territories_Territories_ParentTerritoryId",
                        column: x => x.ParentTerritoryId,
                        principalSchema: "crm",
                        principalTable: "Territories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TerritoryAssignments",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TerritoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    UserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AssignmentType = table.Column<int>(type: "integer", nullable: false),
                    ResponsibilityPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TerritoryAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TerritoryAssignments_Territories_TerritoryId",
                        column: x => x.TerritoryId,
                        principalSchema: "crm",
                        principalTable: "Territories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ContractId",
                schema: "crm",
                table: "Notes",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_QuoteId",
                schema: "crm",
                table: "Notes",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_ParentAccountId",
                schema: "crm",
                table: "Accounts",
                column: "ParentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_CampaignId",
                schema: "crm",
                table: "CallLogs",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_ContactId",
                schema: "crm",
                table: "CallLogs",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_CustomerId",
                schema: "crm",
                table: "CallLogs",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_LeadId",
                schema: "crm",
                table: "CallLogs",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_OpportunityId",
                schema: "crm",
                table: "CallLogs",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId",
                schema: "crm",
                table: "CallLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId_AgentUserId",
                schema: "crm",
                table: "CallLogs",
                columns: new[] { "TenantId", "AgentUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId_CallNumber",
                schema: "crm",
                table: "CallLogs",
                columns: new[] { "TenantId", "CallNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId_CustomerId",
                schema: "crm",
                table: "CallLogs",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId_Direction",
                schema: "crm",
                table: "CallLogs",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId_StartTime",
                schema: "crm",
                table: "CallLogs",
                columns: new[] { "TenantId", "StartTime" });

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TenantId_Status",
                schema: "crm",
                table: "CallLogs",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_TicketId",
                schema: "crm",
                table: "CallLogs",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorProducts_CompetitorId_ProductName",
                schema: "crm",
                table: "CompetitorProducts",
                columns: new[] { "CompetitorId", "ProductName" });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorProducts_TenantId",
                schema: "crm",
                table: "CompetitorProducts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitors_TenantId",
                schema: "crm",
                table: "Competitors",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitors_TenantId_IsActive",
                schema: "crm",
                table: "Competitors",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Competitors_TenantId_Name",
                schema: "crm",
                table: "Competitors",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Competitors_TenantId_ThreatLevel",
                schema: "crm",
                table: "Competitors",
                columns: new[] { "TenantId", "ThreatLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorStrengths_CompetitorId",
                schema: "crm",
                table: "CompetitorStrengths",
                column: "CompetitorId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorStrengths_TenantId",
                schema: "crm",
                table: "CompetitorStrengths",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorWeaknesses_CompetitorId",
                schema: "crm",
                table: "CompetitorWeaknesses",
                column: "CompetitorId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorWeaknesses_TenantId",
                schema: "crm",
                table: "CompetitorWeaknesses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Contract_AccountId",
                schema: "crm",
                table: "Contract",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Contract_ContactId",
                schema: "crm",
                table: "Contract",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Contract_OpportunityId",
                schema: "crm",
                table: "Contract",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractLineItem_ContractId",
                schema: "crm",
                table: "ContractLineItem",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyMemberships_CurrentTierId",
                schema: "crm",
                table: "LoyaltyMemberships",
                column: "CurrentTierId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyMemberships_CustomerId",
                schema: "crm",
                table: "LoyaltyMemberships",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyMemberships_LoyaltyProgramId_IsActive",
                schema: "crm",
                table: "LoyaltyMemberships",
                columns: new[] { "LoyaltyProgramId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyMemberships_TenantId",
                schema: "crm",
                table: "LoyaltyMemberships",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyMemberships_TenantId_CustomerId",
                schema: "crm",
                table: "LoyaltyMemberships",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyMemberships_TenantId_MembershipNumber",
                schema: "crm",
                table: "LoyaltyMemberships",
                columns: new[] { "TenantId", "MembershipNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPrograms_TenantId",
                schema: "crm",
                table: "LoyaltyPrograms",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPrograms_TenantId_Code",
                schema: "crm",
                table: "LoyaltyPrograms",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPrograms_TenantId_IsActive",
                schema: "crm",
                table: "LoyaltyPrograms",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyRewards_LoyaltyProgramId_IsActive",
                schema: "crm",
                table: "LoyaltyRewards",
                columns: new[] { "LoyaltyProgramId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyRewards_LoyaltyProgramId_RewardType",
                schema: "crm",
                table: "LoyaltyRewards",
                columns: new[] { "LoyaltyProgramId", "RewardType" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyRewards_TenantId",
                schema: "crm",
                table: "LoyaltyRewards",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyTiers_LoyaltyProgramId_Order",
                schema: "crm",
                table: "LoyaltyTiers",
                columns: new[] { "LoyaltyProgramId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyTiers_TenantId",
                schema: "crm",
                table: "LoyaltyTiers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyTransactions_LoyaltyMembershipId_TransactionDate",
                schema: "crm",
                table: "LoyaltyTransactions",
                columns: new[] { "LoyaltyMembershipId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyTransactions_LoyaltyMembershipId_TransactionType",
                schema: "crm",
                table: "LoyaltyTransactions",
                columns: new[] { "LoyaltyMembershipId", "TransactionType" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyTransactions_TenantId",
                schema: "crm",
                table: "LoyaltyTransactions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingAttendees_ContactId",
                schema: "crm",
                table: "MeetingAttendees",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingAttendees_MeetingId_Email",
                schema: "crm",
                table: "MeetingAttendees",
                columns: new[] { "MeetingId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MeetingAttendees_TenantId",
                schema: "crm",
                table: "MeetingAttendees",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_CampaignId",
                schema: "crm",
                table: "Meetings",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_ContactId",
                schema: "crm",
                table: "Meetings",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_CustomerId",
                schema: "crm",
                table: "Meetings",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_DealId",
                schema: "crm",
                table: "Meetings",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_LeadId",
                schema: "crm",
                table: "Meetings",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_OpportunityId",
                schema: "crm",
                table: "Meetings",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_ParentMeetingId",
                schema: "crm",
                table: "Meetings",
                column: "ParentMeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_TenantId",
                schema: "crm",
                table: "Meetings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_TenantId_CustomerId",
                schema: "crm",
                table: "Meetings",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_TenantId_OrganizerId",
                schema: "crm",
                table: "Meetings",
                columns: new[] { "TenantId", "OrganizerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_TenantId_StartTime",
                schema: "crm",
                table: "Meetings",
                columns: new[] { "TenantId", "StartTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_TenantId_Status",
                schema: "crm",
                table: "Meetings",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_CampaignId",
                schema: "crm",
                table: "ProductInterests",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_ContactId",
                schema: "crm",
                table: "ProductInterests",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_CustomerId",
                schema: "crm",
                table: "ProductInterests",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_LeadId",
                schema: "crm",
                table: "ProductInterests",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_OpportunityId",
                schema: "crm",
                table: "ProductInterests",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId",
                schema: "crm",
                table: "ProductInterests",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId_CustomerId",
                schema: "crm",
                table: "ProductInterests",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId_InterestDate",
                schema: "crm",
                table: "ProductInterests",
                columns: new[] { "TenantId", "InterestDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId_InterestLevel",
                schema: "crm",
                table: "ProductInterests",
                columns: new[] { "TenantId", "InterestLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId_LeadId",
                schema: "crm",
                table: "ProductInterests",
                columns: new[] { "TenantId", "LeadId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId_ProductId",
                schema: "crm",
                table: "ProductInterests",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductInterests_TenantId_Status",
                schema: "crm",
                table: "ProductInterests",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Quote_AccountId",
                schema: "crm",
                table: "Quote",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Quote_ContactId",
                schema: "crm",
                table: "Quote",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Quote_OpportunityId",
                schema: "crm",
                table: "Quote",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_QuoteLineItem_QuoteId",
                schema: "crm",
                table: "QuoteLineItem",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_CampaignId",
                schema: "crm",
                table: "Referrals",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_DealId",
                schema: "crm",
                table: "Referrals",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_OpportunityId",
                schema: "crm",
                table: "Referrals",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_ReferredCustomerId",
                schema: "crm",
                table: "Referrals",
                column: "ReferredCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_ReferredLeadId",
                schema: "crm",
                table: "Referrals",
                column: "ReferredLeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_ReferrerContactId",
                schema: "crm",
                table: "Referrals",
                column: "ReferrerContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_ReferrerCustomerId",
                schema: "crm",
                table: "Referrals",
                column: "ReferrerCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId",
                schema: "crm",
                table: "Referrals",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_ReferralCode",
                schema: "crm",
                table: "Referrals",
                columns: new[] { "TenantId", "ReferralCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_ReferralDate",
                schema: "crm",
                table: "Referrals",
                columns: new[] { "TenantId", "ReferralDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_ReferredCustomerId",
                schema: "crm",
                table: "Referrals",
                columns: new[] { "TenantId", "ReferredCustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_ReferrerCustomerId",
                schema: "crm",
                table: "Referrals",
                columns: new[] { "TenantId", "ReferrerCustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_Status",
                schema: "crm",
                table: "Referrals",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeamMembers_SalesTeamId_UserId_IsActive",
                schema: "crm",
                table: "SalesTeamMembers",
                columns: new[] { "SalesTeamId", "UserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeamMembers_TenantId",
                schema: "crm",
                table: "SalesTeamMembers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeams_ParentTeamId",
                schema: "crm",
                table: "SalesTeams",
                column: "ParentTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeams_TenantId",
                schema: "crm",
                table: "SalesTeams",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeams_TenantId_Code",
                schema: "crm",
                table: "SalesTeams",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeams_TenantId_IsActive",
                schema: "crm",
                table: "SalesTeams",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeams_TenantId_TeamLeaderId",
                schema: "crm",
                table: "SalesTeams",
                columns: new[] { "TenantId", "TeamLeaderId" });

            migrationBuilder.CreateIndex(
                name: "IX_SalesTeams_TerritoryId",
                schema: "crm",
                table: "SalesTeams",
                column: "TerritoryId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_CampaignId",
                schema: "crm",
                table: "SocialMediaProfiles",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_ContactId",
                schema: "crm",
                table: "SocialMediaProfiles",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_CustomerId",
                schema: "crm",
                table: "SocialMediaProfiles",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_LeadId",
                schema: "crm",
                table: "SocialMediaProfiles",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_TenantId",
                schema: "crm",
                table: "SocialMediaProfiles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_TenantId_CustomerId",
                schema: "crm",
                table: "SocialMediaProfiles",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_TenantId_FollowsOurBrand",
                schema: "crm",
                table: "SocialMediaProfiles",
                columns: new[] { "TenantId", "FollowsOurBrand" });

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_TenantId_InfluencerLevel",
                schema: "crm",
                table: "SocialMediaProfiles",
                columns: new[] { "TenantId", "InfluencerLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_TenantId_IsActive",
                schema: "crm",
                table: "SocialMediaProfiles",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_SocialMediaProfiles_TenantId_Platform",
                schema: "crm",
                table: "SocialMediaProfiles",
                columns: new[] { "TenantId", "Platform" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyAnswers_SurveyResponseId_QuestionId",
                schema: "crm",
                table: "SurveyAnswers",
                columns: new[] { "SurveyResponseId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyAnswers_TenantId",
                schema: "crm",
                table: "SurveyAnswers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_CampaignId",
                schema: "crm",
                table: "SurveyResponses",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_ContactId",
                schema: "crm",
                table: "SurveyResponses",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_CustomerId",
                schema: "crm",
                table: "SurveyResponses",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_LeadId",
                schema: "crm",
                table: "SurveyResponses",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId",
                schema: "crm",
                table: "SurveyResponses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId_CompletedDate",
                schema: "crm",
                table: "SurveyResponses",
                columns: new[] { "TenantId", "CompletedDate" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId_CustomerId",
                schema: "crm",
                table: "SurveyResponses",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId_FollowUpRequired",
                schema: "crm",
                table: "SurveyResponses",
                columns: new[] { "TenantId", "FollowUpRequired" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId_NpsCategory",
                schema: "crm",
                table: "SurveyResponses",
                columns: new[] { "TenantId", "NpsCategory" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId_Status",
                schema: "crm",
                table: "SurveyResponses",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TenantId_SurveyType",
                schema: "crm",
                table: "SurveyResponses",
                columns: new[] { "TenantId", "SurveyType" });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_TicketId",
                schema: "crm",
                table: "SurveyResponses",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_Territories_AssignedSalesTeamId",
                schema: "crm",
                table: "Territories",
                column: "AssignedSalesTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Territories_ParentTerritoryId",
                schema: "crm",
                table: "Territories",
                column: "ParentTerritoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId",
                schema: "crm",
                table: "Territories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_Code",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_IsActive",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_ParentTerritoryId",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "ParentTerritoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Territories_TenantId_TerritoryType",
                schema: "crm",
                table: "Territories",
                columns: new[] { "TenantId", "TerritoryType" });

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_TenantId",
                schema: "crm",
                table: "TerritoryAssignments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TerritoryAssignments_TerritoryId_UserId_IsActive",
                schema: "crm",
                table: "TerritoryAssignments",
                columns: new[] { "TerritoryId", "UserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_AccountId",
                schema: "crm",
                table: "Ticket",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_ContactId",
                schema: "crm",
                table: "Ticket",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachment_TicketId",
                schema: "crm",
                table: "TicketAttachment",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketComment_TicketId",
                schema: "crm",
                table: "TicketComment",
                column: "TicketId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Contract_ContractId",
                schema: "crm",
                table: "Notes",
                column: "ContractId",
                principalSchema: "crm",
                principalTable: "Contract",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Quote_QuoteId",
                schema: "crm",
                table: "Notes",
                column: "QuoteId",
                principalSchema: "crm",
                principalTable: "Quote",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesTeamMembers_SalesTeams_SalesTeamId",
                schema: "crm",
                table: "SalesTeamMembers",
                column: "SalesTeamId",
                principalSchema: "crm",
                principalTable: "SalesTeams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesTeams_Territories_TerritoryId",
                schema: "crm",
                table: "SalesTeams",
                column: "TerritoryId",
                principalSchema: "crm",
                principalTable: "Territories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Contract_ContractId",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Quote_QuoteId",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Territories_SalesTeams_AssignedSalesTeamId",
                schema: "crm",
                table: "Territories");

            migrationBuilder.DropTable(
                name: "CallLogs",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "CompetitorProducts",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "CompetitorStrengths",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "CompetitorWeaknesses",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "ContractLineItem",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LoyaltyRewards",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LoyaltyTransactions",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "MeetingAttendees",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "ProductInterests",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "QuoteLineItem",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Referrals",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "SalesTeamMembers",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "SocialMediaProfiles",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "SurveyAnswers",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "TerritoryAssignments",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "TicketAttachment",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "TicketComment",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Competitors",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Contract",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LoyaltyMemberships",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Meetings",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Quote",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "SurveyResponses",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LoyaltyTiers",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Ticket",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LoyaltyPrograms",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Accounts",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "SalesTeams",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Territories",
                schema: "crm");

            migrationBuilder.DropIndex(
                name: "IX_Notes_ContractId",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_QuoteId",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "crm",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "crm",
                table: "WorkflowStepExecutions");

            migrationBuilder.DropColumn(
                name: "ContractId",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "QuoteId",
                schema: "crm",
                table: "Notes");
        }
    }
}
