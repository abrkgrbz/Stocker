using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Stocker.Modules.HR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNewHREntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CareerPaths",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    PathName = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CareerTrack = table.Column<int>(type: "integer", nullable: false),
                    CurrentPositionId = table.Column<int>(type: "integer", nullable: false),
                    CurrentLevel = table.Column<int>(type: "integer", nullable: false),
                    CurrentPositionStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetPositionId = table.Column<int>(type: "integer", nullable: true),
                    TargetPositionName = table.Column<string>(type: "text", nullable: true),
                    TargetLevel = table.Column<int>(type: "integer", nullable: true),
                    ExpectedTargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TargetTimelineMonths = table.Column<int>(type: "integer", nullable: true),
                    ProgressPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    ReadinessScore = table.Column<int>(type: "integer", nullable: true),
                    ReadyForPromotion = table.Column<bool>(type: "boolean", nullable: false),
                    LastAssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DevelopmentAreas = table.Column<string>(type: "text", nullable: true),
                    RequiredCompetencies = table.Column<string>(type: "text", nullable: true),
                    RequiredCertifications = table.Column<string>(type: "text", nullable: true),
                    RequiredTraining = table.Column<string>(type: "text", nullable: true),
                    RequiredExperienceYears = table.Column<int>(type: "integer", nullable: true),
                    MentorId = table.Column<int>(type: "integer", nullable: true),
                    MentorAssignmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MentorshipNotes = table.Column<string>(type: "text", nullable: true),
                    ManagerAssessment = table.Column<string>(type: "text", nullable: true),
                    ManagerRecommendation = table.Column<int>(type: "integer", nullable: true),
                    LastManagerMeetingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextReviewDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_CareerPaths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareerPaths_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CareerPaths_Employees_MentorId",
                        column: x => x.MentorId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CareerPaths_Positions_CurrentPositionId",
                        column: x => x.CurrentPositionId,
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CareerPaths_Positions_TargetPositionId",
                        column: x => x.TargetPositionId,
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Certifications",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    CertificationName = table.Column<string>(type: "text", nullable: false),
                    CertificationType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IssuingAuthority = table.Column<string>(type: "text", nullable: false),
                    IssuingCountry = table.Column<string>(type: "text", nullable: true),
                    AccreditationBody = table.Column<string>(type: "text", nullable: true),
                    CertificationNumber = table.Column<string>(type: "text", nullable: true),
                    CredentialId = table.Column<string>(type: "text", nullable: true),
                    VerificationUrl = table.Column<string>(type: "text", nullable: true),
                    CertificationLevel = table.Column<string>(type: "text", nullable: true),
                    Specialization = table.Column<string>(type: "text", nullable: true),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastRenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextRenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrainingRequired = table.Column<bool>(type: "boolean", nullable: false),
                    TotalTrainingHours = table.Column<int>(type: "integer", nullable: true),
                    CompletedTrainingHours = table.Column<int>(type: "integer", nullable: true),
                    TrainingProvider = table.Column<string>(type: "text", nullable: true),
                    TrainingCompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExamRequired = table.Column<bool>(type: "boolean", nullable: false),
                    ExamDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExamScore = table.Column<decimal>(type: "numeric", nullable: true),
                    PassingScore = table.Column<decimal>(type: "numeric", nullable: true),
                    AttemptNumber = table.Column<int>(type: "integer", nullable: false),
                    CertificationCost = table.Column<decimal>(type: "numeric", nullable: true),
                    RenewalCost = table.Column<decimal>(type: "numeric", nullable: true),
                    CompanySponsored = table.Column<bool>(type: "boolean", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    CpeRequired = table.Column<bool>(type: "boolean", nullable: false),
                    RequiredCpeUnits = table.Column<int>(type: "integer", nullable: true),
                    EarnedCpeUnits = table.Column<int>(type: "integer", nullable: true),
                    CpePeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CpePeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CertificateFileUrl = table.Column<string>(type: "text", nullable: true),
                    BadgeUrl = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RequiredForJob = table.Column<bool>(type: "boolean", nullable: false),
                    ReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    ReminderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_Certifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certifications_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DisciplinaryActions",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    ActionCode = table.Column<string>(type: "text", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SeverityLevel = table.Column<int>(type: "integer", nullable: false),
                    IncidentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IncidentLocation = table.Column<string>(type: "text", nullable: true),
                    IncidentDescription = table.Column<string>(type: "text", nullable: false),
                    ViolatedPolicy = table.Column<string>(type: "text", nullable: true),
                    Witnesses = table.Column<string>(type: "text", nullable: true),
                    Evidence = table.Column<string>(type: "text", nullable: true),
                    InvestigationStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvestigationEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvestigatorId = table.Column<int>(type: "integer", nullable: true),
                    InvestigationNotes = table.Column<string>(type: "text", nullable: true),
                    InvestigationFindings = table.Column<string>(type: "text", nullable: true),
                    DefenseRequested = table.Column<bool>(type: "boolean", nullable: false),
                    DefenseDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DefenseReceived = table.Column<bool>(type: "boolean", nullable: false),
                    DefenseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DefenseText = table.Column<string>(type: "text", nullable: true),
                    DecisionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DecisionMakerId = table.Column<int>(type: "integer", nullable: true),
                    Decision = table.Column<string>(type: "text", nullable: true),
                    DecisionRationale = table.Column<string>(type: "text", nullable: true),
                    AppliedSanction = table.Column<int>(type: "integer", nullable: true),
                    SanctionDetails = table.Column<string>(type: "text", nullable: true),
                    SanctionStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SanctionEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SanctionDurationDays = table.Column<int>(type: "integer", nullable: true),
                    SalaryDeductionAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    FollowUpRequired = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FollowUpNotes = table.Column<string>(type: "text", nullable: true),
                    HasPerformanceImprovementPlan = table.Column<bool>(type: "boolean", nullable: false),
                    PerformanceImprovementPlanId = table.Column<int>(type: "integer", nullable: true),
                    WasAppealed = table.Column<bool>(type: "boolean", nullable: false),
                    AppealDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AppealOutcome = table.Column<int>(type: "integer", nullable: true),
                    AppealNotes = table.Column<string>(type: "text", nullable: true),
                    ReportedById = table.Column<int>(type: "integer", nullable: true),
                    HrRepresentativeId = table.Column<int>(type: "integer", nullable: true),
                    IsConfidential = table.Column<bool>(type: "boolean", nullable: false),
                    PreviousWarningsCount = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_DisciplinaryActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DisciplinaryActions_Employees_DecisionMakerId",
                        column: x => x.DecisionMakerId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DisciplinaryActions_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DisciplinaryActions_Employees_HrRepresentativeId",
                        column: x => x.HrRepresentativeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DisciplinaryActions_Employees_InvestigatorId",
                        column: x => x.InvestigatorId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DisciplinaryActions_Employees_ReportedById",
                        column: x => x.ReportedById,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAssets",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    AssetType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AssetName = table.Column<string>(type: "text", nullable: false),
                    AssetCode = table.Column<string>(type: "text", nullable: true),
                    SerialNumber = table.Column<string>(type: "text", nullable: true),
                    Model = table.Column<string>(type: "text", nullable: true),
                    Brand = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    PurchaseValue = table.Column<decimal>(type: "numeric", nullable: true),
                    CurrentValue = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarrantyEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AssignmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpectedReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AssignedById = table.Column<int>(type: "integer", nullable: true),
                    ReceivedById = table.Column<int>(type: "integer", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    Office = table.Column<string>(type: "text", nullable: true),
                    ConditionAtAssignment = table.Column<int>(type: "integer", nullable: false),
                    ConditionAtReturn = table.Column<int>(type: "integer", nullable: true),
                    ConditionNotes = table.Column<string>(type: "text", nullable: true),
                    HasDamage = table.Column<bool>(type: "boolean", nullable: false),
                    DamageDescription = table.Column<string>(type: "text", nullable: true),
                    DamageCost = table.Column<decimal>(type: "numeric", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    MacAddress = table.Column<string>(type: "text", nullable: true),
                    Hostname = table.Column<string>(type: "text", nullable: true),
                    OperatingSystem = table.Column<string>(type: "text", nullable: true),
                    SoftwareLicenses = table.Column<string>(type: "text", nullable: true),
                    Imei = table.Column<string>(type: "text", nullable: true),
                    SimCardNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    LicensePlate = table.Column<string>(type: "text", nullable: true),
                    MileageAtAssignment = table.Column<int>(type: "integer", nullable: true),
                    MileageAtReturn = table.Column<int>(type: "integer", nullable: true),
                    FuelCardNumber = table.Column<string>(type: "text", nullable: true),
                    AssignmentFormSigned = table.Column<bool>(type: "boolean", nullable: false),
                    AssignmentFormUrl = table.Column<string>(type: "text", nullable: true),
                    ReturnFormUrl = table.Column<string>(type: "text", nullable: true),
                    PhotosJson = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    InventoryItemId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_EmployeeAssets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeAssets_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeAssets_Employees_AssignedById",
                        column: x => x.AssignedById,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeAssets_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeBenefits",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    BenefitType = table.Column<int>(type: "integer", nullable: false),
                    BenefitName = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    PaymentFrequency = table.Column<int>(type: "integer", nullable: false),
                    AnnualValue = table.Column<decimal>(type: "numeric", nullable: true),
                    TaxIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    IsTaxable = table.Column<bool>(type: "boolean", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VestingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WaitingPeriodMonths = table.Column<int>(type: "integer", nullable: true),
                    InsuranceProvider = table.Column<string>(type: "text", nullable: true),
                    PolicyNumber = table.Column<string>(type: "text", nullable: true),
                    CoverageLevel = table.Column<string>(type: "text", nullable: true),
                    IncludesFamily = table.Column<bool>(type: "boolean", nullable: false),
                    SpouseCovered = table.Column<bool>(type: "boolean", nullable: false),
                    ChildrenCovered = table.Column<bool>(type: "boolean", nullable: false),
                    NumberOfDependents = table.Column<int>(type: "integer", nullable: true),
                    VehiclePlate = table.Column<string>(type: "text", nullable: true),
                    VehicleModel = table.Column<string>(type: "text", nullable: true),
                    FuelAllowance = table.Column<decimal>(type: "numeric", nullable: true),
                    MileageLimit = table.Column<int>(type: "integer", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    MonthlyLimit = table.Column<decimal>(type: "numeric", nullable: true),
                    Operator = table.Column<string>(type: "text", nullable: true),
                    CardNumber = table.Column<string>(type: "text", nullable: true),
                    DailyAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    CardProvider = table.Column<string>(type: "text", nullable: true),
                    UsedAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    RemainingAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    LastUsageDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    DocumentUrl = table.Column<string>(type: "text", nullable: true),
                    ApprovedById = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_EmployeeBenefits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeBenefits_Employees_ApprovedById",
                        column: x => x.ApprovedById,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeBenefits_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Grievances",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GrievanceCode = table.Column<string>(type: "text", nullable: false),
                    ComplainantId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    GrievanceType = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IncidentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IncidentLocation = table.Column<string>(type: "text", nullable: true),
                    AccusedPersonId = table.Column<int>(type: "integer", nullable: true),
                    AccusedPersonDescription = table.Column<string>(type: "text", nullable: true),
                    Witnesses = table.Column<string>(type: "text", nullable: true),
                    Evidence = table.Column<string>(type: "text", nullable: true),
                    IsAnonymous = table.Column<bool>(type: "boolean", nullable: false),
                    IsConfidential = table.Column<bool>(type: "boolean", nullable: false),
                    RetaliationProtectionRequested = table.Column<bool>(type: "boolean", nullable: false),
                    AssignedToId = table.Column<int>(type: "integer", nullable: true),
                    HrRepresentativeId = table.Column<int>(type: "integer", nullable: true),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FiledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcknowledgedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TargetResolutionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvestigationRequired = table.Column<bool>(type: "boolean", nullable: false),
                    InvestigationStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvestigationEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvestigationNotes = table.Column<string>(type: "text", nullable: true),
                    InvestigationFindings = table.Column<string>(type: "text", nullable: true),
                    Resolution = table.Column<string>(type: "text", nullable: true),
                    ResolutionType = table.Column<int>(type: "integer", nullable: true),
                    ActionsTaken = table.Column<string>(type: "text", nullable: true),
                    PreventiveMeasures = table.Column<string>(type: "text", nullable: true),
                    ComplainantSatisfied = table.Column<bool>(type: "boolean", nullable: true),
                    SatisfactionFeedback = table.Column<string>(type: "text", nullable: true),
                    SatisfactionRating = table.Column<int>(type: "integer", nullable: true),
                    WasEscalated = table.Column<bool>(type: "boolean", nullable: false),
                    EscalationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EscalationReason = table.Column<string>(type: "text", nullable: true),
                    EscalationLevel = table.Column<int>(type: "integer", nullable: false),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: true),
                    Subcategory = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Grievances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Grievances_Employees_AccusedPersonId",
                        column: x => x.AccusedPersonId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Grievances_Employees_AssignedToId",
                        column: x => x.AssignedToId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Grievances_Employees_ComplainantId",
                        column: x => x.ComplainantId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Grievances_Employees_HrRepresentativeId",
                        column: x => x.HrRepresentativeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobPostings",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    PostingCode = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EmploymentType = table.Column<int>(type: "integer", nullable: false),
                    ExperienceLevel = table.Column<int>(type: "integer", nullable: false),
                    DepartmentId = table.Column<int>(type: "integer", nullable: false),
                    PositionId = table.Column<int>(type: "integer", nullable: true),
                    HiringManagerId = table.Column<int>(type: "integer", nullable: true),
                    NumberOfOpenings = table.Column<int>(type: "integer", nullable: false),
                    WorkLocationId = table.Column<int>(type: "integer", nullable: true),
                    RemoteWorkType = table.Column<int>(type: "integer", nullable: false),
                    City = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Requirements = table.Column<string>(type: "text", nullable: true),
                    Responsibilities = table.Column<string>(type: "text", nullable: true),
                    Qualifications = table.Column<string>(type: "text", nullable: true),
                    PreferredQualifications = table.Column<string>(type: "text", nullable: true),
                    Benefits = table.Column<string>(type: "text", nullable: true),
                    SalaryMin = table.Column<decimal>(type: "numeric", nullable: true),
                    SalaryMax = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ShowSalary = table.Column<bool>(type: "boolean", nullable: false),
                    SalaryPeriod = table.Column<int>(type: "integer", nullable: false),
                    PostedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApplicationDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpectedStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalApplications = table.Column<int>(type: "integer", nullable: false),
                    ViewsCount = table.Column<int>(type: "integer", nullable: false),
                    HiredCount = table.Column<int>(type: "integer", nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    IsUrgent = table.Column<bool>(type: "boolean", nullable: false),
                    PostedByUserId = table.Column<int>(type: "integer", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    Keywords = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_JobPostings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobPostings_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobPostings_Employees_HiringManagerId",
                        column: x => x.HiringManagerId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobPostings_Positions_PositionId",
                        column: x => x.PositionId,
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobPostings_WorkLocations_WorkLocationId",
                        column: x => x.WorkLocationId,
                        principalSchema: "hr",
                        principalTable: "WorkLocations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OnboardingTemplate",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    PositionId = table.Column<int>(type: "integer", nullable: true),
                    DurationDays = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_OnboardingTemplate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingTemplate_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OnboardingTemplate_Positions_PositionId",
                        column: x => x.PositionId,
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Overtimes",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    OvertimeType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    PlannedHours = table.Column<decimal>(type: "numeric", nullable: false),
                    ActualHours = table.Column<decimal>(type: "numeric", nullable: true),
                    BreakMinutes = table.Column<int>(type: "integer", nullable: false),
                    PayMultiplier = table.Column<decimal>(type: "numeric", nullable: false),
                    CalculatedAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    ProjectName = table.Column<string>(type: "text", nullable: true),
                    TaskId = table.Column<string>(type: "text", nullable: true),
                    CostCenter = table.Column<string>(type: "text", nullable: true),
                    Reason = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    WorkDetails = table.Column<string>(type: "text", nullable: true),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ApprovedById = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalNotes = table.Column<string>(type: "text", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PayrollId = table.Column<int>(type: "integer", nullable: true),
                    IsCompensatoryTimeOff = table.Column<bool>(type: "boolean", nullable: false),
                    CompensatoryHoursEarned = table.Column<decimal>(type: "numeric", nullable: true),
                    CompensatoryHoursUsed = table.Column<decimal>(type: "numeric", nullable: true),
                    IsPreApproved = table.Column<bool>(type: "boolean", nullable: false),
                    IsEmergency = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_Overtimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Overtimes_Employees_ApprovedById",
                        column: x => x.ApprovedById,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Overtimes_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Overtimes_Payrolls_PayrollId",
                        column: x => x.PayrollId,
                        principalSchema: "hr",
                        principalTable: "Payrolls",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Payslips",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    PayrollId = table.Column<int>(type: "integer", nullable: false),
                    PayslipNumber = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Period = table.Column<string>(type: "text", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    PaymentDate = table.Column<DateOnly>(type: "date", nullable: false),
                    GrossSalary = table.Column<decimal>(type: "numeric", nullable: false),
                    BaseSalary = table.Column<decimal>(type: "numeric", nullable: false),
                    OvertimePay = table.Column<decimal>(type: "numeric", nullable: false),
                    Bonus = table.Column<decimal>(type: "numeric", nullable: false),
                    Gratuity = table.Column<decimal>(type: "numeric", nullable: false),
                    Commission = table.Column<decimal>(type: "numeric", nullable: false),
                    OtherEarnings = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalEarnings = table.Column<decimal>(type: "numeric", nullable: false),
                    TransportationAllowance = table.Column<decimal>(type: "numeric", nullable: false),
                    MealAllowance = table.Column<decimal>(type: "numeric", nullable: false),
                    HousingAllowance = table.Column<decimal>(type: "numeric", nullable: false),
                    PhoneAllowance = table.Column<decimal>(type: "numeric", nullable: false),
                    OtherAllowances = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalAllowances = table.Column<decimal>(type: "numeric", nullable: false),
                    IncomeTax = table.Column<decimal>(type: "numeric", nullable: false),
                    StampTax = table.Column<decimal>(type: "numeric", nullable: false),
                    SsiEmployeeShare = table.Column<decimal>(type: "numeric", nullable: false),
                    UnemploymentInsuranceEmployee = table.Column<decimal>(type: "numeric", nullable: false),
                    PrivatePensionDeduction = table.Column<decimal>(type: "numeric", nullable: false),
                    UnionDues = table.Column<decimal>(type: "numeric", nullable: false),
                    Garnishment = table.Column<decimal>(type: "numeric", nullable: false),
                    AdvanceDeduction = table.Column<decimal>(type: "numeric", nullable: false),
                    OtherDeductions = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "numeric", nullable: false),
                    SsiEmployerShare = table.Column<decimal>(type: "numeric", nullable: false),
                    UnemploymentInsuranceEmployer = table.Column<decimal>(type: "numeric", nullable: false),
                    PrivatePensionEmployer = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalEmployerCost = table.Column<decimal>(type: "numeric", nullable: false),
                    NetSalary = table.Column<decimal>(type: "numeric", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    DaysWorked = table.Column<int>(type: "integer", nullable: false),
                    HoursWorked = table.Column<decimal>(type: "numeric", nullable: false),
                    OvertimeHours = table.Column<decimal>(type: "numeric", nullable: false),
                    LeaveDays = table.Column<int>(type: "integer", nullable: false),
                    AbsenceDays = table.Column<int>(type: "integer", nullable: false),
                    HolidayDays = table.Column<int>(type: "integer", nullable: false),
                    CumulativeGross = table.Column<decimal>(type: "numeric", nullable: false),
                    CumulativeIncomeTax = table.Column<decimal>(type: "numeric", nullable: false),
                    CumulativeSsiBase = table.Column<decimal>(type: "numeric", nullable: false),
                    BankName = table.Column<string>(type: "text", nullable: true),
                    Iban = table.Column<string>(type: "text", nullable: true),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: false),
                    PaymentReference = table.Column<string>(type: "text", nullable: true),
                    PdfUrl = table.Column<string>(type: "text", nullable: true),
                    GeneratedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ViewedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Payslips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payslips_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payslips_Payrolls_PayrollId",
                        column: x => x.PayrollId,
                        principalSchema: "hr",
                        principalTable: "Payrolls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Skill",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    SkillType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentSkillName = table.Column<string>(type: "text", nullable: true),
                    ParentSkillId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_Skill", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Skill_Skill_ParentSkillId",
                        column: x => x.ParentSkillId,
                        principalSchema: "hr",
                        principalTable: "Skill",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SuccessionPlans",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanName = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    PositionId = table.Column<int>(type: "integer", nullable: false),
                    DepartmentId = table.Column<int>(type: "integer", nullable: false),
                    CurrentIncumbentId = table.Column<int>(type: "integer", nullable: true),
                    IsCriticalPosition = table.Column<bool>(type: "boolean", nullable: false),
                    RiskLevel = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastReviewDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextReviewDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpectedVacancyDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VacancyReason = table.Column<int>(type: "integer", nullable: true),
                    CompletionPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    HasReadyCandidate = table.Column<bool>(type: "boolean", nullable: false),
                    HasEmergencyBackup = table.Column<bool>(type: "boolean", nullable: false),
                    RequiredCompetencies = table.Column<string>(type: "text", nullable: true),
                    RequiredExperienceYears = table.Column<int>(type: "integer", nullable: true),
                    RequiredCertifications = table.Column<string>(type: "text", nullable: true),
                    RequiredEducation = table.Column<string>(type: "text", nullable: true),
                    CriticalSuccessFactors = table.Column<string>(type: "text", nullable: true),
                    PlanOwnerId = table.Column<int>(type: "integer", nullable: true),
                    HrResponsibleId = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ExternalHiringNeeded = table.Column<bool>(type: "boolean", nullable: false),
                    Budget = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_SuccessionPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SuccessionPlans_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SuccessionPlans_Employees_CurrentIncumbentId",
                        column: x => x.CurrentIncumbentId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SuccessionPlans_Employees_HrResponsibleId",
                        column: x => x.HrResponsibleId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SuccessionPlans_Employees_PlanOwnerId",
                        column: x => x.PlanOwnerId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SuccessionPlans_Positions_PositionId",
                        column: x => x.PositionId,
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimeSheets",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TotalWorkHours = table.Column<decimal>(type: "numeric", nullable: false),
                    RegularHours = table.Column<decimal>(type: "numeric", nullable: false),
                    OvertimeHours = table.Column<decimal>(type: "numeric", nullable: false),
                    LeaveHours = table.Column<decimal>(type: "numeric", nullable: false),
                    HolidayHours = table.Column<decimal>(type: "numeric", nullable: false),
                    BillableHours = table.Column<decimal>(type: "numeric", nullable: false),
                    NonBillableHours = table.Column<decimal>(type: "numeric", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedById = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalNotes = table.Column<string>(type: "text", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_TimeSheets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSheets_Employees_ApprovedById",
                        column: x => x.ApprovedById,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TimeSheets_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CareerMilestone",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareerPathId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Evidence = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_CareerMilestone", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareerMilestone_CareerPaths_CareerPathId",
                        column: x => x.CareerPathId,
                        principalSchema: "hr",
                        principalTable: "CareerPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobApplications",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApplicationCode = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ApplicationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    JobPostingId = table.Column<int>(type: "integer", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    MobilePhone = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true),
                    LinkedInUrl = table.Column<string>(type: "text", nullable: true),
                    PortfolioUrl = table.Column<string>(type: "text", nullable: true),
                    TotalExperienceYears = table.Column<int>(type: "integer", nullable: true),
                    CurrentCompany = table.Column<string>(type: "text", nullable: true),
                    CurrentPosition = table.Column<string>(type: "text", nullable: true),
                    CurrentSalary = table.Column<decimal>(type: "numeric", nullable: true),
                    ExpectedSalary = table.Column<decimal>(type: "numeric", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    NoticePeriodDays = table.Column<int>(type: "integer", nullable: true),
                    AvailableStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HighestEducation = table.Column<int>(type: "integer", nullable: true),
                    University = table.Column<string>(type: "text", nullable: true),
                    Major = table.Column<string>(type: "text", nullable: true),
                    GraduationYear = table.Column<int>(type: "integer", nullable: true),
                    ResumeUrl = table.Column<string>(type: "text", nullable: true),
                    CoverLetter = table.Column<string>(type: "text", nullable: true),
                    AdditionalDocumentsJson = table.Column<string>(type: "text", nullable: true),
                    OverallRating = table.Column<int>(type: "integer", nullable: true),
                    TechnicalScore = table.Column<int>(type: "integer", nullable: true),
                    CulturalFitScore = table.Column<int>(type: "integer", nullable: true),
                    EvaluationNotes = table.Column<string>(type: "text", nullable: true),
                    EvaluatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    EvaluationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Source = table.Column<int>(type: "integer", nullable: false),
                    ReferredByEmployeeId = table.Column<int>(type: "integer", nullable: true),
                    SourceDetail = table.Column<string>(type: "text", nullable: true),
                    CurrentStage = table.Column<int>(type: "integer", nullable: false),
                    LastStageChangeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    RejectionCategory = table.Column<int>(type: "integer", nullable: true),
                    WithdrawalReason = table.Column<string>(type: "text", nullable: true),
                    OfferExtended = table.Column<bool>(type: "boolean", nullable: false),
                    OfferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OfferedSalary = table.Column<decimal>(type: "numeric", nullable: true),
                    HireDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedEmployeeId = table.Column<int>(type: "integer", nullable: true),
                    Skills = table.Column<string>(type: "text", nullable: true),
                    Languages = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    InTalentPool = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_JobApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobApplications_Employees_CreatedEmployeeId",
                        column: x => x.CreatedEmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobApplications_Employees_ReferredByEmployeeId",
                        column: x => x.ReferredByEmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobApplications_JobPostings_JobPostingId",
                        column: x => x.JobPostingId,
                        principalSchema: "hr",
                        principalTable: "JobPostings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Onboardings",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TemplateId = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PlannedEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FirstDayOfWork = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BuddyId = table.Column<int>(type: "integer", nullable: true),
                    HrResponsibleId = table.Column<int>(type: "integer", nullable: true),
                    ItResponsibleId = table.Column<int>(type: "integer", nullable: true),
                    CompletionPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalTasks = table.Column<int>(type: "integer", nullable: false),
                    CompletedTasks = table.Column<int>(type: "integer", nullable: false),
                    LaptopProvided = table.Column<bool>(type: "boolean", nullable: false),
                    PhoneProvided = table.Column<bool>(type: "boolean", nullable: false),
                    AccessCardProvided = table.Column<bool>(type: "boolean", nullable: false),
                    EquipmentNotes = table.Column<string>(type: "text", nullable: true),
                    EmailAccountCreated = table.Column<bool>(type: "boolean", nullable: false),
                    AdAccountCreated = table.Column<bool>(type: "boolean", nullable: false),
                    SystemAccessGranted = table.Column<bool>(type: "boolean", nullable: false),
                    VpnAccessGranted = table.Column<bool>(type: "boolean", nullable: false),
                    ContractSigned = table.Column<bool>(type: "boolean", nullable: false),
                    NdaSigned = table.Column<bool>(type: "boolean", nullable: false),
                    PoliciesAcknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    BankDetailsReceived = table.Column<bool>(type: "boolean", nullable: false),
                    EmergencyContactReceived = table.Column<bool>(type: "boolean", nullable: false),
                    OrientationCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    SafetyTrainingCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    ComplianceTrainingCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    ProductTrainingCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    Week1FeedbackReceived = table.Column<bool>(type: "boolean", nullable: false),
                    Month1FeedbackReceived = table.Column<bool>(type: "boolean", nullable: false),
                    Month3FeedbackReceived = table.Column<bool>(type: "boolean", nullable: false),
                    EmployeeFeedback = table.Column<string>(type: "text", nullable: true),
                    ManagerFeedback = table.Column<string>(type: "text", nullable: true),
                    WelcomeKitSent = table.Column<bool>(type: "boolean", nullable: false),
                    DeskPrepared = table.Column<bool>(type: "boolean", nullable: false),
                    TeamIntroductionDone = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_Onboardings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Onboardings_Employees_BuddyId",
                        column: x => x.BuddyId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Onboardings_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Onboardings_Employees_HrResponsibleId",
                        column: x => x.HrResponsibleId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Onboardings_OnboardingTemplate_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "hr",
                        principalTable: "OnboardingTemplate",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OnboardingTemplateTask",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    DaysFromStart = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    DefaultAssigneeRole = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_OnboardingTemplateTask", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingTemplateTask_OnboardingTemplate_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "hr",
                        principalTable: "OnboardingTemplate",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayslipItem",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PayslipId = table.Column<int>(type: "integer", nullable: false),
                    ItemName = table.Column<string>(type: "text", nullable: false),
                    ItemType = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    Rate = table.Column<decimal>(type: "numeric", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_PayslipItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayslipItem_Payslips_PayslipId",
                        column: x => x.PayslipId,
                        principalSchema: "hr",
                        principalTable: "Payslips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeSkills",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    SkillId = table.Column<int>(type: "integer", nullable: true),
                    SkillName = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    SkillType = table.Column<int>(type: "integer", nullable: false),
                    ProficiencyLevel = table.Column<int>(type: "integer", nullable: false),
                    YearsOfExperience = table.Column<decimal>(type: "numeric", nullable: true),
                    SelfAssessment = table.Column<int>(type: "integer", nullable: true),
                    ManagerAssessment = table.Column<int>(type: "integer", nullable: true),
                    LastAssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerificationMethod = table.Column<int>(type: "integer", nullable: true),
                    VerificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedByUserId = table.Column<int>(type: "integer", nullable: true),
                    IsCertified = table.Column<bool>(type: "boolean", nullable: false),
                    CertificationName = table.Column<string>(type: "text", nullable: true),
                    CertifyingAuthority = table.Column<string>(type: "text", nullable: true),
                    CertificationNumber = table.Column<string>(type: "text", nullable: true),
                    CertificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CertificationExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CertificationUrl = table.Column<string>(type: "text", nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    IsActivelyUsed = table.Column<bool>(type: "boolean", nullable: false),
                    LastUsedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsageFrequency = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    LearningSource = table.Column<string>(type: "text", nullable: true),
                    RelatedProjects = table.Column<string>(type: "text", nullable: true),
                    CanMentor = table.Column<bool>(type: "boolean", nullable: false),
                    CanTrain = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_EmployeeSkills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeSkills_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeSkills_Skill_SkillId",
                        column: x => x.SkillId,
                        principalSchema: "hr",
                        principalTable: "Skill",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SuccessionCandidate",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SuccessionPlanId = table.Column<int>(type: "integer", nullable: false),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    ReadinessLevel = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    ReadinessScore = table.Column<int>(type: "integer", nullable: true),
                    PerformanceRating = table.Column<int>(type: "integer", nullable: true),
                    PotentialRating = table.Column<int>(type: "integer", nullable: true),
                    IsEmergencyBackup = table.Column<bool>(type: "boolean", nullable: false),
                    IsPreferred = table.Column<bool>(type: "boolean", nullable: false),
                    DevelopmentNeeds = table.Column<string>(type: "text", nullable: true),
                    DevelopmentPlan = table.Column<string>(type: "text", nullable: true),
                    Strengths = table.Column<string>(type: "text", nullable: true),
                    Gaps = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    LastAssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpectedReadyDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_SuccessionCandidate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SuccessionCandidate_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SuccessionCandidate_SuccessionPlans_SuccessionPlanId",
                        column: x => x.SuccessionPlanId,
                        principalSchema: "hr",
                        principalTable: "SuccessionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimeSheetEntry",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TimeSheetId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Hours = table.Column<decimal>(type: "numeric", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    ProjectName = table.Column<string>(type: "text", nullable: true),
                    ProjectCode = table.Column<string>(type: "text", nullable: true),
                    TaskId = table.Column<int>(type: "integer", nullable: true),
                    TaskDescription = table.Column<string>(type: "text", nullable: true),
                    ActivityType = table.Column<string>(type: "text", nullable: true),
                    CostCenter = table.Column<string>(type: "text", nullable: true),
                    IsBillable = table.Column<bool>(type: "boolean", nullable: false),
                    IsOvertime = table.Column<bool>(type: "boolean", nullable: false),
                    BillingRate = table.Column<decimal>(type: "numeric", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    BreakMinutes = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_TimeSheetEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSheetEntry_TimeSheets_TimeSheetId",
                        column: x => x.TimeSheetId,
                        principalSchema: "hr",
                        principalTable: "TimeSheets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InterviewType = table.Column<int>(type: "integer", nullable: false),
                    Round = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    JobApplicationId = table.Column<int>(type: "integer", nullable: false),
                    InterviewerId = table.Column<int>(type: "integer", nullable: false),
                    ScheduledDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    Timezone = table.Column<string>(type: "text", nullable: true),
                    ActualDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualDurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    Format = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    MeetingRoom = table.Column<string>(type: "text", nullable: true),
                    VideoConferenceLink = table.Column<string>(type: "text", nullable: true),
                    VideoConferencePlatform = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    Topics = table.Column<string>(type: "text", nullable: true),
                    QuestionsToAsk = table.Column<string>(type: "text", nullable: true),
                    InterviewerNotes = table.Column<string>(type: "text", nullable: true),
                    CandidateInstructions = table.Column<string>(type: "text", nullable: true),
                    OverallRating = table.Column<int>(type: "integer", nullable: true),
                    TechnicalCompetency = table.Column<int>(type: "integer", nullable: true),
                    CommunicationSkills = table.Column<int>(type: "integer", nullable: true),
                    ProblemSolving = table.Column<int>(type: "integer", nullable: true),
                    CulturalFit = table.Column<int>(type: "integer", nullable: true),
                    LeadershipPotential = table.Column<int>(type: "integer", nullable: true),
                    Recommendation = table.Column<int>(type: "integer", nullable: true),
                    EvaluationSummary = table.Column<string>(type: "text", nullable: true),
                    Strengths = table.Column<string>(type: "text", nullable: true),
                    AreasOfImprovement = table.Column<string>(type: "text", nullable: true),
                    InvitationSentToCandidate = table.Column<bool>(type: "boolean", nullable: false),
                    InvitationSentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CandidateConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    ReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    CancelledBy = table.Column<string>(type: "text", nullable: true),
                    WasRescheduled = table.Column<bool>(type: "boolean", nullable: false),
                    PreviousDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_Interviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interviews_Employees_InterviewerId",
                        column: x => x.InterviewerId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interviews_JobApplications_JobApplicationId",
                        column: x => x.JobApplicationId,
                        principalSchema: "hr",
                        principalTable: "JobApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingTask",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OnboardingId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AssignedToId = table.Column<int>(type: "integer", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_OnboardingTask", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingTask_Employees_AssignedToId",
                        column: x => x.AssignedToId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OnboardingTask_Onboardings_OnboardingId",
                        column: x => x.OnboardingId,
                        principalSchema: "hr",
                        principalTable: "Onboardings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewFeedback",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InterviewId = table.Column<int>(type: "integer", nullable: false),
                    ReviewerId = table.Column<int>(type: "integer", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Recommendation = table.Column<int>(type: "integer", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_InterviewFeedback", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewFeedback_Employees_ReviewerId",
                        column: x => x.ReviewerId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewFeedback_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalSchema: "hr",
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CareerMilestone_CareerPathId",
                schema: "hr",
                table: "CareerMilestone",
                column: "CareerPathId");

            migrationBuilder.CreateIndex(
                name: "IX_CareerPaths_CurrentPositionId",
                schema: "hr",
                table: "CareerPaths",
                column: "CurrentPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_CareerPaths_EmployeeId",
                schema: "hr",
                table: "CareerPaths",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_CareerPaths_MentorId",
                schema: "hr",
                table: "CareerPaths",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_CareerPaths_TargetPositionId",
                schema: "hr",
                table: "CareerPaths",
                column: "TargetPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_Certifications_EmployeeId",
                schema: "hr",
                table: "Certifications",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_DisciplinaryActions_DecisionMakerId",
                schema: "hr",
                table: "DisciplinaryActions",
                column: "DecisionMakerId");

            migrationBuilder.CreateIndex(
                name: "IX_DisciplinaryActions_EmployeeId",
                schema: "hr",
                table: "DisciplinaryActions",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_DisciplinaryActions_HrRepresentativeId",
                schema: "hr",
                table: "DisciplinaryActions",
                column: "HrRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_DisciplinaryActions_InvestigatorId",
                schema: "hr",
                table: "DisciplinaryActions",
                column: "InvestigatorId");

            migrationBuilder.CreateIndex(
                name: "IX_DisciplinaryActions_ReportedById",
                schema: "hr",
                table: "DisciplinaryActions",
                column: "ReportedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssets_AssignedById",
                schema: "hr",
                table: "EmployeeAssets",
                column: "AssignedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssets_DepartmentId",
                schema: "hr",
                table: "EmployeeAssets",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssets_EmployeeId",
                schema: "hr",
                table: "EmployeeAssets",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeBenefits_ApprovedById",
                schema: "hr",
                table: "EmployeeBenefits",
                column: "ApprovedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeBenefits_EmployeeId",
                schema: "hr",
                table: "EmployeeBenefits",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSkills_EmployeeId",
                schema: "hr",
                table: "EmployeeSkills",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSkills_SkillId",
                schema: "hr",
                table: "EmployeeSkills",
                column: "SkillId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_AccusedPersonId",
                schema: "hr",
                table: "Grievances",
                column: "AccusedPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_AssignedToId",
                schema: "hr",
                table: "Grievances",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_ComplainantId",
                schema: "hr",
                table: "Grievances",
                column: "ComplainantId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_HrRepresentativeId",
                schema: "hr",
                table: "Grievances",
                column: "HrRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedback_InterviewId",
                schema: "hr",
                table: "InterviewFeedback",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedback_ReviewerId",
                schema: "hr",
                table: "InterviewFeedback",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_InterviewerId",
                schema: "hr",
                table: "Interviews",
                column: "InterviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_JobApplicationId",
                schema: "hr",
                table: "Interviews",
                column: "JobApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_CreatedEmployeeId",
                schema: "hr",
                table: "JobApplications",
                column: "CreatedEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_JobPostingId",
                schema: "hr",
                table: "JobApplications",
                column: "JobPostingId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_ReferredByEmployeeId",
                schema: "hr",
                table: "JobApplications",
                column: "ReferredByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_DepartmentId",
                schema: "hr",
                table: "JobPostings",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_HiringManagerId",
                schema: "hr",
                table: "JobPostings",
                column: "HiringManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_PositionId",
                schema: "hr",
                table: "JobPostings",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_WorkLocationId",
                schema: "hr",
                table: "JobPostings",
                column: "WorkLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Onboardings_BuddyId",
                schema: "hr",
                table: "Onboardings",
                column: "BuddyId");

            migrationBuilder.CreateIndex(
                name: "IX_Onboardings_EmployeeId",
                schema: "hr",
                table: "Onboardings",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Onboardings_HrResponsibleId",
                schema: "hr",
                table: "Onboardings",
                column: "HrResponsibleId");

            migrationBuilder.CreateIndex(
                name: "IX_Onboardings_TemplateId",
                schema: "hr",
                table: "Onboardings",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTask_AssignedToId",
                schema: "hr",
                table: "OnboardingTask",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTask_OnboardingId",
                schema: "hr",
                table: "OnboardingTask",
                column: "OnboardingId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTemplate_DepartmentId",
                schema: "hr",
                table: "OnboardingTemplate",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTemplate_PositionId",
                schema: "hr",
                table: "OnboardingTemplate",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTemplateTask_TemplateId",
                schema: "hr",
                table: "OnboardingTemplateTask",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Overtimes_ApprovedById",
                schema: "hr",
                table: "Overtimes",
                column: "ApprovedById");

            migrationBuilder.CreateIndex(
                name: "IX_Overtimes_EmployeeId",
                schema: "hr",
                table: "Overtimes",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Overtimes_PayrollId",
                schema: "hr",
                table: "Overtimes",
                column: "PayrollId");

            migrationBuilder.CreateIndex(
                name: "IX_PayslipItem_PayslipId",
                schema: "hr",
                table: "PayslipItem",
                column: "PayslipId");

            migrationBuilder.CreateIndex(
                name: "IX_Payslips_EmployeeId",
                schema: "hr",
                table: "Payslips",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Payslips_PayrollId",
                schema: "hr",
                table: "Payslips",
                column: "PayrollId");

            migrationBuilder.CreateIndex(
                name: "IX_Skill_ParentSkillId",
                schema: "hr",
                table: "Skill",
                column: "ParentSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionCandidate_EmployeeId",
                schema: "hr",
                table: "SuccessionCandidate",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionCandidate_SuccessionPlanId",
                schema: "hr",
                table: "SuccessionCandidate",
                column: "SuccessionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionPlans_CurrentIncumbentId",
                schema: "hr",
                table: "SuccessionPlans",
                column: "CurrentIncumbentId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionPlans_DepartmentId",
                schema: "hr",
                table: "SuccessionPlans",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionPlans_HrResponsibleId",
                schema: "hr",
                table: "SuccessionPlans",
                column: "HrResponsibleId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionPlans_PlanOwnerId",
                schema: "hr",
                table: "SuccessionPlans",
                column: "PlanOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_SuccessionPlans_PositionId",
                schema: "hr",
                table: "SuccessionPlans",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheetEntry_TimeSheetId",
                schema: "hr",
                table: "TimeSheetEntry",
                column: "TimeSheetId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_ApprovedById",
                schema: "hr",
                table: "TimeSheets",
                column: "ApprovedById");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_EmployeeId",
                schema: "hr",
                table: "TimeSheets",
                column: "EmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CareerMilestone",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Certifications",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "DisciplinaryActions",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EmployeeAssets",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EmployeeBenefits",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EmployeeSkills",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Grievances",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "InterviewFeedback",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "OnboardingTask",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "OnboardingTemplateTask",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Overtimes",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "PayslipItem",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "SuccessionCandidate",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "TimeSheetEntry",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "CareerPaths",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Skill",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Interviews",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Onboardings",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Payslips",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "SuccessionPlans",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "TimeSheets",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobApplications",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "OnboardingTemplate",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobPostings",
                schema: "hr");
        }
    }
}
