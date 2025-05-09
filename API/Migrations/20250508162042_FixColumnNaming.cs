using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class FixColumnNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Cards_Collumns_CollumnId", table: "Cards");

            migrationBuilder.RenameTable(name: "Collumns", newName: "Columns");

            migrationBuilder.RenameColumn(name: "CollumnId", table: "Cards", newName: "ColumnId");

            migrationBuilder.RenameIndex(name: "IX_Cards_CollumnId", table: "Cards", newName: "IX_Cards_ColumnId");

            migrationBuilder.RenameIndex(name: "IX_Collumns_BoardId", table: "Columns", newName: "IX_Columns_BoardId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_Columns_ColumnId",
                table: "Cards",
                column: "ColumnId",
                principalTable: "Columns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Cards_Columns_ColumnId", table: "Cards");

            migrationBuilder.RenameTable(name: "Columns", newName: "Collumns");

            migrationBuilder.RenameColumn(name: "ColumnId", table: "Cards", newName: "CollumnId");

            migrationBuilder.RenameIndex(name: "IX_Cards_ColumnId", table: "Cards", newName: "IX_Cards_CollumnId");

            migrationBuilder.RenameIndex(name: "IX_Columns_BoardId", table: "Collumns", newName: "IX_Collumns_BoardId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_Collumns_CollumnId",
                table: "Cards",
                column: "CollumnId",
                principalTable: "Collumns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}
