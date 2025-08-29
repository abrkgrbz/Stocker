using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class UserTenantRoleToUserType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserTenants_UserId",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropColumn(
                name: "Role",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDefault",
                schema: "master",
                table: "UserTenants",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "master",
                table: "UserTenants",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "UserType",
                schema: "master",
                table: "UserTenants",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_IsActive",
                schema: "master",
                table: "UserTenants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_TenantId",
                schema: "master",
                table: "UserTenants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserId_TenantId",
                schema: "master",
                table: "UserTenants",
                columns: new[] { "UserId", "TenantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserType",
                schema: "master",
                table: "UserTenants",
                column: "UserType");

            migrationBuilder.AddForeignKey(
                name: "FK_UserTenants_Tenants_TenantId",
                schema: "master",
                table: "UserTenants",
                column: "TenantId",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserTenants_Tenants_TenantId",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropIndex(
                name: "IX_UserTenants_IsActive",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropIndex(
                name: "IX_UserTenants_TenantId",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropIndex(
                name: "IX_UserTenants_UserId_TenantId",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropIndex(
                name: "IX_UserTenants_UserType",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.DropColumn(
                name: "UserType",
                schema: "master",
                table: "UserTenants");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDefault",
                schema: "master",
                table: "UserTenants",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "master",
                table: "UserTenants",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserId",
                schema: "master",
                table: "UserTenants",
                column: "UserId");
        }
    }
}
