using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSQL_CRM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "crm");

            migrationBuilder.EnsureSchema(
                name: "CRM");

            migrationBuilder.CreateTable(
                name: "Campaigns",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BudgetedCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetedCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ActualCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ExpectedRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ExpectedRevenueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ActualRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualRevenueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ExpectedResponse = table.Column<int>(type: "integer", nullable: false),
                    ActualResponse = table.Column<int>(type: "integer", nullable: false),
                    NumberSent = table.Column<int>(type: "integer", nullable: false),
                    NumberDelivered = table.Column<int>(type: "integer", nullable: false),
                    NumberOpened = table.Column<int>(type: "integer", nullable: false),
                    NumberClicked = table.Column<int>(type: "integer", nullable: false),
                    NumberUnsubscribed = table.Column<int>(type: "integer", nullable: false),
                    NumberBounced = table.Column<int>(type: "integer", nullable: false),
                    TargetAudience = table.Column<string>(type: "text", nullable: true),
                    Objective = table.Column<string>(type: "text", nullable: true),
                    ParentCampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<int>(type: "integer", nullable: false),
                    EmailSubject = table.Column<string>(type: "text", nullable: true),
                    EmailBody = table.Column<string>(type: "text", nullable: true),
                    EmailTemplateId = table.Column<int>(type: "integer", nullable: true),
                    EmailFromAddress = table.Column<string>(type: "text", nullable: true),
                    EmailFromName = table.Column<string>(type: "text", nullable: true),
                    EmailReplyTo = table.Column<string>(type: "text", nullable: true),
                    LandingPageUrl = table.Column<string>(type: "text", nullable: true),
                    UtmSource = table.Column<string>(type: "text", nullable: true),
                    UtmMedium = table.Column<string>(type: "text", nullable: true),
                    UtmCampaign = table.Column<string>(type: "text", nullable: true),
                    UtmTerm = table.Column<string>(type: "text", nullable: true),
                    UtmContent = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Campaigns_ParentCampaignId",
                        column: x => x.ParentCampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                schema: "CRM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Industry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    NumberOfEmployees = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CustomerType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreditLimit = table.Column<decimal>(type: "numeric", nullable: false),
                    TaxId = table.Column<string>(type: "text", nullable: true),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    ContactPerson = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerSegments",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Criteria = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    MemberCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    StoragePath = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    StorageProvider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<string>(type: "text", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    ParentDocumentId = table.Column<int>(type: "integer", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AccessLevel = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    EncryptionKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Metadata = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeadScoringRules",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Field = table.Column<string>(type: "text", nullable: false),
                    Operator = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadScoringRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RelatedEntityId = table.Column<int>(type: "integer", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "text", nullable: true),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    Metadata = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pipelines",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pipelines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reminders",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    RemindAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RelatedEntityId = table.Column<int>(type: "integer", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "text", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SnoozedUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SendEmail = table.Column<bool>(type: "boolean", nullable: false),
                    SendPush = table.Column<bool>(type: "boolean", nullable: false),
                    SendInApp = table.Column<bool>(type: "boolean", nullable: false),
                    RecurrenceType = table.Column<int>(type: "integer", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "text", nullable: true),
                    RecurrenceEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AssignedToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MeetingStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MeetingEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Participants = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reminders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Workflows",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    TriggerType = table.Column<int>(type: "integer", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TriggerConditions = table.Column<string>(type: "text", maxLength: 4000, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ExecutionOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastExecutedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExecutionCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Leads",
                schema: "CRM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MobilePhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    JobTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Industry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Rating = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    NumberOfEmployees = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AssignedToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ConvertedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConvertedToCustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Score = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leads_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Contacts",
                schema: "CRM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MobilePhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    JobTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomerTags",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerTags_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerTags_Customers_CustomerId1",
                        column: x => x.CustomerId1,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CustomerSegmentMembers",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SegmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<int>(type: "integer", nullable: false),
                    CustomerId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerSegmentMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerSegmentMembers_CustomerSegments_SegmentId",
                        column: x => x.SegmentId,
                        principalSchema: "crm",
                        principalTable: "CustomerSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerSegmentMembers_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CustomerSegmentMembers_Customers_CustomerId1",
                        column: x => x.CustomerId1,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PipelineStages",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PipelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Probability = table.Column<decimal>(type: "numeric", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsWon = table.Column<bool>(type: "boolean", nullable: false),
                    IsLost = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true),
                    RottenDays = table.Column<int>(type: "integer", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
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
                name: "WorkflowExecutions",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkflowId = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<int>(type: "integer", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TriggeredBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggerData = table.Column<string>(type: "text", maxLength: 4000, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CurrentStepOrder = table.Column<int>(type: "integer", nullable: false),
                    TotalSteps = table.Column<int>(type: "integer", nullable: false),
                    CompletedSteps = table.Column<int>(type: "integer", nullable: false),
                    FailedSteps = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowExecutions_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "crm",
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowSteps",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkflowId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    ActionConfiguration = table.Column<string>(type: "text", maxLength: 4000, nullable: false),
                    Conditions = table.Column<string>(type: "text", maxLength: 4000, nullable: false),
                    DelayMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ContinueOnError = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowSteps_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "crm",
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadScoringHistories",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreviousScore = table.Column<int>(type: "integer", nullable: false),
                    NewScore = table.Column<int>(type: "integer", nullable: false),
                    RuleApplied = table.Column<string>(type: "text", nullable: true),
                    ScoreChange = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    ScoredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadScoringHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadScoringHistories_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deals",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    PipelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    StageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RecurringValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    RecurringCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    RecurringPeriod = table.Column<int>(type: "integer", nullable: true),
                    RecurringCycles = table.Column<int>(type: "integer", nullable: true),
                    Probability = table.Column<decimal>(type: "numeric", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualCloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    LostReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CompetitorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OwnerId = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Deal_Currency = table.Column<string>(type: "text", nullable: true),
                    RottenDays = table.Column<int>(type: "integer", nullable: true),
                    LastActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivitiesCount = table.Column<int>(type: "integer", nullable: false),
                    EmailsCount = table.Column<int>(type: "integer", nullable: false),
                    Labels = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    PipelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    StageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Probability = table.Column<decimal>(type: "numeric", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActualCloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    LostReason = table.Column<string>(type: "text", nullable: true),
                    CompetitorName = table.Column<string>(type: "text", nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ParentOpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    NextStep = table.Column<string>(type: "text", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CampaignId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
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
                name: "WorkflowStepExecutions",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkflowExecutionId = table.Column<int>(type: "integer", nullable: false),
                    WorkflowStepId = table.Column<int>(type: "integer", nullable: false),
                    StepName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InputData = table.Column<string>(type: "text", maxLength: 4000, nullable: false),
                    OutputData = table.Column<string>(type: "text", maxLength: 4000, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    RetryCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowStepExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowStepExecutions_WorkflowExecutions_WorkflowExecution~",
                        column: x => x.WorkflowExecutionId,
                        principalSchema: "crm",
                        principalTable: "WorkflowExecutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkflowStepExecutions_WorkflowSteps_WorkflowStepId",
                        column: x => x.WorkflowStepId,
                        principalSchema: "crm",
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DealProducts",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DealId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Tax = table.Column<decimal>(type: "numeric", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurringPeriod = table.Column<string>(type: "text", nullable: true),
                    RecurringCycles = table.Column<int>(type: "integer", nullable: true),
                    DealId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DealProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DealProducts_Deals_DealId",
                        column: x => x.DealId,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DealProducts_Deals_DealId1",
                        column: x => x.DealId1,
                        principalSchema: "crm",
                        principalTable: "Deals",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Duration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    DealId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<int>(type: "integer", nullable: false),
                    AssignedToId = table.Column<int>(type: "integer", nullable: true),
                    CallDirection = table.Column<string>(type: "text", nullable: true),
                    CallDuration = table.Column<string>(type: "text", nullable: true),
                    CallRecordingUrl = table.Column<string>(type: "text", nullable: true),
                    EmailFrom = table.Column<string>(type: "text", nullable: true),
                    EmailTo = table.Column<string>(type: "text", nullable: true),
                    EmailCc = table.Column<string>(type: "text", nullable: true),
                    EmailBcc = table.Column<string>(type: "text", nullable: true),
                    EmailSubject = table.Column<string>(type: "text", nullable: true),
                    EmailBody = table.Column<string>(type: "text", nullable: true),
                    EmailHasAttachments = table.Column<bool>(type: "boolean", nullable: true),
                    MeetingStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MeetingEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MeetingAttendees = table.Column<string>(type: "text", nullable: true),
                    MeetingAgenda = table.Column<string>(type: "text", nullable: true),
                    MeetingNotes = table.Column<string>(type: "text", nullable: true),
                    MeetingLink = table.Column<string>(type: "text", nullable: true),
                    TaskProgress = table.Column<decimal>(type: "numeric", nullable: true),
                    TaskOutcome = table.Column<string>(type: "text", nullable: true),
                    DealId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
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
                        name: "FK_Activities_Customers_CustomerId",
                        column: x => x.CustomerId,
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RespondedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FirstOpenDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastOpenDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OpenCount = table.Column<int>(type: "integer", nullable: false),
                    FirstClickDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastClickDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClickCount = table.Column<int>(type: "integer", nullable: false),
                    UnsubscribedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BouncedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BounceReason = table.Column<string>(type: "text", nullable: true),
                    HasConverted = table.Column<bool>(type: "boolean", nullable: false),
                    ConvertedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConvertedOpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "crm",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalSchema: "CRM",
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "CRM",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CampaignMembers_Opportunities_ConvertedOpportunityId",
                        column: x => x.ConvertedOpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OpportunityProducts",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    OpportunityId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
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
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsPinned = table.Column<bool>(type: "boolean", nullable: false),
                    IsPrivate = table.Column<bool>(type: "boolean", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpportunityId = table.Column<Guid>(type: "uuid", nullable: true),
                    DealId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedById = table.Column<int>(type: "integer", nullable: false),
                    LastModifiedById = table.Column<int>(type: "integer", nullable: true),
                    AttachmentUrls = table.Column<string>(type: "text", nullable: true),
                    DealId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
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
                        name: "FK_Notes_Contacts_ContactId",
                        column: x => x.ContactId,
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
                        name: "FK_Notes_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalSchema: "crm",
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ContactId",
                schema: "crm",
                table: "Activities",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_CustomerId",
                schema: "crm",
                table: "Activities",
                column: "CustomerId");

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
                name: "IX_Activities_OpportunityId",
                schema: "crm",
                table: "Activities",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_CampaignId",
                schema: "crm",
                table: "CampaignMembers",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_ContactId",
                schema: "crm",
                table: "CampaignMembers",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_ConvertedOpportunityId",
                schema: "crm",
                table: "CampaignMembers",
                column: "ConvertedOpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMembers_LeadId",
                schema: "crm",
                table: "CampaignMembers",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_ParentCampaignId",
                schema: "crm",
                table: "Campaigns",
                column: "ParentCampaignId");

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
                name: "IX_Contacts_CustomerId",
                schema: "CRM",
                table: "Contacts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId",
                schema: "CRM",
                table: "Contacts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_CustomerId",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_CustomerId_IsPrimary",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "CustomerId", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_Email",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "Email" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_IsActive",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId",
                schema: "CRM",
                table: "Customers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_CompanyName",
                schema: "CRM",
                table: "Customers",
                columns: new[] { "TenantId", "CompanyName" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_Email",
                schema: "CRM",
                table: "Customers",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_IsActive",
                schema: "CRM",
                table: "Customers",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_CustomerId",
                schema: "crm",
                table: "CustomerSegmentMembers",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_CustomerId1",
                schema: "crm",
                table: "CustomerSegmentMembers",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_SegmentId_CustomerId",
                schema: "crm",
                table: "CustomerSegmentMembers",
                columns: new[] { "SegmentId", "CustomerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_TenantId",
                schema: "crm",
                table: "CustomerSegmentMembers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_TenantId_CustomerId",
                schema: "crm",
                table: "CustomerSegmentMembers",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegmentMembers_TenantId_SegmentId",
                schema: "crm",
                table: "CustomerSegmentMembers",
                columns: new[] { "TenantId", "SegmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId",
                schema: "crm",
                table: "CustomerSegments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId_IsActive",
                schema: "crm",
                table: "CustomerSegments",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSegments_TenantId_Type",
                schema: "crm",
                table: "CustomerSegments",
                columns: new[] { "TenantId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_CustomerId_Tag",
                schema: "crm",
                table: "CustomerTags",
                columns: new[] { "CustomerId", "Tag" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_CustomerId1",
                schema: "crm",
                table: "CustomerTags",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_TenantId",
                schema: "crm",
                table: "CustomerTags",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_TenantId_CustomerId",
                schema: "crm",
                table: "CustomerTags",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_TenantId_Tag",
                schema: "crm",
                table: "CustomerTags",
                columns: new[] { "TenantId", "Tag" });

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
                name: "IX_Documents_Category",
                schema: "crm",
                table: "Documents",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Entity_Tenant",
                schema: "crm",
                table: "Documents",
                columns: new[] { "EntityId", "EntityType", "TenantId" });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_IsArchived",
                schema: "crm",
                table: "Documents",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ParentDocumentId",
                schema: "crm",
                table: "Documents",
                column: "ParentDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId",
                schema: "crm",
                table: "Documents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UploadedBy",
                schema: "crm",
                table: "Documents",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_CampaignId",
                schema: "CRM",
                table: "Leads",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId",
                schema: "CRM",
                table: "Leads",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_AssignedToUserId",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "AssignedToUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_ConvertedToCustomerId",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "ConvertedToCustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Email",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Rating",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Rating" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Score",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Score" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Status",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LeadScoringHistories_LeadId",
                schema: "crm",
                table: "LeadScoringHistories",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ActivityId",
                schema: "crm",
                table: "Notes",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ContactId",
                schema: "crm",
                table: "Notes",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_CustomerId",
                schema: "crm",
                table: "Notes",
                column: "CustomerId");

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

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Entity",
                schema: "crm",
                table: "WorkflowExecutions",
                columns: new[] { "EntityId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Status",
                schema: "crm",
                table: "WorkflowExecutions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Tenant_StartedAt",
                schema: "crm",
                table: "WorkflowExecutions",
                columns: new[] { "TenantId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Workflow_Status",
                schema: "crm",
                table: "WorkflowExecutions",
                columns: new[] { "WorkflowId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_EntityType_TriggerType",
                schema: "crm",
                table: "Workflows",
                columns: new[] { "EntityType", "TriggerType" });

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_IsActive",
                schema: "crm",
                table: "Workflows",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_Tenant_Active",
                schema: "crm",
                table: "Workflows",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepExecutions_Execution_Order",
                schema: "crm",
                table: "WorkflowStepExecutions",
                columns: new[] { "WorkflowExecutionId", "StepOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepExecutions_Status",
                schema: "crm",
                table: "WorkflowStepExecutions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepExecutions_WorkflowStepId",
                schema: "crm",
                table: "WorkflowStepExecutions",
                column: "WorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_IsEnabled",
                schema: "crm",
                table: "WorkflowSteps",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_Workflow_Order",
                schema: "crm",
                table: "WorkflowSteps",
                columns: new[] { "WorkflowId", "StepOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CampaignMembers",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "CustomerSegmentMembers",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "CustomerTags",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "DealProducts",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Documents",
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
                name: "Notifications",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "OpportunityProducts",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Reminders",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "WorkflowStepExecutions",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "CustomerSegments",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Activities",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "WorkflowExecutions",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "WorkflowSteps",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Deals",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Opportunities",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Workflows",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Contacts",
                schema: "CRM");

            migrationBuilder.DropTable(
                name: "Leads",
                schema: "CRM");

            migrationBuilder.DropTable(
                name: "PipelineStages",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Customers",
                schema: "CRM");

            migrationBuilder.DropTable(
                name: "Campaigns",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Pipelines",
                schema: "crm");
        }
    }
}
