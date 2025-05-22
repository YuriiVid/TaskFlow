using System.Security.Claims;
using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/boards/{boardId}/columns")]
[Authorize]
[ApiController]
public class ColumnsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;

    public ColumnsController(AppDbContext context, IBoardValidationService boardValidator)
    {
        _boardValidationService = boardValidator;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BriefColumnDto>>> GetColumns(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());
        var columns = await _context.Columns.Include(c => c.Cards).Where(c => c.BoardId == boardId).ToListAsync();

        List<BriefColumnDto> briefColumns = columns
            .Select(c => new BriefColumnDto
            {
                Id = c.Id,
                Title = c.Title,
                Cards = c.Cards.Select(card => ResolveCardUrl(card, boardId)).ToList(),
            })
            .ToList();
        return Ok(briefColumns);
    }

    private string ResolveCardUrl(Card card, long boardId) =>
        Url.ActionLink(nameof(CardsController.GetCard), "Cards", new { boardId, cardId = card.Id });

    [HttpGet("{id}")]
    public async Task<ActionResult<FullColumnDto>> GetColumn(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var column = await _context
            .Columns.Include(c => c.Cards)
            .ThenInclude(card => card.Labels)
            .Include(c => c.Cards)
            .ThenInclude(card => card.Attachments)
            .Include(c => c.Cards)
            .ThenInclude(card => card.Comments)
            .Include(c => c.Cards)
            .ThenInclude(card => card.AssignedUsers)
            .Where(c => c.Id == id && c.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (column == null)
        {
            return NotFound("Column not found");
        }

        var fullColumn = new FullColumnDto
        {
            Id = column.Id,
            Title = column.Title,
            Cards = column
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
        };

        return Ok(fullColumn);
    }

    private string GetUserLink(AppUser user) =>
        Url.ActionLink(action: nameof(UsersController.GetUser), controller: "Users", values: new { id = user.Id });

    [HttpPost]
    public async Task<ActionResult<BriefColumnDto>> CreateColumn(long boardId, UpsertColumnDto dto)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());
        var maxPosition = await _context.Columns.Where(c => c.BoardId == boardId).MaxAsync(c => (int?)c.Position) ?? -1;
        var column = new Column
        {
            Title = dto.Title,
            BoardId = boardId,
            Position = maxPosition + 1,
        };

        _context.Columns.Add(column);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetColumn), new { boardId, id = column.Id }, new { column.Id, column.Title });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateColumn(long boardId, long id, UpsertColumnDto dto)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var column = await _context.Columns.Where(c => c.Id == id && c.BoardId == boardId).FirstOrDefaultAsync();

        if (column == null)
        {
            return NotFound("Column not found");
        }

        column.Title = dto.Title;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteColumn(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var column = await _context.Columns.Where(c => c.Id == id && c.BoardId == boardId).FirstOrDefaultAsync();

        if (column == null)
        {
            return NotFound("Column not found");
        }

        _context.Columns.Remove(column);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/move")]
    public async Task<ActionResult> MoveColumn(long boardId, long id, MoveColumnDto dto)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var columns = await _context.Columns.Where(c => c.BoardId == boardId).OrderBy(c => c.Position).ToListAsync();

        var column = columns.FirstOrDefault(c => c.Id == id);
        if (column == null)
            return NotFound("Column not found");

        int oldPos = column.Position;
        int newPos = dto.NewPosition ?? columns.Count - 1;

        if (oldPos != newPos)
        {
            columns.Remove(column);
            columns.Insert(Math.Clamp(newPos, 0, columns.Count), column);

            for (int i = 0; i < columns.Count; i++)
                columns[i].Position = i;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
