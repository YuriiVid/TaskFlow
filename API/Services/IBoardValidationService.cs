using API.Models;

namespace API.Services;

public interface IBoardValidationService
{
    Task ValidateBoardAsync(AppDbContext context, long boardId, int userId);
    void ValidateBoard(Board? board, int userId);
}
