using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Data.EF.Migrations
{
    /// <inheritdoc />
    public partial class addExerciseName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Exercises",
                newName: "ExerciseNameId");

            migrationBuilder.CreateTable(
                name: "ExerciseNames",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseNames", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_ExerciseNameId",
                table: "Exercises",
                column: "ExerciseNameId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_ExerciseNames_ExerciseNameId",
                table: "Exercises",
                column: "ExerciseNameId",
                principalTable: "ExerciseNames",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_ExerciseNames_ExerciseNameId",
                table: "Exercises");

            migrationBuilder.DropTable(
                name: "ExerciseNames");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_ExerciseNameId",
                table: "Exercises");

            migrationBuilder.RenameColumn(
                name: "ExerciseNameId",
                table: "Exercises",
                newName: "Name");
        }
    }
}
