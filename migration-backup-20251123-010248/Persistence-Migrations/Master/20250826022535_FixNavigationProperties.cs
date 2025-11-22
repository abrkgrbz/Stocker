using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class FixNavigationProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserTenants_MasterUsers_MasterUserId",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropIndex(
                name: "IX_UserTenants_MasterUserId",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropColumn(
                name: "MasterUserId",
                schema: "master",
                table: "UserTenants");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MasterUserId",
                schema: "master",
                table: "UserTenants",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_MasterUserId",
                schema: "master",
                table: "UserTenants",
                column: "MasterUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserTenants_MasterUsers_MasterUserId",
                schema: "master",
                table: "UserTenants",
                column: "MasterUserId",
                principalSchema: "master",
                principalTable: "MasterUsers",
                principalColumn: "Id");
        }
    }
}
