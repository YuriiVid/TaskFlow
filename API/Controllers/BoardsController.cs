using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/boards")]
[Authorize]
[ApiController]
public class BoardsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;

    public BoardsController(AppDbContext context, IBoardValidationService boardValidator)
    {
        _context = context;
        _boardValidationService = boardValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BriefBoardDto>>> GetBoards()
    {
        var boards = await _context
            .Boards.Include(b => b.Members)
            .Where(b => b.Members.Any(m => m.UserId == User.GetCurrentUserId()))
            .Select(b => new BriefBoardDto { Id = b.Id, Title = b.Title })
            .ToListAsync();

        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FullBoardDto>> GetBoard(long id)
    {
        var board = await _context
            .Boards.Include(b => b.Columns)
            .ThenInclude(col => col.Cards)
            .ThenInclude(c => c.Labels)
            .Include(b => b.Columns)
            .ThenInclude(col => col.Cards)
            .ThenInclude(c => c.AssignedUsers)
            .Include(b => b.Columns)
            .ThenInclude(col => col.Cards)
            .ThenInclude(c => c.Attachments)
            .Include(b => b.Columns)
            .ThenInclude(col => col.Cards)
            .ThenInclude(c => c.Comments)
            .Include(b => b.Members)
            .ThenInclude(m => m.User)
            .Where(b => b.Id == id)
            .FirstOrDefaultAsync();

        _boardValidationService.ValidateBoard(board, User.GetCurrentUserId());

        List<BoardMemberDto> boardMembers = board!
            .Members.Select(member => new BoardMemberDto
            {
                UserId = member.UserId,
                UserName = member.User.UserName,
                FirstName = member.User.FirstName,
                LastName = member.User.LastName,
                Role = member.Role.ToString(),
            })
            .ToList();

        List<FullColumnDto> boardColumns = board
            .Columns.Select(col => new FullColumnDto
            {
                Id = col.Id,
                Title = col.Title,
                Cards = col
                    .Cards.Select(card => new BriefCardDto
                    {
                        Id = card.Id,
                        Title = card.Title,
                        Labels = card
                            .Labels.Select(l => new LabelDto
                            {
                                Id = l.Id,
                                Title = l.Title,
                                Color = l.Color,
                            })
                            .ToList(),
                        AttachmentsCount = card.Attachments.Count,
                        DueDate = card.DueDate,
                        HasDescription = !string.IsNullOrEmpty(card.Description),
                        Position = card.Position,
                        AssignedTo = card.AssignedUsers.Select(GetUserLink).ToList(),
                        CommentsCount = card.Comments.Count,
                    })
                    .ToList(),
            })
            .ToList();

        var fullBoard = new FullBoardDto()
        {
            Id = board.Id,
            Title = board.Title,
            Description = board.Description,
            Columns = boardColumns,
            Members = boardMembers,
        };

        return Ok(fullBoard);
    }

    private string GetUserLink(AppUser user) =>
        Url.ActionLink(action: nameof(UsersController.GetUser), controller: "Users", values: new { id = user.Id });

    [HttpPost]
    public async Task<ActionResult> CreateBoard(UpsertBoardDto boardDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var board = new Board { Title = boardDto.Title, Description = boardDto.Description };
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        board.Members.Add(new BoardMember { UserId = currentUserId, Role = BoardMemberRole.Owner });
        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, new { board.Id, board.Title });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(long id, UpsertBoardDto boardDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var currentUserId = User.GetCurrentUserId();
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == id);
        _boardValidationService.ValidateBoard(board, currentUserId);

        var member = board!.Members.FirstOrDefault(m => m.UserId == currentUserId);
        if (member!.Role != BoardMemberRole.Admin && member.Role != BoardMemberRole.Owner)
        {
            return Forbid();
        }

        board.Title = boardDto.Title;
        board.Description = boardDto.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(long id)
    {
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == id);
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        var userRole = board!.Members.FirstOrDefault(m => m.UserId == currentUserId)!.Role;
        if (userRole != BoardMemberRole.Owner)
        {
            return Forbid();
        }

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
