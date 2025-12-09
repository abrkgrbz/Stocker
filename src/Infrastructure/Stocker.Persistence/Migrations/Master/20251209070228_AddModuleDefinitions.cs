using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddModuleDefinitions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ModuleDefinitions",
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
                    IsCore = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModuleDependencies",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleDefinitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    DependentModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleDependencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModuleDependencies_ModuleDefinitions_ModuleDefinitionId",
                        column: x => x.ModuleDefinitionId,
                        principalSchema: "master",
                        principalTable: "ModuleDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModuleFeatures",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleDefinitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    FeatureName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModuleFeatures_ModuleDefinitions_ModuleDefinitionId",
                        column: x => x.ModuleDefinitionId,
                        principalSchema: "master",
                        principalTable: "ModuleDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModuleDefinitions_Code",
                schema: "master",
                table: "ModuleDefinitions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModuleDependencies_ModuleDefinitionId_DependentModuleCode",
                schema: "master",
                table: "ModuleDependencies",
                columns: new[] { "ModuleDefinitionId", "DependentModuleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModuleFeatures_ModuleDefinitionId",
                schema: "master",
                table: "ModuleFeatures",
                column: "ModuleDefinitionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ModuleDependencies",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ModuleFeatures",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ModuleDefinitions",
                schema: "master");
        }
    }
}
