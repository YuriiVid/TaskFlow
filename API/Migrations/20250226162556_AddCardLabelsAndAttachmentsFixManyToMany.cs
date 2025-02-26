using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddCardLabelsAndAttachmentsFixManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CardAssignments",
                table: "CardAssignments");

            migrationBuilder.DropIndex(
                name: "IX_CardAssignments_CardId_UserId",
                table: "CardAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BoardMembers",
                table: "BoardMembers");

            migrationBuilder.DropIndex(
                name: "IX_BoardMembers_BoardId_UserId",
                table: "BoardMembers");

            migrationBuilder.DropColumn(
                name: "TaskId",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "Attachments",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "ColumnId",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Labels",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "CardAssignments");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "BoardMembers");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CardAssignments",
                table: "CardAssignments",
                columns: new[] { "CardId", "UserId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_BoardMembers",
                table: "BoardMembers",
                columns: new[] { "BoardId", "UserId" });

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    CardId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attachments_Cards_CardId",
                        column: x => x.CardId,
                        principalTable: "Cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Labels",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Labels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CardLabels",
                columns: table => new
                {
                    CardId = table.Column<long>(type: "bigint", nullable: false),
                    LabelId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardLabels", x => new { x.CardId, x.LabelId });
                    table.ForeignKey(
                        name: "FK_CardLabels_Cards_CardId",
                        column: x => x.CardId,
                        principalTable: "Cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CardLabels_Labels_LabelId",
                        column: x => x.LabelId,
                        principalTable: "Labels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_CardId",
                table: "Attachments",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_CardLabels_LabelId",
                table: "CardLabels",
                column: "LabelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "CardLabels");

            migrationBuilder.DropTable(
                name: "Labels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CardAssignments",
                table: "CardAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BoardMembers",
                table: "BoardMembers");

            migrationBuilder.AddColumn<long>(
                name: "TaskId",
                table: "Comments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Attachments",
                table: "Cards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "ColumnId",
                table: "Cards",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Labels",
                table: "Cards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "Id",
                table: "CardAssignments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<long>(
                name: "Id",
                table: "BoardMembers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CardAssignments",
                table: "CardAssignments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BoardMembers",
                table: "BoardMembers",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_CardAssignments_CardId_UserId",
                table: "CardAssignments",
                columns: new[] { "CardId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BoardMembers_BoardId_UserId",
                table: "BoardMembers",
                columns: new[] { "BoardId", "UserId" },
                unique: true);
        }
    }
}
