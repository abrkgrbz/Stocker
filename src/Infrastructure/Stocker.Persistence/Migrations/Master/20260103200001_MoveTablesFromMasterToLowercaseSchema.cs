using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <summary>
    /// No-op: Schema is now consistently "master" (lowercase) from initial migrations.
    /// Original purpose was to move tables from "Master" to "master" schema.
    /// </summary>
    public partial class MoveTablesFromMasterToLowercaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op: All migrations now use lowercase "master" schema consistently
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op
        }
    }
}
