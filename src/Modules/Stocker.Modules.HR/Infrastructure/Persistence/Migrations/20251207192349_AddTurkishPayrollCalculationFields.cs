using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.HR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTurkishPayrollCalculationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CumulativeGrossEarnings",
                schema: "hr",
                table: "Payrolls",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "EffectiveTaxRate",
                schema: "hr",
                table: "Payrolls",
                type: "numeric(5,4)",
                precision: 5,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MinWageExemption",
                schema: "hr",
                table: "Payrolls",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SgkBase",
                schema: "hr",
                table: "Payrolls",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "SgkCeilingApplied",
                schema: "hr",
                table: "Payrolls",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxBase",
                schema: "hr",
                table: "Payrolls",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "TaxBracket",
                schema: "hr",
                table: "Payrolls",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxBracketRate",
                schema: "hr",
                table: "Payrolls",
                type: "numeric(5,4)",
                precision: 5,
                scale: 4,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CumulativeGrossEarnings",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "EffectiveTaxRate",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "MinWageExemption",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "SgkBase",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "SgkCeilingApplied",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "TaxBase",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "TaxBracket",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "TaxBracketRate",
                schema: "hr",
                table: "Payrolls");
        }
    }
}
