using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class MakeSubscriptionPackageIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Packages_PackageId",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.AlterColumn<Guid>(
                name: "PackageId",
                schema: "master",
                table: "Subscriptions",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Packages_PackageId",
                schema: "master",
                table: "Subscriptions",
                column: "PackageId",
                principalSchema: "master",
                principalTable: "Packages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Packages_PackageId",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.AlterColumn<Guid>(
                name: "PackageId",
                schema: "master",
                table: "Subscriptions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Packages_PackageId",
                schema: "master",
                table: "Subscriptions",
                column: "PackageId",
                principalSchema: "master",
                principalTable: "Packages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
