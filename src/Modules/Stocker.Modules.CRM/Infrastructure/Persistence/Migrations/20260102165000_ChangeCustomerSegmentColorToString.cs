using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeCustomerSegmentColorToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Convert Color column from integer (enum) to string (hex color)
            // PostgreSQL syntax for column type change
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""CustomerSegments""
                ALTER COLUMN ""Color"" TYPE character varying(20)
                USING CASE
                    WHEN ""Color"" = 0 THEN '#1890ff'  -- Blue (default)
                    WHEN ""Color"" = 1 THEN '#52c41a'  -- Green
                    WHEN ""Color"" = 2 THEN '#faad14'  -- Yellow/Gold
                    WHEN ""Color"" = 3 THEN '#ff4d4f'  -- Red
                    WHEN ""Color"" = 4 THEN '#722ed1'  -- Purple
                    WHEN ""Color"" = 5 THEN '#13c2c2'  -- Cyan
                    WHEN ""Color"" = 6 THEN '#eb2f96'  -- Magenta
                    WHEN ""Color"" = 7 THEN '#fa8c16'  -- Orange
                    ELSE '#1890ff'  -- Default to Blue
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Convert Color column back from string to integer
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""CustomerSegments""
                ALTER COLUMN ""Color"" TYPE integer
                USING CASE
                    WHEN ""Color"" = '#1890ff' THEN 0
                    WHEN ""Color"" = '#52c41a' THEN 1
                    WHEN ""Color"" = '#faad14' THEN 2
                    WHEN ""Color"" = '#ff4d4f' THEN 3
                    WHEN ""Color"" = '#722ed1' THEN 4
                    WHEN ""Color"" = '#13c2c2' THEN 5
                    WHEN ""Color"" = '#eb2f96' THEN 6
                    WHEN ""Color"" = '#fa8c16' THEN 7
                    ELSE 0
                END;
            ");
        }
    }
}
