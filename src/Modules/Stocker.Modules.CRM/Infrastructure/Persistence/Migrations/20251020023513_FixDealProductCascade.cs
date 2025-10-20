using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixDealProductCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Use raw SQL for idempotent migration (safe to run on databases that already have or don't have the duplicate FK)

            // Drop the duplicate foreign key (DealId1) if it exists
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.foreign_keys
                    WHERE name = 'FK_DealProducts_Deals_DealId1'
                    AND parent_object_id = OBJECT_ID('crm.DealProducts')
                )
                BEGIN
                    ALTER TABLE [crm].[DealProducts] DROP CONSTRAINT [FK_DealProducts_Deals_DealId1]
                END
            ");

            // Drop the duplicate DealId1 column if it exists
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID('crm.DealProducts')
                    AND name = 'DealId1'
                )
                BEGIN
                    ALTER TABLE [crm].[DealProducts] DROP COLUMN [DealId1]
                END
            ");

            // Drop and recreate the main DealId foreign key with NO ACTION instead of CASCADE
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.foreign_keys
                    WHERE name = 'FK_DealProducts_Deals_DealId'
                    AND parent_object_id = OBJECT_ID('crm.DealProducts')
                )
                BEGIN
                    ALTER TABLE [crm].[DealProducts] DROP CONSTRAINT [FK_DealProducts_Deals_DealId]
                END
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts",
                column: "DealId",
                principalSchema: "crm",
                principalTable: "Deals",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts");

            migrationBuilder.AddForeignKey(
                name: "FK_DealProducts_Deals_DealId",
                schema: "crm",
                table: "DealProducts",
                column: "DealId",
                principalSchema: "crm",
                principalTable: "Deals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
