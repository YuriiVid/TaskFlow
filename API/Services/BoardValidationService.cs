using API.Exceptions;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class BoardValidationService : IBoardValidationService
{
    public async Task ValidateBoardAsync(AppDbContext context, long boardId, int userId)
    {
        var board = await context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == boardId);
        ValidateBoard(board, userId);
    }

    public void ValidateBoard(Board? board, int userId)
    {
        if (board == null)
        {
            throw new BoardNotFoundException("Board not found");
        }

        if (!board.Members.Any(m => m.UserId == userId))
        {
            throw new BoardAccessDeniedException("Access denied to the board");
        }
    }
}
