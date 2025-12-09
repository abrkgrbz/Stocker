using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddPricingEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AddOns",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MonthlyPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddOns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Industries",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Industries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StoragePlans",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StorageGB = table.Column<int>(type: "integer", nullable: false),
                    MonthlyPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoragePlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTiers",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MinUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    PricePerUserAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PricePerUserCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    BasePriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    BasePriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true, defaultValue: "TRY"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTiers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AddOnFeatures",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AddOnId = table.Column<Guid>(type: "uuid", nullable: false),
                    FeatureName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddOnFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AddOnFeatures_AddOns_AddOnId",
                        column: x => x.AddOnId,
                        principalSchema: "master",
                        principalTable: "AddOns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IndustryRecommendedModules",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IndustryId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IndustryRecommendedModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IndustryRecommendedModules_Industries_IndustryId",
                        column: x => x.IndustryId,
                        principalSchema: "master",
                        principalTable: "Industries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AddOnFeatures_AddOnId",
                schema: "master",
                table: "AddOnFeatures",
                column: "AddOnId");

            migrationBuilder.CreateIndex(
                name: "IX_AddOns_Code",
                schema: "master",
                table: "AddOns",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Industries_Code",
                schema: "master",
                table: "Industries",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IndustryRecommendedModules_IndustryId_ModuleCode",
                schema: "master",
                table: "IndustryRecommendedModules",
                columns: new[] { "IndustryId", "ModuleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoragePlans_Code",
                schema: "master",
                table: "StoragePlans",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTiers_Code",
                schema: "master",
                table: "UserTiers",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AddOnFeatures",
                schema: "master");

            migrationBuilder.DropTable(
                name: "IndustryRecommendedModules",
                schema: "master");

            migrationBuilder.DropTable(
                name: "StoragePlans",
                schema: "master");

            migrationBuilder.DropTable(
                name: "UserTiers",
                schema: "master");

            migrationBuilder.DropTable(
                name: "AddOns",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Industries",
                schema: "master");
        }
    }
}
