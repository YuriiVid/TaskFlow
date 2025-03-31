using System.Security.Claims;
using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/boards/{boardId}/collumns")]
[Authorize]
[ApiController]
public class CollumnsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;

    public CollumnsController(AppDbContext context, IBoardValidationService boardValidator)
    {
        _boardValidationService = boardValidator;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BriefCollumnDto>>> GetCollumns(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());
        var collumns = await _context.Collumns.Include(c => c.Cards).Where(c => c.BoardId == boardId).ToListAsync();

        List<BriefCollumnDto> briefCollumns = collumns
            .Select(c => new BriefCollumnDto
            {
                Id = c.Id,
                Title = c.Title,
                Cards = c.Cards.Select(card => ResolveCardUrl(card, boardId)).ToList(),
            })
            .ToList();
        return Ok(briefCollumns);
    }

    private string ResolveCardUrl(Card card, long boardId) =>
        Url.ActionLink(nameof(CardsController.GetCard), "Cards", new { boardId, cardId = card.Id });

    [HttpGet("{id}")]
    public async Task<ActionResult<FullBoardDto>> GetCollumn(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var collumn = await _context
            .Collumns.Include(c => c.Cards)
            .ThenInclude(card => card.Labels)
            .Include(c => c.Cards)
            .ThenInclude(card => card.Attachments)
            .Include(c => c.Cards)
            .ThenInclude(card => card.Comments)
            .Include(c => c.Cards)
            .ThenInclude(card => card.AssignedUsers)
            .Where(c => c.Id == id && c.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (collumn == null)
        {
            return NotFound("Collumn not found");
        }

        var fullCollumn = new FullCollumnDto
        {
            Id = collumn.Id,
            Title = collumn.Title,
            Cards = collumn
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

        return Ok(fullCollumn);
    }

    private string GetUserLink(AppUser user) =>
        Url.ActionLink(action: nameof(UsersController.GetUser), controller: "Users", values: new { id = user.Id });

    [HttpPost]
    public async Task<ActionResult<BriefCollumnDto>> CreateCollumn(long boardId, UpsertCollumnDto dto)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var column = new Collumn { Title = dto.Title, BoardId = boardId };

        _context.Collumns.Add(column);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCollumn), new { boardId, id = column.Id }, new { column.Id, column.Title });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCollumn(long boardId, long id, UpsertCollumnDto dto)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var column = await _context.Collumns.Where(c => c.Id == id && c.BoardId == boardId).FirstOrDefaultAsync();

        if (column == null)
        {
            return NotFound("Column not found");
        }

        column.Title = dto.Title;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCollumn(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var column = await _context.Collumns.Where(c => c.Id == id && c.BoardId == boardId).FirstOrDefaultAsync();

        if (column == null)
        {
            return NotFound("Column not found");
        }

        _context.Collumns.Remove(column);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
