using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddCmsEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "cms");

            migrationBuilder.CreateTable(
                name: "BlogCategories",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CmsMedia",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StoredFileName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: true),
                    Height = table.Column<int>(type: "integer", nullable: true),
                    AltText = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Folder = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UploadedById = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsageCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CmsMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CmsMedia_MasterUsers_UploadedById",
                        column: x => x.UploadedById,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CmsPages",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", maxLength: 256, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MetaTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FeaturedImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Views = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CmsPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CmsPages_MasterUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocItems",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Content = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocItems_DocItems_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "cms",
                        principalTable: "DocItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocItems_MasterUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BlogPosts",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Slug = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Content = table.Column<string>(type: "text", maxLength: 256, nullable: false),
                    Excerpt = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tags = table.Column<string>(type: "jsonb", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PublishDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FeaturedImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Views = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    MetaTitle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    MetaDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BlogPosts_BlogCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "cms",
                        principalTable: "BlogCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BlogPosts_MasterUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlogCategories_DisplayOrder",
                schema: "cms",
                table: "BlogCategories",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_BlogCategories_IsActive",
                schema: "cms",
                table: "BlogCategories",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_BlogCategories_Slug",
                schema: "cms",
                table: "BlogCategories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_AuthorId",
                schema: "cms",
                table: "BlogPosts",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_CategoryId",
                schema: "cms",
                table: "BlogPosts",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_CreatedAt",
                schema: "cms",
                table: "BlogPosts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_PublishDate",
                schema: "cms",
                table: "BlogPosts",
                column: "PublishDate");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_Slug",
                schema: "cms",
                table: "BlogPosts",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_Status",
                schema: "cms",
                table: "BlogPosts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_Status_PublishDate",
                schema: "cms",
                table: "BlogPosts",
                columns: new[] { "Status", "PublishDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CmsMedia_Folder",
                schema: "cms",
                table: "CmsMedia",
                column: "Folder");

            migrationBuilder.CreateIndex(
                name: "IX_CmsMedia_MimeType",
                schema: "cms",
                table: "CmsMedia",
                column: "MimeType");

            migrationBuilder.CreateIndex(
                name: "IX_CmsMedia_StoredFileName",
                schema: "cms",
                table: "CmsMedia",
                column: "StoredFileName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CmsMedia_Type",
                schema: "cms",
                table: "CmsMedia",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_CmsMedia_UploadedAt",
                schema: "cms",
                table: "CmsMedia",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CmsMedia_UploadedById",
                schema: "cms",
                table: "CmsMedia",
                column: "UploadedById");

            migrationBuilder.CreateIndex(
                name: "IX_CmsPages_AuthorId",
                schema: "cms",
                table: "CmsPages",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_CmsPages_CreatedAt",
                schema: "cms",
                table: "CmsPages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CmsPages_PublishedAt",
                schema: "cms",
                table: "CmsPages",
                column: "PublishedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CmsPages_Slug",
                schema: "cms",
                table: "CmsPages",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CmsPages_Status",
                schema: "cms",
                table: "CmsPages",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_AuthorId",
                schema: "cms",
                table: "DocItems",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_IsActive",
                schema: "cms",
                table: "DocItems",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_Order",
                schema: "cms",
                table: "DocItems",
                column: "Order");

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_ParentId",
                schema: "cms",
                table: "DocItems",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_ParentId_Order",
                schema: "cms",
                table: "DocItems",
                columns: new[] { "ParentId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_Slug",
                schema: "cms",
                table: "DocItems",
                column: "Slug");

            migrationBuilder.CreateIndex(
                name: "IX_DocItems_Type",
                schema: "cms",
                table: "DocItems",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlogPosts",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "CmsMedia",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "CmsPages",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "DocItems",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "BlogCategories",
                schema: "cms");
        }
    }
}
