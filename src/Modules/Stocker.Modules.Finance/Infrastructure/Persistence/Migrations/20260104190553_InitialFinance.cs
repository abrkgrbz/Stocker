using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialFinance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "finance");

            migrationBuilder.CreateTable(
                name: "Accounts",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ParentAccountId = table.Column<int>(type: "integer", nullable: true),
                    AccountType = table.Column<int>(type: "integer", nullable: false),
                    SubGroup = table.Column<int>(type: "integer", nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    DebitBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DebitBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreditBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreditBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsSystemAccount = table.Column<bool>(type: "boolean", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    AcceptsSubAccounts = table.Column<bool>(type: "boolean", nullable: false),
                    AcceptsTransactions = table.Column<bool>(type: "boolean", nullable: false),
                    IsDebitNatured = table.Column<bool>(type: "boolean", nullable: false),
                    ClosesAtPeriodEnd = table.Column<bool>(type: "boolean", nullable: false),
                    LinkedBankAccountId = table.Column<int>(type: "integer", nullable: true),
                    LinkedCashAccountId = table.Column<int>(type: "integer", nullable: true),
                    LinkedCurrentAccountId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Accounts_Accounts_ParentAccountId",
                        column: x => x.ParentAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BaBsForms",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FormNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FormType = table.Column<int>(type: "integer", nullable: false),
                    PeriodYear = table.Column<int>(type: "integer", nullable: false),
                    PeriodMonth = table.Column<int>(type: "integer", nullable: false),
                    PeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FilingDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalRecordCount = table.Column<int>(type: "integer", nullable: false),
                    TotalAmountExcludingVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmountExcludingVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalAmountIncludingVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmountIncludingVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsCorrection = table.Column<bool>(type: "boolean", nullable: false),
                    CorrectedFormId = table.Column<int>(type: "integer", nullable: true),
                    CorrectionSequence = table.Column<int>(type: "integer", nullable: false),
                    CorrectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PreparedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PreparationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FilingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GibApprovalNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    GibSubmissionReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    TaxOffice = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AccountingPeriodId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_BaBsForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaBsForms_BaBsForms_CorrectedFormId",
                        column: x => x.CorrectedFormId,
                        principalSchema: "finance",
                        principalTable: "BaBsForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Currencies",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsoCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NumericCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NameTurkish = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    DecimalPlaces = table.Column<int>(type: "integer", nullable: false),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsBaseCurrency = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRateAdjustments",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AdjustmentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ValuationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValuationType = table.Column<int>(type: "integer", nullable: false),
                    AccountingPeriodId = table.Column<int>(type: "integer", nullable: true),
                    SourceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TargetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    OriginalRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    ValuationRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    RateChangePercentage = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false),
                    SourceAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SourceAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    OriginalValueInTargetCurrency = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OriginalValueInTargetCurrencyCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CurrentValueInTargetCurrency = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CurrentValueInTargetCurrencyCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ExchangeDifference = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ExchangeDifferenceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    SourceEntityId = table.Column<int>(type: "integer", nullable: true),
                    SourceReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SourceDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    BankAccountId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsJournalized = table.Column<bool>(type: "boolean", nullable: false),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    JournalizationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExchangeGainAccountId = table.Column<int>(type: "integer", nullable: true),
                    ExchangeLossAccountId = table.Column<int>(type: "integer", nullable: true),
                    PreparedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_ExchangeRateAdjustments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SourceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TargetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RateType = table.Column<int>(type: "integer", nullable: false),
                    ForexBuying = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    ForexSelling = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    BanknoteBuying = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    BanknoteSelling = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    AverageRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    CrossRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    Unit = table.Column<int>(type: "integer", nullable: false),
                    IsTcmbRate = table.Column<bool>(type: "boolean", nullable: false),
                    TcmbBulletinNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CurrencyIsoCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CurrencyName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CurrencyNameTurkish = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PreviousRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    ChangeAmount = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    ChangePercentage = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: true),
                    Trend = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<int>(type: "integer", nullable: false),
                    IsManualEntry = table.Column<bool>(type: "boolean", nullable: false),
                    IntegrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EnteredByUserId = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefaultForDate = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_ExchangeRates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InstallmentPlans",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PlanType = table.Column<int>(type: "integer", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: false),
                    CurrentAccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DownPayment = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DownPaymentCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    FinancedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    FinancedAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalInterest = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalInterestCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalPayable = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalPayableCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PaidAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NumberOfInstallments = table.Column<int>(type: "integer", nullable: false),
                    PaidInstallments = table.Column<int>(type: "integer", nullable: false),
                    InstallmentAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    InstallmentAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Frequency = table.Column<int>(type: "integer", nullable: false),
                    AnnualInterestRate = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false),
                    InterestType = table.Column<int>(type: "integer", nullable: false),
                    IncludesMaturityDifference = table.Column<bool>(type: "boolean", nullable: false),
                    EarlyPaymentDiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    LatePaymentInterestRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FirstInstallmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ContractNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CollateralInfo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    DeferredAccountId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_InstallmentPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Loans",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoanNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ExternalReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LoanType = table.Column<int>(type: "integer", nullable: false),
                    SubType = table.Column<int>(type: "integer", nullable: false),
                    LenderId = table.Column<int>(type: "integer", nullable: true),
                    LenderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BankAccountId = table.Column<int>(type: "integer", nullable: true),
                    PrincipalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PrincipalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingPrincipal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingPrincipalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalInterest = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalInterestCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaidInterest = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PaidInterestCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BsmvAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BsmvAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    KkdfAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    KkdfAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ProcessingFee = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ProcessingFeeCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    OtherFees = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OtherFeesCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AnnualInterestRate = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false),
                    InterestType = table.Column<int>(type: "integer", nullable: false),
                    ReferenceRateType = table.Column<int>(type: "integer", nullable: true),
                    Spread = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FirstPaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TermMonths = table.Column<int>(type: "integer", nullable: false),
                    PaymentFrequency = table.Column<int>(type: "integer", nullable: false),
                    TotalInstallments = table.Column<int>(type: "integer", nullable: false),
                    PaidInstallments = table.Column<int>(type: "integer", nullable: false),
                    RepaymentMethod = table.Column<int>(type: "integer", nullable: false),
                    CollateralType = table.Column<int>(type: "integer", nullable: true),
                    CollateralDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CollateralValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CollateralValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    GuarantorInfo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Purpose = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AllowsPrepayment = table.Column<bool>(type: "boolean", nullable: false),
                    PrepaymentPenaltyRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    GracePeriodMonths = table.Column<int>(type: "integer", nullable: true),
                    LoanPayableAccountId = table.Column<int>(type: "integer", nullable: true),
                    InterestExpenseAccountId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DisbursementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_Loans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TaxDeclarations",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeclarationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DeclarationType = table.Column<int>(type: "integer", nullable: false),
                    TaxYear = table.Column<int>(type: "integer", nullable: false),
                    TaxMonth = table.Column<int>(type: "integer", nullable: true),
                    TaxQuarter = table.Column<int>(type: "integer", nullable: true),
                    PeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FilingDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TaxBase = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TaxBaseCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CalculatedTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CalculatedTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DeductibleTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DeductibleTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    CarriedForwardTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CarriedForwardTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    BroughtForwardTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    BroughtForwardTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    DeferredTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DeferredTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    NetTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PaidAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    LateInterest = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    LateInterestCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LatePenalty = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    LatePenaltyCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FilingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GibApprovalNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsAmendment = table.Column<bool>(type: "boolean", nullable: false),
                    AmendedDeclarationId = table.Column<int>(type: "integer", nullable: true),
                    AmendmentSequence = table.Column<int>(type: "integer", nullable: false),
                    AmendmentReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TaxOfficeCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    TaxOfficeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AccrualSlipNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PreparedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PreparationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    AccountingPeriodId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_TaxDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaxDeclarations_TaxDeclarations_AmendedDeclarationId",
                        column: x => x.AmendedDeclarationId,
                        principalSchema: "finance",
                        principalTable: "TaxDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BankAccounts",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BankName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BranchName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BranchCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AccountNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Iban = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: false),
                    SwiftCode = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    Balance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BlockedBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BlockedBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AvailableBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AvailableBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    LastReconciliationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReconciledBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ReconciledBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    AccountType = table.Column<int>(type: "integer", nullable: false),
                    IsDemandAccount = table.Column<bool>(type: "boolean", nullable: false),
                    DepositMaturityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InterestRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IsPosAccount = table.Column<bool>(type: "boolean", nullable: false),
                    PosCommissionRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PosTerminalId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PosMerchantId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    HasBankIntegration = table.Column<bool>(type: "boolean", nullable: false),
                    IntegrationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LastIntegrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsAutoMatchingEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    DailyTransferLimit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DailyTransferLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    SingleTransferLimit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SingleTransferLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    CreditLimit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CreditLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    AccountingAccountId = table.Column<int>(type: "integer", nullable: true),
                    OpeningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_BankAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankAccounts_Accounts_AccountingAccountId",
                        column: x => x.AccountingAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CashAccounts",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    AccountType = table.Column<int>(type: "integer", nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MinimumBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MinimumBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    MaximumBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MaximumBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    OpeningBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OpeningBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    LastCountDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastCountBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    LastCountBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    BranchId = table.Column<int>(type: "integer", nullable: true),
                    BranchName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    WarehouseId = table.Column<int>(type: "integer", nullable: true),
                    WarehouseName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ResponsibleUserId = table.Column<int>(type: "integer", nullable: true),
                    ResponsibleUserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    AccountingAccountId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DailyTransactionLimit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DailyTransactionLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    SingleTransactionLimit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SingleTransactionLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
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
                    table.PrimaryKey("PK_CashAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CashAccounts_Accounts_AccountingAccountId",
                        column: x => x.AccountingAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CostCenters",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    ParentId = table.Column<int>(type: "integer", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    FullPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    ResponsibleUserId = table.Column<int>(type: "integer", nullable: true),
                    ResponsibleUserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    BranchId = table.Column<int>(type: "integer", nullable: true),
                    AnnualBudget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AnnualBudgetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    MonthlyBudget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MonthlyBudgetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    SpentAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SpentAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingBudget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingBudgetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BudgetWarningThreshold = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    AllowBudgetOverrun = table.Column<bool>(type: "boolean", nullable: false),
                    RequireApprovalForOverrun = table.Column<bool>(type: "boolean", nullable: false),
                    AllocationKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AllocationRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IsAutoAllocationEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AllocationPeriod = table.Column<int>(type: "integer", nullable: true),
                    AccountingAccountId = table.Column<int>(type: "integer", nullable: true),
                    AccountingAccountCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DefaultExpenseAccountId = table.Column<int>(type: "integer", nullable: true),
                    TotalTransactionCount = table.Column<int>(type: "integer", nullable: false),
                    MonthlyAverageSpending = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    MonthlyAverageSpendingCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LastTransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastBudgetUpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsFrozen = table.Column<bool>(type: "boolean", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_CostCenters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CostCenters_Accounts_AccountingAccountId",
                        column: x => x.AccountingAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CostCenters_Accounts_DefaultExpenseAccountId",
                        column: x => x.DefaultExpenseAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CostCenters_CostCenters_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CurrentAccounts",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ShortName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AccountType = table.Column<int>(type: "integer", nullable: false),
                    TaxLiabilityType = table.Column<int>(type: "integer", nullable: false),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    IdentityNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    TradeRegistryNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MersisNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsEInvoiceRegistered = table.Column<bool>(type: "boolean", nullable: false),
                    EInvoiceAlias = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    KepAddress = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Fax = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    DebitBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DebitBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreditBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreditBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreditLimit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreditLimitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UsedCredit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UsedCreditCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AvailableCredit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AvailableCreditCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RiskStatus = table.Column<int>(type: "integer", nullable: false),
                    RiskNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PaymentTermType = table.Column<int>(type: "integer", nullable: false),
                    PaymentDays = table.Column<int>(type: "integer", nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DefaultVatRate = table.Column<int>(type: "integer", nullable: false),
                    ApplyWithholding = table.Column<bool>(type: "boolean", nullable: false),
                    WithholdingCode = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ReceivableAccountId = table.Column<int>(type: "integer", nullable: true),
                    PayableAccountId = table.Column<int>(type: "integer", nullable: true),
                    CrmCustomerId = table.Column<int>(type: "integer", nullable: true),
                    PurchaseSupplierId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_CurrentAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurrentAccounts_Accounts_PayableAccountId",
                        column: x => x.PayableAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CurrentAccounts_Accounts_ReceivableAccountId",
                        column: x => x.ReceivableAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TransactionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DebitAccountId = table.Column<int>(type: "integer", nullable: false),
                    CreditAccountId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    LocalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    LocalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TransactionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    IsReversed = table.Column<bool>(type: "boolean", nullable: false),
                    ReversedTransactionId = table.Column<int>(type: "integer", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Accounts_CreditAccountId",
                        column: x => x.CreditAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Accounts_DebitAccountId",
                        column: x => x.DebitAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Transactions_ReversedTransactionId",
                        column: x => x.ReversedTransactionId,
                        principalSchema: "finance",
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BaBsFormItems",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BaBsFormId = table.Column<int>(type: "integer", nullable: false),
                    SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                    CounterpartyTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    CounterpartyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    DocumentType = table.Column<int>(type: "integer", nullable: false),
                    DocumentCount = table.Column<int>(type: "integer", nullable: false),
                    AmountExcludingVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountExcludingVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalAmountIncludingVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmountIncludingVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_BaBsFormItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaBsFormItems_BaBsForms_BaBsFormId",
                        column: x => x.BaBsFormId,
                        principalSchema: "finance",
                        principalTable: "BaBsForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRateAdjustmentDetails",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExchangeRateAdjustmentId = table.Column<int>(type: "integer", nullable: false),
                    SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                    SourceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SourceAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SourceAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    OriginalRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    ValuationRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    OriginalValueInTargetCurrency = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OriginalValueInTargetCurrencyCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CurrentValueInTargetCurrency = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CurrentValueInTargetCurrencyCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ExchangeDifference = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ExchangeDifferenceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    SourceEntityId = table.Column<int>(type: "integer", nullable: true),
                    SourceReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_ExchangeRateAdjustmentDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExchangeRateAdjustmentDetails_ExchangeRateAdjustments_Excha~",
                        column: x => x.ExchangeRateAdjustmentId,
                        principalSchema: "finance",
                        principalTable: "ExchangeRateAdjustments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Installments",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InstallmentPlanId = table.Column<int>(type: "integer", nullable: false),
                    InstallmentNumber = table.Column<int>(type: "integer", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PrincipalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PrincipalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    InterestAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    InterestAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PaidAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    IsPartiallyPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LateInterest = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    LateInterestCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    BankTransactionId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_Installments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Installments_InstallmentPlans_InstallmentPlanId",
                        column: x => x.InstallmentPlanId,
                        principalSchema: "finance",
                        principalTable: "InstallmentPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoanPayments",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoanId = table.Column<int>(type: "integer", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    PrincipalPaid = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PrincipalPaidCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    InterestPaid = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    InterestPaidCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PenaltyPaid = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PenaltyPaidCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalPaid = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalPaidCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BankTransactionId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_LoanPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanPayments_Loans_LoanId",
                        column: x => x.LoanId,
                        principalSchema: "finance",
                        principalTable: "Loans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoanSchedules",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoanId = table.Column<int>(type: "integer", nullable: false),
                    InstallmentNumber = table.Column<int>(type: "integer", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PrincipalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PrincipalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    InterestAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    InterestAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_LoanSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanSchedules_Loans_LoanId",
                        column: x => x.LoanId,
                        principalSchema: "finance",
                        principalTable: "Loans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaxDeclarationDetails",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TaxDeclarationId = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TaxAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    SequenceNumber = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_TaxDeclarationDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaxDeclarationDetails_TaxDeclarations_TaxDeclarationId",
                        column: x => x.TaxDeclarationId,
                        principalSchema: "finance",
                        principalTable: "TaxDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaxDeclarationPayments",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TaxDeclarationId = table.Column<int>(type: "integer", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: false),
                    ReceiptNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BankTransactionId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_TaxDeclarationPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaxDeclarationPayments_TaxDeclarations_TaxDeclarationId",
                        column: x => x.TaxDeclarationId,
                        principalSchema: "finance",
                        principalTable: "TaxDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Budgets",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    FiscalYear = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodType = table.Column<int>(type: "integer", nullable: false),
                    TotalBudget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalBudgetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UsedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UsedAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CommittedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CommittedAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AvailableAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AvailableAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    RevisedBudget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    RevisedBudgetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    OriginalBudget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OriginalBudgetCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AllowOverrun = table.Column<bool>(type: "boolean", nullable: false),
                    RequireApprovalForOverrun = table.Column<bool>(type: "boolean", nullable: false),
                    WarningThreshold = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CriticalThreshold = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    AllowTransfer = table.Column<bool>(type: "boolean", nullable: false),
                    MaxTransferRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ParentBudgetId = table.Column<int>(type: "integer", nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    AccountCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    OwnerUserId = table.Column<int>(type: "integer", nullable: true),
                    OwnerUserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApproverUserId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevisionCount = table.Column<int>(type: "integer", nullable: false),
                    LastRevisionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_Budgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Budgets_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Budgets_Budgets_ParentBudgetId",
                        column: x => x.ParentBudgetId,
                        principalSchema: "finance",
                        principalTable: "Budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Budgets_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BudgetItems",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BudgetId = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    AccountCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    BudgetAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BudgetAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UsedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UsedAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_BudgetItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetItems_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BudgetItems_Budgets_BudgetId",
                        column: x => x.BudgetId,
                        principalSchema: "finance",
                        principalTable: "Budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BudgetItems_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BudgetTransfers",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TransferNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SourceBudgetId = table.Column<int>(type: "integer", nullable: false),
                    TargetBudgetId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RequestedByUserId = table.Column<int>(type: "integer", nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_BudgetTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetTransfers_Budgets_SourceBudgetId",
                        column: x => x.SourceBudgetId,
                        principalSchema: "finance",
                        principalTable: "Budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BudgetTransfers_Budgets_TargetBudgetId",
                        column: x => x.TargetBudgetId,
                        principalSchema: "finance",
                        principalTable: "Budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccountingPeriods",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FiscalYear = table.Column<int>(type: "integer", nullable: false),
                    PeriodNumber = table.Column<int>(type: "integer", nullable: false),
                    PeriodType = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsSoftClosed = table.Column<bool>(type: "boolean", nullable: false),
                    IsHardClosed = table.Column<bool>(type: "boolean", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    CloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedByUserId = table.Column<int>(type: "integer", nullable: true),
                    AllowSales = table.Column<bool>(type: "boolean", nullable: false),
                    AllowPurchases = table.Column<bool>(type: "boolean", nullable: false),
                    AllowInventory = table.Column<bool>(type: "boolean", nullable: false),
                    AllowJournalEntries = table.Column<bool>(type: "boolean", nullable: false),
                    AllowPayments = table.Column<bool>(type: "boolean", nullable: false),
                    AllowBankTransactions = table.Column<bool>(type: "boolean", nullable: false),
                    AllowAdjustments = table.Column<bool>(type: "boolean", nullable: false),
                    IsYearEndPeriod = table.Column<bool>(type: "boolean", nullable: false),
                    ClosingEntriesDone = table.Column<bool>(type: "boolean", nullable: false),
                    ClosingJournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    OpeningEntriesDone = table.Column<bool>(type: "boolean", nullable: false),
                    OpeningJournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    BalanceCarriedForward = table.Column<bool>(type: "boolean", nullable: false),
                    CarryForwardDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalJournalEntryCount = table.Column<int>(type: "integer", nullable: false),
                    TotalInvoiceCount = table.Column<int>(type: "integer", nullable: false),
                    TotalDebitAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalDebitAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    TotalCreditAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalCreditAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LastTransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsVatPeriod = table.Column<bool>(type: "boolean", nullable: false),
                    VatReturnFiled = table.Column<bool>(type: "boolean", nullable: false),
                    VatReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsProvisionalTaxPeriod = table.Column<bool>(type: "boolean", nullable: false),
                    ProvisionalTaxFiled = table.Column<bool>(type: "boolean", nullable: false),
                    ProvisionalTaxDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PreviousPeriodId = table.Column<int>(type: "integer", nullable: true),
                    NextPeriodId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_AccountingPeriods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountingPeriods_AccountingPeriods_NextPeriodId",
                        column: x => x.NextPeriodId,
                        principalSchema: "finance",
                        principalTable: "AccountingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountingPeriods_AccountingPeriods_PreviousPeriodId",
                        column: x => x.PreviousPeriodId,
                        principalSchema: "finance",
                        principalTable: "AccountingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntries",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntryNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EntryType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<int>(type: "integer", nullable: true),
                    TotalDebit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalDebitCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalCredit = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalCreditCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ApprovedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AccountingPeriodId = table.Column<int>(type: "integer", nullable: false),
                    IsAutoGenerated = table.Column<bool>(type: "boolean", nullable: false),
                    IsReversal = table.Column<bool>(type: "boolean", nullable: false),
                    ReversedEntryId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_JournalEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JournalEntries_AccountingPeriods_AccountingPeriodId",
                        column: x => x.AccountingPeriodId,
                        principalSchema: "finance",
                        principalTable: "AccountingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JournalEntries_JournalEntries_ReversedEntryId",
                        column: x => x.ReversedEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BankReconciliations",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReconciliationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BankAccountId = table.Column<int>(type: "integer", nullable: false),
                    PeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReconciliationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BankOpeningBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BankOpeningBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BankClosingBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BankClosingBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BankTotalCredits = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BankTotalCreditsCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BankTotalDebits = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BankTotalDebitsCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    StatementNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    StatementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SystemOpeningBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SystemOpeningBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SystemClosingBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SystemClosingBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SystemTotalCredits = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SystemTotalCreditsCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SystemTotalDebits = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SystemTotalDebitsCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BalanceDifference = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceDifferenceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    IsReconciled = table.Column<bool>(type: "boolean", nullable: false),
                    MatchedTransactionCount = table.Column<int>(type: "integer", nullable: false),
                    UnmatchedBankItemsCount = table.Column<int>(type: "integer", nullable: false),
                    UnmatchedSystemItemsCount = table.Column<int>(type: "integer", nullable: false),
                    MatchedTotalAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MatchedTotalAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UnmatchedBankAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnmatchedBankAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UnmatchedSystemAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnmatchedSystemAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NeedsAdjustmentEntry = table.Column<bool>(type: "boolean", nullable: false),
                    AdjustmentEntryCreated = table.Column<bool>(type: "boolean", nullable: false),
                    AdjustmentJournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    TotalAdjustmentAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalAdjustmentAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    PreparedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_BankReconciliations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankReconciliations_BankAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BankReconciliations_JournalEntries_AdjustmentJournalEntryId",
                        column: x => x.AdjustmentJournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InvoiceNumber = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Series = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssueTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    InvoiceType = table.Column<int>(type: "integer", nullable: false),
                    EInvoiceType = table.Column<int>(type: "integer", nullable: false),
                    Scenario = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: false),
                    CurrentAccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TaxNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    IdentityNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BillingDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DeliveryAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DeliveryDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeliveryCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeliveryCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LineExtensionAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    LineExtensionAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    GrossAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    GrossAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalDiscount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalDiscountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NetAmountBeforeTax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetAmountBeforeTaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    VatWithholdingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatWithholdingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalOtherTaxes = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TotalOtherTaxesCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    WithholdingTaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    WithholdingTaxAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    GrandTotal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    GrandTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    GrandTotalTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    GrandTotalTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PaidAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: true),
                    PaymentTerms = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PaymentNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    GibUuid = table.Column<Guid>(type: "uuid", nullable: true),
                    GibEnvelopeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GibStatusCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    GibStatusDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    GibSendDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GibResponseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceiverAlias = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SignatureCertificateSerial = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SignatureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApplyVatWithholding = table.Column<bool>(type: "boolean", nullable: false),
                    VatWithholdingRate = table.Column<int>(type: "integer", nullable: false),
                    WithholdingCode = table.Column<int>(type: "integer", nullable: true),
                    WithholdingReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    HasVatExemption = table.Column<bool>(type: "boolean", nullable: false),
                    VatExemptionReason = table.Column<int>(type: "integer", nullable: true),
                    VatExemptionDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    WaybillNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    WaybillDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RelatedInvoiceId = table.Column<int>(type: "integer", nullable: true),
                    RelatedInvoiceNumber = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    SalesOrderId = table.Column<int>(type: "integer", nullable: true),
                    PurchaseOrderId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PdfFilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    XmlFilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsPrinted = table.Column<bool>(type: "boolean", nullable: false),
                    PrintCount = table.Column<int>(type: "integer", nullable: false),
                    IsEmailSent = table.Column<bool>(type: "boolean", nullable: false),
                    EmailSendDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invoices_Invoices_RelatedInvoiceId",
                        column: x => x.RelatedInvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Invoices_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntryLines",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    DebitAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DebitAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    CreditAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CreditAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    AccountId1 = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_JournalEntryLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JournalEntryLines_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JournalEntryLines_Accounts_AccountId1",
                        column: x => x.AccountId1,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JournalEntryLines_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_JournalEntryLines_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_JournalEntryLines_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FixedAssets",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Barcode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ModelNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AssetType = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    SubCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AccountGroup = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    AcquisitionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    InServiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarrantyEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DisposalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AcquisitionCost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AcquisitionCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CostValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CostValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SalvageValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SalvageValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DepreciableAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DepreciableAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AccumulatedDepreciation = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AccumulatedDepreciationCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NetBookValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetBookValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    RevaluationAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    RevaluationAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LastRevaluationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DepreciationMethod = table.Column<int>(type: "integer", nullable: false),
                    UsefulLifeYears = table.Column<int>(type: "integer", nullable: false),
                    UsefulLifeMonths = table.Column<int>(type: "integer", nullable: false),
                    DepreciationRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    RemainingUsefulLifeMonths = table.Column<int>(type: "integer", nullable: false),
                    DepreciationStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastDepreciationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPartialYearDepreciation = table.Column<bool>(type: "boolean", nullable: false),
                    DepreciationPeriod = table.Column<int>(type: "integer", nullable: false),
                    LocationId = table.Column<int>(type: "integer", nullable: true),
                    LocationName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    BranchId = table.Column<int>(type: "integer", nullable: true),
                    CustodianUserId = table.Column<int>(type: "integer", nullable: true),
                    CustodianName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    SupplierName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AssetAccountId = table.Column<int>(type: "integer", nullable: true),
                    AssetAccountCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AccumulatedDepreciationAccountId = table.Column<int>(type: "integer", nullable: true),
                    AccumulatedDepreciationAccountCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DepreciationExpenseAccountId = table.Column<int>(type: "integer", nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    DisposalType = table.Column<int>(type: "integer", nullable: true),
                    SaleAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    SaleAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    DisposalGainLoss = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DisposalGainLossCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    SaleInvoiceId = table.Column<int>(type: "integer", nullable: true),
                    BuyerId = table.Column<int>(type: "integer", nullable: true),
                    DisposalReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsInsured = table.Column<bool>(type: "boolean", nullable: false),
                    InsurancePolicyNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InsuranceCompany = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    InsuranceEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InsuranceValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    InsuranceValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsFullyDepreciated = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImagePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_FixedAssets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FixedAssets_Accounts_AccumulatedDepreciationAccountId",
                        column: x => x.AccumulatedDepreciationAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FixedAssets_Accounts_AssetAccountId",
                        column: x => x.AssetAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FixedAssets_Accounts_DepreciationExpenseAccountId",
                        column: x => x.DepreciationExpenseAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FixedAssets_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FixedAssets_CurrentAccounts_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FixedAssets_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceLines",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InvoiceId = table.Column<int>(type: "integer", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AdditionalDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    HsCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "ADET"),
                    UnitCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "C62"),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    LineTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    GrossAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    GrossAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NetAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    VatRate = table.Column<int>(type: "integer", nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AmountIncludingVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountIncludingVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    HasVatExemption = table.Column<bool>(type: "boolean", nullable: false),
                    VatExemptionReason = table.Column<int>(type: "integer", nullable: true),
                    VatExemptionDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ApplyWithholding = table.Column<bool>(type: "boolean", nullable: false),
                    WithholdingRate = table.Column<int>(type: "integer", nullable: false),
                    WithholdingCode = table.Column<int>(type: "integer", nullable: true),
                    WithholdingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    WithholdingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    SctRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    SctAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    SctAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    WarehouseId = table.Column<int>(type: "integer", nullable: true),
                    LotSerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrderLineId = table.Column<int>(type: "integer", nullable: true),
                    WaybillLineId = table.Column<int>(type: "integer", nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
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
                    table.PrimaryKey("PK_InvoiceLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceLines_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_InvoiceLines_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceTaxes",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InvoiceId = table.Column<int>(type: "integer", nullable: false),
                    TaxType = table.Column<int>(type: "integer", nullable: false),
                    TaxCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TaxName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TaxBase = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TaxBaseCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TaxAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ExemptionCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ExemptionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
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
                    table.PrimaryKey("PK_InvoiceTaxes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceTaxes_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FixedAssetDepreciations",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FixedAssetId = table.Column<int>(type: "integer", nullable: false),
                    Period = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DepreciationAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DepreciationAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AccumulatedDepreciation = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AccumulatedDepreciationCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NetBookValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetBookValueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    IsPosted = table.Column<bool>(type: "boolean", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_FixedAssetDepreciations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FixedAssetDepreciations_FixedAssets_FixedAssetId",
                        column: x => x.FixedAssetId,
                        principalSchema: "finance",
                        principalTable: "FixedAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FixedAssetDepreciations_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "FixedAssetMaintenances",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FixedAssetId = table.Column<int>(type: "integer", nullable: false),
                    MaintenanceType = table.Column<int>(type: "integer", nullable: false),
                    MaintenanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SupplierId = table.Column<int>(type: "integer", nullable: true),
                    Cost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NextMaintenanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_FixedAssetMaintenances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FixedAssetMaintenances_FixedAssets_FixedAssetId",
                        column: x => x.FixedAssetId,
                        principalSchema: "finance",
                        principalTable: "FixedAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FixedAssetMovements",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FixedAssetId = table.Column<int>(type: "integer", nullable: false),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FromLocationId = table.Column<int>(type: "integer", nullable: true),
                    ToLocationId = table.Column<int>(type: "integer", nullable: true),
                    FromDepartmentId = table.Column<int>(type: "integer", nullable: true),
                    ToDepartmentId = table.Column<int>(type: "integer", nullable: true),
                    FromCustodianId = table.Column<int>(type: "integer", nullable: true),
                    ToCustodianId = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_FixedAssetMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FixedAssetMovements_FixedAssets_FixedAssetId",
                        column: x => x.FixedAssetId,
                        principalSchema: "finance",
                        principalTable: "FixedAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BankReconciliationItems",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReconciliationId = table.Column<int>(type: "integer", nullable: false),
                    ItemType = table.Column<int>(type: "integer", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BankTransactionId = table.Column<int>(type: "integer", nullable: true),
                    Counterparty = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsMatched = table.Column<bool>(type: "boolean", nullable: false),
                    MatchedItemId = table.Column<int>(type: "integer", nullable: true),
                    MatchDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MatchType = table.Column<int>(type: "integer", nullable: true),
                    DifferenceAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DifferenceAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    NeedsCorrection = table.Column<bool>(type: "boolean", nullable: false),
                    CorrectionNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_BankReconciliationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankReconciliationItems_BankReconciliations_ReconciliationId",
                        column: x => x.ReconciliationId,
                        principalSchema: "finance",
                        principalTable: "BankReconciliations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BankTransactions",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BankAccountId = table.Column<int>(type: "integer", nullable: false),
                    TransactionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BankReceiptNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TransactionType = table.Column<int>(type: "integer", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Commission = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CommissionCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Bsmv = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BsmvCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NetAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BalanceAfter = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceAfterCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CounterpartyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CounterpartyIban = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: true),
                    CounterpartyBank = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CounterpartyTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<int>(type: "integer", nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    CheckId = table.Column<int>(type: "integer", nullable: true),
                    CashAccountId = table.Column<int>(type: "integer", nullable: true),
                    CounterBankAccountId = table.Column<int>(type: "integer", nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    IsMatched = table.Column<bool>(type: "boolean", nullable: false),
                    MatchingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MatchingNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsAutoMatched = table.Column<bool>(type: "boolean", nullable: false),
                    IsReconciled = table.Column<bool>(type: "boolean", nullable: false),
                    ReconciliationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsFromBankFeed = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_BankTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankTransactions_BankAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BankTransactions_BankAccounts_CounterBankAccountId",
                        column: x => x.CounterBankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BankTransactions_CashAccounts_CashAccountId",
                        column: x => x.CashAccountId,
                        principalSchema: "finance",
                        principalTable: "CashAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BankTransactions_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BankTransactions_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BankTransactions_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BankTransactions_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CashTransactions",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CashAccountId = table.Column<int>(type: "integer", nullable: false),
                    TransactionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TransactionType = table.Column<int>(type: "integer", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BalanceAfter = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BalanceAfterCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<int>(type: "integer", nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    ExpenseId = table.Column<int>(type: "integer", nullable: true),
                    BankAccountId = table.Column<int>(type: "integer", nullable: true),
                    CounterCashAccountId = table.Column<int>(type: "integer", nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    OperatorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OperatorTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    OperatorPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReceiptNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsReceiptPrinted = table.Column<bool>(type: "boolean", nullable: false),
                    ReceiptPrintDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsCancelled = table.Column<bool>(type: "boolean", nullable: false),
                    CancelDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_CashTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CashTransactions_BankAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CashTransactions_CashAccounts_CashAccountId",
                        column: x => x.CashAccountId,
                        principalSchema: "finance",
                        principalTable: "CashAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CashTransactions_CashAccounts_CounterCashAccountId",
                        column: x => x.CounterCashAccountId,
                        principalSchema: "finance",
                        principalTable: "CashAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CashTransactions_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CashTransactions_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CashTransactions_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CashTransactions_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CheckMovements",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CheckId = table.Column<int>(type: "integer", nullable: false),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_CheckMovements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Checks",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CheckNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PortfolioNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CheckType = table.Column<int>(type: "integer", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CollectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BankName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BranchName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BranchCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AccountNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Iban = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: true),
                    DrawerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DrawerTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    DrawerAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DrawerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BeneficiaryName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BeneficiaryTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    CurrentAccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsGivenToBank = table.Column<bool>(type: "boolean", nullable: false),
                    CollectionBankAccountId = table.Column<int>(type: "integer", nullable: true),
                    GivenToBankDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsEndorsed = table.Column<bool>(type: "boolean", nullable: false),
                    EndorsedToCurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    EndorsementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsGivenAsCollateral = table.Column<bool>(type: "boolean", nullable: false),
                    CollateralGivenTo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CollateralDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsBounced = table.Column<bool>(type: "boolean", nullable: false),
                    BouncedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BouncedReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsProtested = table.Column<bool>(type: "boolean", nullable: false),
                    ProtestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_Checks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Checks_BankAccounts_CollectionBankAccountId",
                        column: x => x.CollectionBankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Checks_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Checks_CurrentAccounts_EndorsedToCurrentAccountId",
                        column: x => x.EndorsedToCurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Checks_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CurrentAccountTransactions",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: false),
                    TransactionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TransactionType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DebitAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DebitAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreditAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreditAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    DebitAmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DebitAmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreditAmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreditAmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    RunningBalance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RunningBalanceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    CheckId = table.Column<int>(type: "integer", nullable: true),
                    PromissoryNoteId = table.Column<int>(type: "integer", nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    RemainingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CloseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsCancelled = table.Column<bool>(type: "boolean", nullable: false),
                    CancelDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    CurrentAccountId1 = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_CurrentAccountTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurrentAccountTransactions_Checks_CheckId",
                        column: x => x.CheckId,
                        principalSchema: "finance",
                        principalTable: "Checks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CurrentAccountTransactions_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CurrentAccountTransactions_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CurrentAccountTransactions_CurrentAccounts_CurrentAccountId1",
                        column: x => x.CurrentAccountId1,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CurrentAccountTransactions_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CurrentAccountTransactions_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExpenseNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ExpenseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecordDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    SubCategory = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DetailedDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    GrossAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    GrossAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    VatAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    VatAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    WithholdingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    WithholdingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NetAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    VatRate = table.Column<int>(type: "integer", nullable: false),
                    IsVatDeductible = table.Column<bool>(type: "boolean", nullable: false),
                    NonDeductibleVat = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    NonDeductibleVatCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    WithholdingType = table.Column<int>(type: "integer", nullable: true),
                    WithholdingRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    HasVatWithholding = table.Column<bool>(type: "boolean", nullable: false),
                    VatWithholdingAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    VatWithholdingAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    SupplierName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SupplierTaxNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    DocumentType = table.Column<int>(type: "integer", nullable: false),
                    DocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DocumentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    AttachmentPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    BankAccountId = table.Column<int>(type: "integer", nullable: true),
                    CashAccountId = table.Column<int>(type: "integer", nullable: true),
                    ExpenseAccountId = table.Column<int>(type: "integer", nullable: true),
                    ExpenseAccountCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    IsPostedToAccounting = table.Column<bool>(type: "boolean", nullable: false),
                    PostingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    VehicleId = table.Column<int>(type: "integer", nullable: true),
                    EmployeeId = table.Column<int>(type: "integer", nullable: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurrencePeriod = table.Column<int>(type: "integer", nullable: true),
                    RecurrenceStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RecurrenceEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ParentRecurringExpenseId = table.Column<int>(type: "integer", nullable: true),
                    BudgetItemId = table.Column<int>(type: "integer", nullable: true),
                    IsOverBudget = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovalStatus = table.Column<int>(type: "integer", nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CostCenterId1 = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Accounts_ExpenseAccountId",
                        column: x => x.ExpenseAccountId,
                        principalSchema: "finance",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_BankAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_CashAccounts_CashAccountId",
                        column: x => x.CashAccountId,
                        principalSchema: "finance",
                        principalTable: "CashAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_CostCenters_CostCenterId1",
                        column: x => x.CostCenterId1,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Expenses_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_Expenses_ParentRecurringExpenseId",
                        column: x => x.ParentRecurringExpenseId,
                        principalSchema: "finance",
                        principalTable: "Expenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PaymentAllocations",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PaymentId = table.Column<int>(type: "integer", nullable: false),
                    InvoiceId = table.Column<int>(type: "integer", nullable: false),
                    CurrentAccountTransactionId = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false, defaultValue: 1m),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AllocationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsAutoAllocated = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_PaymentAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentAllocations_CurrentAccountTransactions_CurrentAccoun~",
                        column: x => x.CurrentAccountTransactionId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccountTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PaymentAllocations_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PaymentNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: false),
                    CurrentAccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Commission = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CommissionCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    NetAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    NetAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    AllocatedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AllocatedAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UnallocatedAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnallocatedAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BankAccountId = table.Column<int>(type: "integer", nullable: true),
                    CashAccountId = table.Column<int>(type: "integer", nullable: true),
                    BankTransactionId = table.Column<int>(type: "integer", nullable: true),
                    CashTransactionId = table.Column<int>(type: "integer", nullable: true),
                    CheckId = table.Column<int>(type: "integer", nullable: true),
                    PromissoryNoteId = table.Column<int>(type: "integer", nullable: true),
                    IsPosTransaction = table.Column<bool>(type: "boolean", nullable: false),
                    CardNumberMasked = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: true),
                    CardholderName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AuthorizationCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    InstallmentCount = table.Column<int>(type: "integer", nullable: true),
                    PosReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReceiptNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CostCenterId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: true),
                    InvoiceId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_BankAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_BankTransactions_BankTransactionId",
                        column: x => x.BankTransactionId,
                        principalSchema: "finance",
                        principalTable: "BankTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_CashAccounts_CashAccountId",
                        column: x => x.CashAccountId,
                        principalSchema: "finance",
                        principalTable: "CashAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_CashTransactions_CashTransactionId",
                        column: x => x.CashTransactionId,
                        principalSchema: "finance",
                        principalTable: "CashTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_Checks_CheckId",
                        column: x => x.CheckId,
                        principalSchema: "finance",
                        principalTable: "Checks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_CostCenters_CostCenterId",
                        column: x => x.CostCenterId,
                        principalSchema: "finance",
                        principalTable: "CostCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "Invoices",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PromissoryNotes",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NoteNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PortfolioNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    NoteType = table.Column<int>(type: "integer", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssuePlace = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CollectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    AmountTRY = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTRYCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DebtorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DebtorTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    DebtorAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DebtorPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreditorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreditorTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    GuarantorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    GuarantorTaxId = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    GuarantorAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    CurrentAccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsGivenToBank = table.Column<bool>(type: "boolean", nullable: false),
                    CollectionBankAccountId = table.Column<int>(type: "integer", nullable: true),
                    GivenToBankDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DiscountAmountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    IsEndorsed = table.Column<bool>(type: "boolean", nullable: false),
                    EndorsedToCurrentAccountId = table.Column<int>(type: "integer", nullable: true),
                    EndorsementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsGivenAsCollateral = table.Column<bool>(type: "boolean", nullable: false),
                    CollateralGivenTo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CollateralDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsProtested = table.Column<bool>(type: "boolean", nullable: false),
                    ProtestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProtestReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    JournalEntryId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_PromissoryNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromissoryNotes_BankAccounts_CollectionBankAccountId",
                        column: x => x.CollectionBankAccountId,
                        principalSchema: "finance",
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PromissoryNotes_CurrentAccounts_CurrentAccountId",
                        column: x => x.CurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PromissoryNotes_CurrentAccounts_EndorsedToCurrentAccountId",
                        column: x => x.EndorsedToCurrentAccountId,
                        principalSchema: "finance",
                        principalTable: "CurrentAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PromissoryNotes_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "finance",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PromissoryNotes_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalSchema: "finance",
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PromissoryNoteMovements",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PromissoryNoteId = table.Column<int>(type: "integer", nullable: false),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_PromissoryNoteMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromissoryNoteMovements_PromissoryNotes_PromissoryNoteId",
                        column: x => x.PromissoryNoteId,
                        principalSchema: "finance",
                        principalTable: "PromissoryNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_ClosingJournalEntryId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "ClosingJournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_NextPeriodId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "NextPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_OpeningJournalEntryId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "OpeningJournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_PreviousPeriodId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "PreviousPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId_Code",
                schema: "finance",
                table: "AccountingPeriods",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId_FiscalYear",
                schema: "finance",
                table: "AccountingPeriods",
                columns: new[] { "TenantId", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId_FiscalYear_PeriodNumber",
                schema: "finance",
                table: "AccountingPeriods",
                columns: new[] { "TenantId", "FiscalYear", "PeriodNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId_IsActive",
                schema: "finance",
                table: "AccountingPeriods",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId_StartDate_EndDate",
                schema: "finance",
                table: "AccountingPeriods",
                columns: new[] { "TenantId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingPeriods_TenantId_Status",
                schema: "finance",
                table: "AccountingPeriods",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_LinkedBankAccountId",
                schema: "finance",
                table: "Accounts",
                column: "LinkedBankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_LinkedCashAccountId",
                schema: "finance",
                table: "Accounts",
                column: "LinkedCashAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_LinkedCurrentAccountId",
                schema: "finance",
                table: "Accounts",
                column: "LinkedCurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_ParentAccountId",
                schema: "finance",
                table: "Accounts",
                column: "ParentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId",
                schema: "finance",
                table: "Accounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_AccountType",
                schema: "finance",
                table: "Accounts",
                columns: new[] { "TenantId", "AccountType" });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_Code",
                schema: "finance",
                table: "Accounts",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_Name",
                schema: "finance",
                table: "Accounts",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsFormItems_BaBsFormId",
                schema: "finance",
                table: "BaBsFormItems",
                column: "BaBsFormId");

            migrationBuilder.CreateIndex(
                name: "IX_BaBsFormItems_TenantId",
                schema: "finance",
                table: "BaBsFormItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BaBsFormItems_TenantId_BaBsFormId_CounterpartyTaxId",
                schema: "finance",
                table: "BaBsFormItems",
                columns: new[] { "TenantId", "BaBsFormId", "CounterpartyTaxId" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsFormItems_TenantId_DocumentType",
                schema: "finance",
                table: "BaBsFormItems",
                columns: new[] { "TenantId", "DocumentType" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_AccountingPeriodId",
                schema: "finance",
                table: "BaBsForms",
                column: "AccountingPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_CorrectedFormId",
                schema: "finance",
                table: "BaBsForms",
                column: "CorrectedFormId");

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId",
                schema: "finance",
                table: "BaBsForms",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId_FilingDeadline",
                schema: "finance",
                table: "BaBsForms",
                columns: new[] { "TenantId", "FilingDeadline" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId_FormNumber",
                schema: "finance",
                table: "BaBsForms",
                columns: new[] { "TenantId", "FormNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId_FormType",
                schema: "finance",
                table: "BaBsForms",
                columns: new[] { "TenantId", "FormType" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId_IsCorrection",
                schema: "finance",
                table: "BaBsForms",
                columns: new[] { "TenantId", "IsCorrection" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId_PeriodYear_PeriodMonth",
                schema: "finance",
                table: "BaBsForms",
                columns: new[] { "TenantId", "PeriodYear", "PeriodMonth" });

            migrationBuilder.CreateIndex(
                name: "IX_BaBsForms_TenantId_Status",
                schema: "finance",
                table: "BaBsForms",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_AccountingAccountId",
                schema: "finance",
                table: "BankAccounts",
                column: "AccountingAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId",
                schema: "finance",
                table: "BankAccounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_AccountType",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "AccountType" });

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_Code",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_Currency",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "Currency" });

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_Iban",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "Iban" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_IsActive",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_IsDefault",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId_Name",
                schema: "finance",
                table: "BankAccounts",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliationItems_BankTransactionId",
                schema: "finance",
                table: "BankReconciliationItems",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliationItems_MatchedItemId",
                schema: "finance",
                table: "BankReconciliationItems",
                column: "MatchedItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliationItems_ReconciliationId",
                schema: "finance",
                table: "BankReconciliationItems",
                column: "ReconciliationId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliationItems_TenantId",
                schema: "finance",
                table: "BankReconciliationItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliationItems_TenantId_IsMatched",
                schema: "finance",
                table: "BankReconciliationItems",
                columns: new[] { "TenantId", "IsMatched" });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliationItems_TenantId_ItemType",
                schema: "finance",
                table: "BankReconciliationItems",
                columns: new[] { "TenantId", "ItemType" });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_AdjustmentJournalEntryId",
                schema: "finance",
                table: "BankReconciliations",
                column: "AdjustmentJournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_BankAccountId",
                schema: "finance",
                table: "BankReconciliations",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_TenantId",
                schema: "finance",
                table: "BankReconciliations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_TenantId_BankAccountId",
                schema: "finance",
                table: "BankReconciliations",
                columns: new[] { "TenantId", "BankAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_TenantId_PeriodStart_PeriodEnd",
                schema: "finance",
                table: "BankReconciliations",
                columns: new[] { "TenantId", "PeriodStart", "PeriodEnd" });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_TenantId_ReconciliationDate",
                schema: "finance",
                table: "BankReconciliations",
                columns: new[] { "TenantId", "ReconciliationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_TenantId_ReconciliationNumber",
                schema: "finance",
                table: "BankReconciliations",
                columns: new[] { "TenantId", "ReconciliationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_TenantId_Status",
                schema: "finance",
                table: "BankReconciliations",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_BankAccountId",
                schema: "finance",
                table: "BankTransactions",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_CashAccountId",
                schema: "finance",
                table: "BankTransactions",
                column: "CashAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_CheckId",
                schema: "finance",
                table: "BankTransactions",
                column: "CheckId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_CostCenterId",
                schema: "finance",
                table: "BankTransactions",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_CounterBankAccountId",
                schema: "finance",
                table: "BankTransactions",
                column: "CounterBankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_CurrentAccountId",
                schema: "finance",
                table: "BankTransactions",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_InvoiceId",
                schema: "finance",
                table: "BankTransactions",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_JournalEntryId",
                schema: "finance",
                table: "BankTransactions",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_PaymentId",
                schema: "finance",
                table: "BankTransactions",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId",
                schema: "finance",
                table: "BankTransactions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_BankAccountId",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "BankAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_Direction",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_IsMatched",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "IsMatched" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_IsReconciled",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "IsReconciled" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_Status",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_TransactionDate",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_TransactionNumber",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "TransactionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_TransactionType",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "TransactionType" });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_TenantId_ValueDate",
                schema: "finance",
                table: "BankTransactions",
                columns: new[] { "TenantId", "ValueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_AccountId",
                schema: "finance",
                table: "BudgetItems",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_BudgetId",
                schema: "finance",
                table: "BudgetItems",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_CostCenterId",
                schema: "finance",
                table: "BudgetItems",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_TenantId",
                schema: "finance",
                table: "BudgetItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_TenantId_BudgetId_Code",
                schema: "finance",
                table: "BudgetItems",
                columns: new[] { "TenantId", "BudgetId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetItems_TenantId_IsActive",
                schema: "finance",
                table: "BudgetItems",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_AccountId",
                schema: "finance",
                table: "Budgets",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_CostCenterId",
                schema: "finance",
                table: "Budgets",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_DepartmentId",
                schema: "finance",
                table: "Budgets",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_ParentBudgetId",
                schema: "finance",
                table: "Budgets",
                column: "ParentBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_ProjectId",
                schema: "finance",
                table: "Budgets",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId",
                schema: "finance",
                table: "Budgets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_Category",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_Code",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_FiscalYear",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_IsActive",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_IsLocked",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "IsLocked" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_Name",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_StartDate_EndDate",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_Status",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_TenantId_Type",
                schema: "finance",
                table: "Budgets",
                columns: new[] { "TenantId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTransfers_SourceBudgetId",
                schema: "finance",
                table: "BudgetTransfers",
                column: "SourceBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTransfers_TargetBudgetId",
                schema: "finance",
                table: "BudgetTransfers",
                column: "TargetBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTransfers_TenantId",
                schema: "finance",
                table: "BudgetTransfers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTransfers_TenantId_Status",
                schema: "finance",
                table: "BudgetTransfers",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTransfers_TenantId_TransferDate",
                schema: "finance",
                table: "BudgetTransfers",
                columns: new[] { "TenantId", "TransferDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTransfers_TenantId_TransferNumber",
                schema: "finance",
                table: "BudgetTransfers",
                columns: new[] { "TenantId", "TransferNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_AccountingAccountId",
                schema: "finance",
                table: "CashAccounts",
                column: "AccountingAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_BranchId",
                schema: "finance",
                table: "CashAccounts",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId",
                schema: "finance",
                table: "CashAccounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId_AccountType",
                schema: "finance",
                table: "CashAccounts",
                columns: new[] { "TenantId", "AccountType" });

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId_Code",
                schema: "finance",
                table: "CashAccounts",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId_Currency",
                schema: "finance",
                table: "CashAccounts",
                columns: new[] { "TenantId", "Currency" });

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId_IsActive",
                schema: "finance",
                table: "CashAccounts",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId_IsDefault",
                schema: "finance",
                table: "CashAccounts",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_TenantId_Name",
                schema: "finance",
                table: "CashAccounts",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_CashAccounts_WarehouseId",
                schema: "finance",
                table: "CashAccounts",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_BankAccountId",
                schema: "finance",
                table: "CashTransactions",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_CashAccountId",
                schema: "finance",
                table: "CashTransactions",
                column: "CashAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_CostCenterId",
                schema: "finance",
                table: "CashTransactions",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_CounterCashAccountId",
                schema: "finance",
                table: "CashTransactions",
                column: "CounterCashAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_CurrentAccountId",
                schema: "finance",
                table: "CashTransactions",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_ExpenseId",
                schema: "finance",
                table: "CashTransactions",
                column: "ExpenseId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_InvoiceId",
                schema: "finance",
                table: "CashTransactions",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_JournalEntryId",
                schema: "finance",
                table: "CashTransactions",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_PaymentId",
                schema: "finance",
                table: "CashTransactions",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId",
                schema: "finance",
                table: "CashTransactions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_CashAccountId",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "CashAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_Direction",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_IsCancelled",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "IsCancelled" });

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_Status",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_TransactionDate",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_TransactionNumber",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "TransactionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_TenantId_TransactionType",
                schema: "finance",
                table: "CashTransactions",
                columns: new[] { "TenantId", "TransactionType" });

            migrationBuilder.CreateIndex(
                name: "IX_CheckMovements_CheckId",
                schema: "finance",
                table: "CheckMovements",
                column: "CheckId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckMovements_TenantId",
                schema: "finance",
                table: "CheckMovements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckMovements_TenantId_MovementDate",
                schema: "finance",
                table: "CheckMovements",
                columns: new[] { "TenantId", "MovementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CheckMovements_TenantId_MovementType",
                schema: "finance",
                table: "CheckMovements",
                columns: new[] { "TenantId", "MovementType" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_CollectionBankAccountId",
                schema: "finance",
                table: "Checks",
                column: "CollectionBankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Checks_CurrentAccountId",
                schema: "finance",
                table: "Checks",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Checks_EndorsedToCurrentAccountId",
                schema: "finance",
                table: "Checks",
                column: "EndorsedToCurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Checks_JournalEntryId",
                schema: "finance",
                table: "Checks",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Checks_PaymentId",
                schema: "finance",
                table: "Checks",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId",
                schema: "finance",
                table: "Checks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_CheckNumber",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "CheckNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_CheckType",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "CheckType" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_Direction",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_DueDate",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_IsBounced",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "IsBounced" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_IsEndorsed",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "IsEndorsed" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_IsGivenToBank",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "IsGivenToBank" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_PortfolioNumber",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "PortfolioNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_RegistrationDate",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "RegistrationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Checks_TenantId_Status",
                schema: "finance",
                table: "Checks",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_AccountingAccountId",
                schema: "finance",
                table: "CostCenters",
                column: "AccountingAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_BranchId",
                schema: "finance",
                table: "CostCenters",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_DefaultExpenseAccountId",
                schema: "finance",
                table: "CostCenters",
                column: "DefaultExpenseAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_DepartmentId",
                schema: "finance",
                table: "CostCenters",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_ParentId",
                schema: "finance",
                table: "CostCenters",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId",
                schema: "finance",
                table: "CostCenters",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_Category",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_Code",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_IsActive",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_IsDefault",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_IsFrozen",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "IsFrozen" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_Name",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_ParentId",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "ParentId" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_Type",
                schema: "finance",
                table: "CostCenters",
                columns: new[] { "TenantId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId",
                schema: "finance",
                table: "Currencies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_IsActive",
                schema: "finance",
                table: "Currencies",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_IsBaseCurrency",
                schema: "finance",
                table: "Currencies",
                columns: new[] { "TenantId", "IsBaseCurrency" });

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_IsoCode",
                schema: "finance",
                table: "Currencies",
                columns: new[] { "TenantId", "IsoCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_SortOrder",
                schema: "finance",
                table: "Currencies",
                columns: new[] { "TenantId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_CrmCustomerId",
                schema: "finance",
                table: "CurrentAccounts",
                column: "CrmCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_PayableAccountId",
                schema: "finance",
                table: "CurrentAccounts",
                column: "PayableAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_PurchaseSupplierId",
                schema: "finance",
                table: "CurrentAccounts",
                column: "PurchaseSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_ReceivableAccountId",
                schema: "finance",
                table: "CurrentAccounts",
                column: "ReceivableAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_TenantId",
                schema: "finance",
                table: "CurrentAccounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_TenantId_AccountType",
                schema: "finance",
                table: "CurrentAccounts",
                columns: new[] { "TenantId", "AccountType" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_TenantId_Code",
                schema: "finance",
                table: "CurrentAccounts",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_TenantId_Name",
                schema: "finance",
                table: "CurrentAccounts",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_TenantId_Status",
                schema: "finance",
                table: "CurrentAccounts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccounts_TenantId_TaxNumber",
                schema: "finance",
                table: "CurrentAccounts",
                columns: new[] { "TenantId", "TaxNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_CheckId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "CheckId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_CostCenterId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_CurrentAccountId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_CurrentAccountId1",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "CurrentAccountId1");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_InvoiceId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_JournalEntryId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_PaymentId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_PromissoryNoteId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "PromissoryNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_ReferenceId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "ReferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_CurrentAccountId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "CurrentAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_DueDate",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_IsCancelled",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "IsCancelled" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_IsClosed",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "IsClosed" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_TransactionDate",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_TransactionNumber",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "TransactionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurrentAccountTransactions_TenantId_TransactionType",
                schema: "finance",
                table: "CurrentAccountTransactions",
                columns: new[] { "TenantId", "TransactionType" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustmentDetails_AccountId",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustmentDetails_ExchangeRateAdjustmentId",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                column: "ExchangeRateAdjustmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustmentDetails_SourceEntityId",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                column: "SourceEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustmentDetails_TenantId",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustmentDetails_TenantId_Direction",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustmentDetails_TenantId_SourceType",
                schema: "finance",
                table: "ExchangeRateAdjustmentDetails",
                columns: new[] { "TenantId", "SourceType" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_AccountingPeriodId",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                column: "AccountingPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_BankAccountId",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_CurrentAccountId",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_JournalEntryId",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId_AdjustmentNumber",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                columns: new[] { "TenantId", "AdjustmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId_Direction",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId_IsJournalized",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                columns: new[] { "TenantId", "IsJournalized" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId_Status",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId_ValuationDate",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                columns: new[] { "TenantId", "ValuationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateAdjustments_TenantId_ValuationType",
                schema: "finance",
                table: "ExchangeRateAdjustments",
                columns: new[] { "TenantId", "ValuationType" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId",
                schema: "finance",
                table: "ExchangeRates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_IsActive",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_IsDefaultForDate",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "IsDefaultForDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_IsTcmbRate",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "IsTcmbRate" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_RateDate",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "RateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_RateType",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "RateType" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_Source",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "Source" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_SourceCurrency_TargetCurrency_RateDa~",
                schema: "finance",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "SourceCurrency", "TargetCurrency", "RateDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ApprovalStatus",
                schema: "finance",
                table: "Expenses",
                column: "ApprovalStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_BankAccountId",
                schema: "finance",
                table: "Expenses",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CashAccountId",
                schema: "finance",
                table: "Expenses",
                column: "CashAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CostCenterId",
                schema: "finance",
                table: "Expenses",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CostCenterId1",
                schema: "finance",
                table: "Expenses",
                column: "CostCenterId1");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CurrentAccountId",
                schema: "finance",
                table: "Expenses",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ExpenseAccountId",
                schema: "finance",
                table: "Expenses",
                column: "ExpenseAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_InvoiceId",
                schema: "finance",
                table: "Expenses",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_IsPaid",
                schema: "finance",
                table: "Expenses",
                column: "IsPaid");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_JournalEntryId",
                schema: "finance",
                table: "Expenses",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ParentRecurringExpenseId",
                schema: "finance",
                table: "Expenses",
                column: "ParentRecurringExpenseId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_PaymentId",
                schema: "finance",
                table: "Expenses",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ProjectId",
                schema: "finance",
                table: "Expenses",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_TenantId",
                schema: "finance",
                table: "Expenses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_TenantId_Category",
                schema: "finance",
                table: "Expenses",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_TenantId_CurrentAccountId",
                schema: "finance",
                table: "Expenses",
                columns: new[] { "TenantId", "CurrentAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_TenantId_ExpenseDate",
                schema: "finance",
                table: "Expenses",
                columns: new[] { "TenantId", "ExpenseDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_TenantId_ExpenseNumber",
                schema: "finance",
                table: "Expenses",
                columns: new[] { "TenantId", "ExpenseNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_TenantId_Status",
                schema: "finance",
                table: "Expenses",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetDepreciations_FixedAssetId",
                schema: "finance",
                table: "FixedAssetDepreciations",
                column: "FixedAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetDepreciations_JournalEntryId",
                schema: "finance",
                table: "FixedAssetDepreciations",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetDepreciations_TenantId",
                schema: "finance",
                table: "FixedAssetDepreciations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetDepreciations_TenantId_FixedAssetId_Period",
                schema: "finance",
                table: "FixedAssetDepreciations",
                columns: new[] { "TenantId", "FixedAssetId", "Period" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetDepreciations_TenantId_IsPosted",
                schema: "finance",
                table: "FixedAssetDepreciations",
                columns: new[] { "TenantId", "IsPosted" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetDepreciations_TenantId_PeriodStart_PeriodEnd",
                schema: "finance",
                table: "FixedAssetDepreciations",
                columns: new[] { "TenantId", "PeriodStart", "PeriodEnd" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMaintenances_FixedAssetId",
                schema: "finance",
                table: "FixedAssetMaintenances",
                column: "FixedAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMaintenances_TenantId",
                schema: "finance",
                table: "FixedAssetMaintenances",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMaintenances_TenantId_IsCompleted",
                schema: "finance",
                table: "FixedAssetMaintenances",
                columns: new[] { "TenantId", "IsCompleted" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMaintenances_TenantId_MaintenanceDate",
                schema: "finance",
                table: "FixedAssetMaintenances",
                columns: new[] { "TenantId", "MaintenanceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMaintenances_TenantId_MaintenanceType",
                schema: "finance",
                table: "FixedAssetMaintenances",
                columns: new[] { "TenantId", "MaintenanceType" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMaintenances_TenantId_NextMaintenanceDate",
                schema: "finance",
                table: "FixedAssetMaintenances",
                columns: new[] { "TenantId", "NextMaintenanceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMovements_FixedAssetId",
                schema: "finance",
                table: "FixedAssetMovements",
                column: "FixedAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMovements_TenantId",
                schema: "finance",
                table: "FixedAssetMovements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMovements_TenantId_MovementDate",
                schema: "finance",
                table: "FixedAssetMovements",
                columns: new[] { "TenantId", "MovementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssetMovements_TenantId_MovementType",
                schema: "finance",
                table: "FixedAssetMovements",
                columns: new[] { "TenantId", "MovementType" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_AccumulatedDepreciationAccountId",
                schema: "finance",
                table: "FixedAssets",
                column: "AccumulatedDepreciationAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_AssetAccountId",
                schema: "finance",
                table: "FixedAssets",
                column: "AssetAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_Barcode",
                schema: "finance",
                table: "FixedAssets",
                column: "Barcode");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_CostCenterId",
                schema: "finance",
                table: "FixedAssets",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_CustodianUserId",
                schema: "finance",
                table: "FixedAssets",
                column: "CustodianUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_DepartmentId",
                schema: "finance",
                table: "FixedAssets",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_DepreciationExpenseAccountId",
                schema: "finance",
                table: "FixedAssets",
                column: "DepreciationExpenseAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_InvoiceId",
                schema: "finance",
                table: "FixedAssets",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_LocationId",
                schema: "finance",
                table: "FixedAssets",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_SerialNumber",
                schema: "finance",
                table: "FixedAssets",
                column: "SerialNumber");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_SupplierId",
                schema: "finance",
                table: "FixedAssets",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId",
                schema: "finance",
                table: "FixedAssets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_AcquisitionDate",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "AcquisitionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_AssetType",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "AssetType" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_Category",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_Code",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_IsActive",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_IsFullyDepreciated",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "IsFullyDepreciated" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_Name",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_FixedAssets_TenantId_Status",
                schema: "finance",
                table: "FixedAssets",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_CurrentAccountId",
                schema: "finance",
                table: "InstallmentPlans",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_InvoiceId",
                schema: "finance",
                table: "InstallmentPlans",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId",
                schema: "finance",
                table: "InstallmentPlans",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId_Direction",
                schema: "finance",
                table: "InstallmentPlans",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId_EndDate",
                schema: "finance",
                table: "InstallmentPlans",
                columns: new[] { "TenantId", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId_PlanNumber",
                schema: "finance",
                table: "InstallmentPlans",
                columns: new[] { "TenantId", "PlanNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId_PlanType",
                schema: "finance",
                table: "InstallmentPlans",
                columns: new[] { "TenantId", "PlanType" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId_StartDate",
                schema: "finance",
                table: "InstallmentPlans",
                columns: new[] { "TenantId", "StartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPlans_TenantId_Status",
                schema: "finance",
                table: "InstallmentPlans",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Installments_BankTransactionId",
                schema: "finance",
                table: "Installments",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Installments_InstallmentPlanId",
                schema: "finance",
                table: "Installments",
                column: "InstallmentPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Installments_PaymentId",
                schema: "finance",
                table: "Installments",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Installments_TenantId",
                schema: "finance",
                table: "Installments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Installments_TenantId_DueDate",
                schema: "finance",
                table: "Installments",
                columns: new[] { "TenantId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Installments_TenantId_InstallmentPlanId_InstallmentNumber",
                schema: "finance",
                table: "Installments",
                columns: new[] { "TenantId", "InstallmentPlanId", "InstallmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Installments_TenantId_IsPaid",
                schema: "finance",
                table: "Installments",
                columns: new[] { "TenantId", "IsPaid" });

            migrationBuilder.CreateIndex(
                name: "IX_Installments_TenantId_IsPartiallyPaid",
                schema: "finance",
                table: "Installments",
                columns: new[] { "TenantId", "IsPartiallyPaid" });

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_CostCenterId",
                schema: "finance",
                table: "InvoiceLines",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_InvoiceId",
                schema: "finance",
                table: "InvoiceLines",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_OrderLineId",
                schema: "finance",
                table: "InvoiceLines",
                column: "OrderLineId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_ProductCode",
                schema: "finance",
                table: "InvoiceLines",
                column: "ProductCode");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_ProductId",
                schema: "finance",
                table: "InvoiceLines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_TenantId",
                schema: "finance",
                table: "InvoiceLines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_TenantId_InvoiceId_LineNumber",
                schema: "finance",
                table: "InvoiceLines",
                columns: new[] { "TenantId", "InvoiceId", "LineNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_WarehouseId",
                schema: "finance",
                table: "InvoiceLines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_WaybillLineId",
                schema: "finance",
                table: "InvoiceLines",
                column: "WaybillLineId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CurrentAccountId",
                schema: "finance",
                table: "Invoices",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_DueDate",
                schema: "finance",
                table: "Invoices",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_GibUuid",
                schema: "finance",
                table: "Invoices",
                column: "GibUuid");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_JournalEntryId",
                schema: "finance",
                table: "Invoices",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_RelatedInvoiceId",
                schema: "finance",
                table: "Invoices",
                column: "RelatedInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId",
                schema: "finance",
                table: "Invoices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_CurrentAccountId",
                schema: "finance",
                table: "Invoices",
                columns: new[] { "TenantId", "CurrentAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_InvoiceDate",
                schema: "finance",
                table: "Invoices",
                columns: new[] { "TenantId", "InvoiceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_InvoiceNumber",
                schema: "finance",
                table: "Invoices",
                columns: new[] { "TenantId", "InvoiceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_InvoiceType",
                schema: "finance",
                table: "Invoices",
                columns: new[] { "TenantId", "InvoiceType" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_Series_SequenceNumber",
                schema: "finance",
                table: "Invoices",
                columns: new[] { "TenantId", "Series", "SequenceNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_Status",
                schema: "finance",
                table: "Invoices",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTaxes_InvoiceId",
                schema: "finance",
                table: "InvoiceTaxes",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTaxes_TaxCode",
                schema: "finance",
                table: "InvoiceTaxes",
                column: "TaxCode");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTaxes_TenantId",
                schema: "finance",
                table: "InvoiceTaxes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTaxes_TenantId_InvoiceId_TaxType",
                schema: "finance",
                table: "InvoiceTaxes",
                columns: new[] { "TenantId", "InvoiceId", "TaxType" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_AccountingPeriodId",
                schema: "finance",
                table: "JournalEntries",
                column: "AccountingPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ReferenceId",
                schema: "finance",
                table: "JournalEntries",
                column: "ReferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ReversedEntryId",
                schema: "finance",
                table: "JournalEntries",
                column: "ReversedEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId",
                schema: "finance",
                table: "JournalEntries",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId_EntryDate",
                schema: "finance",
                table: "JournalEntries",
                columns: new[] { "TenantId", "EntryDate" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId_EntryNumber",
                schema: "finance",
                table: "JournalEntries",
                columns: new[] { "TenantId", "EntryNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId_EntryType",
                schema: "finance",
                table: "JournalEntries",
                columns: new[] { "TenantId", "EntryType" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId_IsAutoGenerated",
                schema: "finance",
                table: "JournalEntries",
                columns: new[] { "TenantId", "IsAutoGenerated" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId_IsReversal",
                schema: "finance",
                table: "JournalEntries",
                columns: new[] { "TenantId", "IsReversal" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TenantId_Status",
                schema: "finance",
                table: "JournalEntries",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_AccountId",
                schema: "finance",
                table: "JournalEntryLines",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_AccountId1",
                schema: "finance",
                table: "JournalEntryLines",
                column: "AccountId1");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_CostCenterId",
                schema: "finance",
                table: "JournalEntryLines",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_CurrentAccountId",
                schema: "finance",
                table: "JournalEntryLines",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_JournalEntryId",
                schema: "finance",
                table: "JournalEntryLines",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_ProjectId",
                schema: "finance",
                table: "JournalEntryLines",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_TenantId",
                schema: "finance",
                table: "JournalEntryLines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_TenantId_JournalEntryId_LineNumber",
                schema: "finance",
                table: "JournalEntryLines",
                columns: new[] { "TenantId", "JournalEntryId", "LineNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanPayments_BankTransactionId",
                schema: "finance",
                table: "LoanPayments",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanPayments_LoanId",
                schema: "finance",
                table: "LoanPayments",
                column: "LoanId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanPayments_TenantId",
                schema: "finance",
                table: "LoanPayments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanPayments_TenantId_PaymentDate",
                schema: "finance",
                table: "LoanPayments",
                columns: new[] { "TenantId", "PaymentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanPayments_TenantId_PaymentType",
                schema: "finance",
                table: "LoanPayments",
                columns: new[] { "TenantId", "PaymentType" });

            migrationBuilder.CreateIndex(
                name: "IX_Loans_BankAccountId",
                schema: "finance",
                table: "Loans",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_LenderId",
                schema: "finance",
                table: "Loans",
                column: "LenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId",
                schema: "finance",
                table: "Loans",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId_EndDate",
                schema: "finance",
                table: "Loans",
                columns: new[] { "TenantId", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId_LoanNumber",
                schema: "finance",
                table: "Loans",
                columns: new[] { "TenantId", "LoanNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId_LoanType",
                schema: "finance",
                table: "Loans",
                columns: new[] { "TenantId", "LoanType" });

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId_StartDate",
                schema: "finance",
                table: "Loans",
                columns: new[] { "TenantId", "StartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId_Status",
                schema: "finance",
                table: "Loans",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Loans_TenantId_SubType",
                schema: "finance",
                table: "Loans",
                columns: new[] { "TenantId", "SubType" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanSchedules_LoanId",
                schema: "finance",
                table: "LoanSchedules",
                column: "LoanId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanSchedules_TenantId",
                schema: "finance",
                table: "LoanSchedules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanSchedules_TenantId_DueDate",
                schema: "finance",
                table: "LoanSchedules",
                columns: new[] { "TenantId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanSchedules_TenantId_IsPaid",
                schema: "finance",
                table: "LoanSchedules",
                columns: new[] { "TenantId", "IsPaid" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanSchedules_TenantId_LoanId_InstallmentNumber",
                schema: "finance",
                table: "LoanSchedules",
                columns: new[] { "TenantId", "LoanId", "InstallmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_AllocationDate",
                schema: "finance",
                table: "PaymentAllocations",
                column: "AllocationDate");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_CurrentAccountTransactionId",
                schema: "finance",
                table: "PaymentAllocations",
                column: "CurrentAccountTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_InvoiceId",
                schema: "finance",
                table: "PaymentAllocations",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_PaymentId",
                schema: "finance",
                table: "PaymentAllocations",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_TenantId",
                schema: "finance",
                table: "PaymentAllocations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_TenantId_PaymentId_InvoiceId",
                schema: "finance",
                table: "PaymentAllocations",
                columns: new[] { "TenantId", "PaymentId", "InvoiceId" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BankAccountId",
                schema: "finance",
                table: "Payments",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BankTransactionId",
                schema: "finance",
                table: "Payments",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CashAccountId",
                schema: "finance",
                table: "Payments",
                column: "CashAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CashTransactionId",
                schema: "finance",
                table: "Payments",
                column: "CashTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CheckId",
                schema: "finance",
                table: "Payments",
                column: "CheckId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CostCenterId",
                schema: "finance",
                table: "Payments",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CurrentAccountId",
                schema: "finance",
                table: "Payments",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceId",
                schema: "finance",
                table: "Payments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_JournalEntryId",
                schema: "finance",
                table: "Payments",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PromissoryNoteId",
                schema: "finance",
                table: "Payments",
                column: "PromissoryNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId",
                schema: "finance",
                table: "Payments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId_CurrentAccountId",
                schema: "finance",
                table: "Payments",
                columns: new[] { "TenantId", "CurrentAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId_Direction",
                schema: "finance",
                table: "Payments",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId_PaymentDate",
                schema: "finance",
                table: "Payments",
                columns: new[] { "TenantId", "PaymentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId_PaymentNumber",
                schema: "finance",
                table: "Payments",
                columns: new[] { "TenantId", "PaymentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId_PaymentType",
                schema: "finance",
                table: "Payments",
                columns: new[] { "TenantId", "PaymentType" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId_Status",
                schema: "finance",
                table: "Payments",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNoteMovements_PromissoryNoteId",
                schema: "finance",
                table: "PromissoryNoteMovements",
                column: "PromissoryNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNoteMovements_TenantId",
                schema: "finance",
                table: "PromissoryNoteMovements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNoteMovements_TenantId_MovementDate",
                schema: "finance",
                table: "PromissoryNoteMovements",
                columns: new[] { "TenantId", "MovementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNoteMovements_TenantId_MovementType",
                schema: "finance",
                table: "PromissoryNoteMovements",
                columns: new[] { "TenantId", "MovementType" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_CollectionBankAccountId",
                schema: "finance",
                table: "PromissoryNotes",
                column: "CollectionBankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_CurrentAccountId",
                schema: "finance",
                table: "PromissoryNotes",
                column: "CurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_EndorsedToCurrentAccountId",
                schema: "finance",
                table: "PromissoryNotes",
                column: "EndorsedToCurrentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_JournalEntryId",
                schema: "finance",
                table: "PromissoryNotes",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_PaymentId",
                schema: "finance",
                table: "PromissoryNotes",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId",
                schema: "finance",
                table: "PromissoryNotes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_Direction",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_DueDate",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_IsEndorsed",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "IsEndorsed" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_IsGivenToBank",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "IsGivenToBank" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_IsProtested",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "IsProtested" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_NoteNumber",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "NoteNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_NoteType",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "NoteType" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_PortfolioNumber",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "PortfolioNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_RegistrationDate",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "RegistrationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PromissoryNotes_TenantId_Status",
                schema: "finance",
                table: "PromissoryNotes",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationDetails_TaxDeclarationId",
                schema: "finance",
                table: "TaxDeclarationDetails",
                column: "TaxDeclarationId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationDetails_TenantId",
                schema: "finance",
                table: "TaxDeclarationDetails",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationDetails_TenantId_TaxDeclarationId_Code",
                schema: "finance",
                table: "TaxDeclarationDetails",
                columns: new[] { "TenantId", "TaxDeclarationId", "Code" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationPayments_BankTransactionId",
                schema: "finance",
                table: "TaxDeclarationPayments",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationPayments_TaxDeclarationId",
                schema: "finance",
                table: "TaxDeclarationPayments",
                column: "TaxDeclarationId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationPayments_TenantId",
                schema: "finance",
                table: "TaxDeclarationPayments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationPayments_TenantId_PaymentDate",
                schema: "finance",
                table: "TaxDeclarationPayments",
                columns: new[] { "TenantId", "PaymentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarationPayments_TenantId_PaymentMethod",
                schema: "finance",
                table: "TaxDeclarationPayments",
                columns: new[] { "TenantId", "PaymentMethod" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_AccountId",
                schema: "finance",
                table: "TaxDeclarations",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_AccountingPeriodId",
                schema: "finance",
                table: "TaxDeclarations",
                column: "AccountingPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_AmendedDeclarationId",
                schema: "finance",
                table: "TaxDeclarations",
                column: "AmendedDeclarationId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId",
                schema: "finance",
                table: "TaxDeclarations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_DeclarationNumber",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "DeclarationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_DeclarationType",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "DeclarationType" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_FilingDeadline",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "FilingDeadline" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_IsAmendment",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "IsAmendment" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_PaymentDeadline",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "PaymentDeadline" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_Status",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_TaxYear",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "TaxYear" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_TaxYear_TaxMonth",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "TaxYear", "TaxMonth" });

            migrationBuilder.CreateIndex(
                name: "IX_TaxDeclarations_TenantId_TaxYear_TaxQuarter",
                schema: "finance",
                table: "TaxDeclarations",
                columns: new[] { "TenantId", "TaxYear", "TaxQuarter" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CostCenterId",
                schema: "finance",
                table: "Transactions",
                column: "CostCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CreditAccountId",
                schema: "finance",
                table: "Transactions",
                column: "CreditAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_DebitAccountId",
                schema: "finance",
                table: "Transactions",
                column: "DebitAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ProjectId",
                schema: "finance",
                table: "Transactions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ReferenceId",
                schema: "finance",
                table: "Transactions",
                column: "ReferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ReversedTransactionId",
                schema: "finance",
                table: "Transactions",
                column: "ReversedTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId",
                schema: "finance",
                table: "Transactions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId_IsReversed",
                schema: "finance",
                table: "Transactions",
                columns: new[] { "TenantId", "IsReversed" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId_TransactionDate",
                schema: "finance",
                table: "Transactions",
                columns: new[] { "TenantId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId_TransactionNumber",
                schema: "finance",
                table: "Transactions",
                columns: new[] { "TenantId", "TransactionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId_TransactionType",
                schema: "finance",
                table: "Transactions",
                columns: new[] { "TenantId", "TransactionType" });

            migrationBuilder.AddForeignKey(
                name: "FK_AccountingPeriods_JournalEntries_ClosingJournalEntryId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "ClosingJournalEntryId",
                principalSchema: "finance",
                principalTable: "JournalEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AccountingPeriods_JournalEntries_OpeningJournalEntryId",
                schema: "finance",
                table: "AccountingPeriods",
                column: "OpeningJournalEntryId",
                principalSchema: "finance",
                principalTable: "JournalEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BankReconciliationItems_BankTransactions_BankTransactionId",
                schema: "finance",
                table: "BankReconciliationItems",
                column: "BankTransactionId",
                principalSchema: "finance",
                principalTable: "BankTransactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransactions_Checks_CheckId",
                schema: "finance",
                table: "BankTransactions",
                column: "CheckId",
                principalSchema: "finance",
                principalTable: "Checks",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransactions_Payments_PaymentId",
                schema: "finance",
                table: "BankTransactions",
                column: "PaymentId",
                principalSchema: "finance",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_Expenses_ExpenseId",
                schema: "finance",
                table: "CashTransactions",
                column: "ExpenseId",
                principalSchema: "finance",
                principalTable: "Expenses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_Payments_PaymentId",
                schema: "finance",
                table: "CashTransactions",
                column: "PaymentId",
                principalSchema: "finance",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CheckMovements_Checks_CheckId",
                schema: "finance",
                table: "CheckMovements",
                column: "CheckId",
                principalSchema: "finance",
                principalTable: "Checks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Checks_Payments_PaymentId",
                schema: "finance",
                table: "Checks",
                column: "PaymentId",
                principalSchema: "finance",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CurrentAccountTransactions_Payments_PaymentId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "PaymentId",
                principalSchema: "finance",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CurrentAccountTransactions_PromissoryNotes_PromissoryNoteId",
                schema: "finance",
                table: "CurrentAccountTransactions",
                column: "PromissoryNoteId",
                principalSchema: "finance",
                principalTable: "PromissoryNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Payments_PaymentId",
                schema: "finance",
                table: "Expenses",
                column: "PaymentId",
                principalSchema: "finance",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentAllocations_Payments_PaymentId",
                schema: "finance",
                table: "PaymentAllocations",
                column: "PaymentId",
                principalSchema: "finance",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_PromissoryNotes_PromissoryNoteId",
                schema: "finance",
                table: "Payments",
                column: "PromissoryNoteId",
                principalSchema: "finance",
                principalTable: "PromissoryNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AccountingPeriods_JournalEntries_ClosingJournalEntryId",
                schema: "finance",
                table: "AccountingPeriods");

            migrationBuilder.DropForeignKey(
                name: "FK_AccountingPeriods_JournalEntries_OpeningJournalEntryId",
                schema: "finance",
                table: "AccountingPeriods");

            migrationBuilder.DropForeignKey(
                name: "FK_BankTransactions_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "BankTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Checks_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "Checks");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PromissoryNotes_JournalEntries_JournalEntryId",
                schema: "finance",
                table: "PromissoryNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_BankAccounts_Accounts_AccountingAccountId",
                schema: "finance",
                table: "BankAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CashAccounts_Accounts_AccountingAccountId",
                schema: "finance",
                table: "CashAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CostCenters_Accounts_AccountingAccountId",
                schema: "finance",
                table: "CostCenters");

            migrationBuilder.DropForeignKey(
                name: "FK_CostCenters_Accounts_DefaultExpenseAccountId",
                schema: "finance",
                table: "CostCenters");

            migrationBuilder.DropForeignKey(
                name: "FK_CurrentAccounts_Accounts_PayableAccountId",
                schema: "finance",
                table: "CurrentAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CurrentAccounts_Accounts_ReceivableAccountId",
                schema: "finance",
                table: "CurrentAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Accounts_ExpenseAccountId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_BankTransactions_BankTransactionId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_BankAccounts_BankAccountId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Checks_BankAccounts_CollectionBankAccountId",
                schema: "finance",
                table: "Checks");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_BankAccounts_BankAccountId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_BankAccounts_BankAccountId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PromissoryNotes_BankAccounts_CollectionBankAccountId",
                schema: "finance",
                table: "PromissoryNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_CashAccounts_CashAccountId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_CashAccounts_CounterCashAccountId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_CashAccounts_CashAccountId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_CashAccounts_CashAccountId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Checks_CheckId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_CostCenters_CostCenterId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_CostCenters_CostCenterId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_CostCenters_CostCenterId1",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_CostCenters_CostCenterId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_CurrentAccounts_CurrentAccountId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_CurrentAccounts_CurrentAccountId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_CurrentAccounts_CurrentAccountId",
                schema: "finance",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_CurrentAccounts_CurrentAccountId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PromissoryNotes_CurrentAccounts_CurrentAccountId",
                schema: "finance",
                table: "PromissoryNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_PromissoryNotes_CurrentAccounts_EndorsedToCurrentAccountId",
                schema: "finance",
                table: "PromissoryNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_Invoices_InvoiceId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Invoices_InvoiceId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Invoices_InvoiceId",
                schema: "finance",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_Payments_PaymentId",
                schema: "finance",
                table: "CashTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Payments_PaymentId",
                schema: "finance",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_PromissoryNotes_Payments_PaymentId",
                schema: "finance",
                table: "PromissoryNotes");

            migrationBuilder.DropTable(
                name: "BaBsFormItems",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BankReconciliationItems",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BudgetItems",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BudgetTransfers",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "CheckMovements",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Currencies",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "ExchangeRateAdjustmentDetails",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "ExchangeRates",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "FixedAssetDepreciations",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "FixedAssetMaintenances",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "FixedAssetMovements",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Installments",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "InvoiceLines",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "InvoiceTaxes",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "JournalEntryLines",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "LoanPayments",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "LoanSchedules",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "PaymentAllocations",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "PromissoryNoteMovements",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "TaxDeclarationDetails",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "TaxDeclarationPayments",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Transactions",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BaBsForms",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BankReconciliations",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Budgets",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "ExchangeRateAdjustments",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "FixedAssets",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "InstallmentPlans",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Loans",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "CurrentAccountTransactions",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "TaxDeclarations",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "JournalEntries",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "AccountingPeriods",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Accounts",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BankTransactions",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "BankAccounts",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "CashAccounts",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Checks",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "CostCenters",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "CurrentAccounts",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Invoices",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Payments",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "CashTransactions",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "PromissoryNotes",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Expenses",
                schema: "finance");
        }
    }
}
