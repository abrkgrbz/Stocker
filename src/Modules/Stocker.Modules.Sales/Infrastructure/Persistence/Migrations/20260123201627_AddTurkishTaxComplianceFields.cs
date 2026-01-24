using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTurkishTaxComplianceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerTaxIdType",
                schema: "sales",
                table: "Invoices",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerTaxOfficeCode",
                schema: "sales",
                table: "Invoices",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EArchiveDate",
                schema: "sales",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EArchiveNumber",
                schema: "sales",
                table: "Invoices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EArchiveStatus",
                schema: "sales",
                table: "Invoices",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EInvoiceErrorMessage",
                schema: "sales",
                table: "Invoices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EInvoiceStatus",
                schema: "sales",
                table: "Invoices",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GibUuid",
                schema: "sales",
                table: "Invoices",
                type: "character varying(36)",
                maxLength: 36,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasWithholdingTax",
                schema: "sales",
                table: "Invoices",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceSeries",
                schema: "sales",
                table: "Invoices",
                type: "character varying(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InvoiceYear",
                schema: "sales",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsEArchive",
                schema: "sales",
                table: "Invoices",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SequenceNumber",
                schema: "sales",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "WithholdingTaxAmount",
                schema: "sales",
                table: "Invoices",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "WithholdingTaxCode",
                schema: "sales",
                table: "Invoices",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WithholdingTaxRate",
                schema: "sales",
                table: "Invoices",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_EArchiveNumber",
                schema: "sales",
                table: "Invoices",
                columns: new[] { "TenantId", "EArchiveNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_GibUuid",
                schema: "sales",
                table: "Invoices",
                columns: new[] { "TenantId", "GibUuid" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_InvoiceSeries_InvoiceYear_SequenceNumber",
                schema: "sales",
                table: "Invoices",
                columns: new[] { "TenantId", "InvoiceSeries", "InvoiceYear", "SequenceNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_EArchiveNumber",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_GibUuid",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_InvoiceSeries_InvoiceYear_SequenceNumber",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "CustomerTaxIdType",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "CustomerTaxOfficeCode",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "EArchiveDate",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "EArchiveNumber",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "EArchiveStatus",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "EInvoiceErrorMessage",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "EInvoiceStatus",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "GibUuid",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "HasWithholdingTax",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "InvoiceSeries",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "InvoiceYear",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "IsEArchive",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "WithholdingTaxAmount",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "WithholdingTaxCode",
                schema: "sales",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "WithholdingTaxRate",
                schema: "sales",
                table: "Invoices");

        }
    }
}
