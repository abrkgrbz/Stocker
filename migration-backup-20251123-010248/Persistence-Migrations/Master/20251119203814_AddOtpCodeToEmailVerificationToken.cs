using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddOtpCodeToEmailVerificationToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationOtpCode",
                schema: "master",
                table: "MasterUsers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TenantSettings",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Timezone = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    DateFormat = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    TimeFormat = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    FiscalYearStart = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    WeekStart = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FaviconUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomFooter = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomCSS = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HideWatermark = table.Column<bool>(type: "bit", nullable: false),
                    EmailSettingsJson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NotificationSettingsJson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SecuritySettingsJson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ApiSettingsJson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    StorageSettingsJson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AdvancedSettingsJson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSettings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId",
                schema: "master",
                table: "TenantSettings",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantSettings",
                schema: "master");

            migrationBuilder.DropColumn(
                name: "EmailVerificationOtpCode",
                schema: "master",
                table: "MasterUsers");
        }
    }
}
