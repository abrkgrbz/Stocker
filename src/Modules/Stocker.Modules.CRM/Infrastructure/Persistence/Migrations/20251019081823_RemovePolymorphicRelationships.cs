using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemovePolymorphicRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_Campaigns_ParentCampaignId1",
                schema: "crm",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_Campaigns_ParentCampaignId1",
                schema: "crm",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "RelatedEntityType",
                schema: "crm",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "ParentCampaignId1",
                schema: "crm",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                schema: "crm",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RelatedEntityType",
                schema: "crm",
                table: "Activities");

            migrationBuilder.AlterColumn<Guid>(
                name: "ParentCampaignId",
                schema: "crm",
                table: "Campaigns",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_ParentCampaignId",
                schema: "crm",
                table: "Campaigns",
                column: "ParentCampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_Campaigns_ParentCampaignId",
                schema: "crm",
                table: "Campaigns",
                column: "ParentCampaignId",
                principalSchema: "crm",
                principalTable: "Campaigns",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_Campaigns_ParentCampaignId",
                schema: "crm",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_Campaigns_ParentCampaignId",
                schema: "crm",
                table: "Campaigns");

            migrationBuilder.AddColumn<int>(
                name: "RelatedEntityId",
                schema: "crm",
                table: "Notes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityType",
                schema: "crm",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ParentCampaignId",
                schema: "crm",
                table: "Campaigns",
                type: "int",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentCampaignId1",
                schema: "crm",
                table: "Campaigns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RelatedEntityId",
                schema: "crm",
                table: "Activities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityType",
                schema: "crm",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_ParentCampaignId1",
                schema: "crm",
                table: "Campaigns",
                column: "ParentCampaignId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_Campaigns_ParentCampaignId1",
                schema: "crm",
                table: "Campaigns",
                column: "ParentCampaignId1",
                principalSchema: "crm",
                principalTable: "Campaigns",
                principalColumn: "Id");
        }
    }
}
