using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using NodaTime;
using NodaTime.Text;

namespace API.Controllers;

[Route("api/boards/{boardId}/cards")]
[Authorize]
[ApiController]
public class CardsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;
    private readonly ILogger _logger;
    private readonly IMapper _mapper;

    public CardsController(
        AppDbContext context,
        IBoardValidationService boardValidator,
        ILogger<CardsController> logger,
        IMapper mapper
    )
    {
        _logger = logger;
        _boardValidationService = boardValidator;
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<BriefCardDto>>> GetCards(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var briefCards = await _context
            .Cards.AsNoTracking()
            .Where(c => c.Column.BoardId == boardId)
            .ProjectTo<BriefCardDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return Ok(briefCards);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FullCardDto>> GetCard(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());
        var fullCard = await _context
            .Cards.AsNoTracking()
            .Where(b => b.Id == id)
            .ProjectTo<FullCardDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        if (fullCard == null)
        {
            return NotFound("Card not found");
        }

        return Ok(fullCard);
    }

    [HttpPost]
    public async Task<ActionResult> CreateCard(long boardId, AddCardDto cardDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var maxPosition =
            await _context.Cards.Where(c => c.ColumnId == cardDto.ColumnId).MaxAsync(c => (int?)c.Position) ?? -1;

        var card = new Card
        {
            Title = cardDto.Title,
            ColumnId = cardDto.ColumnId,
            Position = maxPosition + 1,
        };

        _context.Cards.Add(card);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCard), new { boardId, id = card.Id }, card);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCard(long boardId, long id, UpdateCardDto cardDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context.Cards.Where(c => c.Id == id && c.Column.BoardId == boardId).FirstOrDefaultAsync();
        if (card == null)
        {
            return NotFound("Card not found");
        }

        card.Title = cardDto.Title;
        card.Description = cardDto.Description;
        card.DueDate = cardDto.DueDate;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchCard(long boardId, long id, JsonPatchDocument<UpdateCardDto> patchDoc)
    {
        if (patchDoc == null)
        {
            return BadRequest();
        }

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.Column)
            .Where(c => c.Id == id && c.Column.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (card == null)
        {
            return NotFound("Card not found");
        }

        var dto = _mapper.Map<UpdateCardDto>(card);
        var dueOp = patchDoc.Operations.FirstOrDefault(o =>
            o.path.Equals("/dueDate", StringComparison.OrdinalIgnoreCase)
        );
        if (dueOp != null && dueOp.value is string s)
        {
            var parse = InstantPattern.ExtendedIso.Parse(s);
            if (!parse.Success)
                ModelState.AddModelError("dueDate", "Invalid ISO‐8601 Instant");
            else
                dto.DueDate = parse.Value;

            patchDoc.Operations.Remove(dueOp);
        }

        patchDoc.ApplyTo(dto, ModelState);
        if (!TryValidateModel(dto))
        {
            return BadRequest(ModelState);
        }

        _mapper.Map(dto, card);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/move")]
    public async Task<IActionResult> MoveCard(long boardId, long id, MoveCardDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == id && c.Column.BoardId == boardId);

        if (card == null)
            return NotFound("Card not found");

        long oldColumn = card.ColumnId;
        int oldPos = card.Position;
        long newCol = dto.NewColumnId;

        if (oldColumn == newCol && dto.NewPosition == oldPos)
            return NoContent();

        var destCards = await _context.Cards.Where(c => c.ColumnId == newCol).OrderBy(c => c.Position).ToListAsync();

        int newPos = dto.NewPosition ?? destCards.LastOrDefault()?.Position + 1 ?? 0;

        if (oldColumn == newCol)
        {
            var movedCards = destCards.Where(c => c.Id != card.Id).ToList();
            movedCards.Insert(Math.Clamp(newPos, 0, movedCards.Count), card);
            for (int i = 0; i < movedCards.Count; i++)
                movedCards[i].Position = i;
        }
        else
        {
            var sourceCards = await _context
                .Cards.Where(c => c.ColumnId == oldColumn)
                .OrderBy(c => c.Position)
                .ToListAsync();

            foreach (var c in sourceCards.Where(c => c.Position > oldPos))
                c.Position--;

            foreach (var c in destCards.Where(c => c.Position >= newPos))
                c.Position++;

            card.ColumnId = newCol;
            card.Position = newPos;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCard(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context.Cards.Where(c => c.Id == id && c.Column.BoardId == boardId).FirstOrDefaultAsync();
        if (card == null)
        {
            return NotFound("Card not found");
        }

        _context.Cards.Remove(card);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("{cardId}/assignees")]
    public async Task<IActionResult> AssignUser(long boardId, long cardId, AssignUserDto userDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = userDto.UserId;
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.AssignedUsers)
            .Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == cardId && c.Column.BoardId == boardId);

        if (card == null)
            return NotFound("Card not found");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound("User not found");

        var isBoardMember = await _context.BoardMembers.AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId);
        if (!isBoardMember)
            return BadRequest("User is not a member of this board");

        if (card.AssignedUsers.Any(u => u.Id == userId))
            return BadRequest("User already assigned");

        card.AssignedUsers.Add(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{cardId}/assignees/{userId}")]
    public async Task<IActionResult> UnassignUser(long boardId, long cardId, int userId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.AssignedUsers)
            .Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == cardId && c.Column.BoardId == boardId);

        if (card == null)
            return NotFound("Card not found");

        var user = card.AssignedUsers.FirstOrDefault(u => u.Id == userId);
        if (user == null)
            return NotFound("User is not assigned to this card");

        card.AssignedUsers.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{cardId}/labels")]
    public async Task<IActionResult> AttachLabel(long boardId, long cardId, AttachLabelDto dto)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.Labels)
            .Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == cardId && c.Column.BoardId == boardId);

        if (card == null)
            return NotFound("Card not found");

        var label = await _context.Labels.FindAsync(dto.LabelId);
        if (label == null)
            return NotFound("Label not found");

        if (card.Labels.Any(l => l.Id == dto.LabelId))
            return BadRequest("Label already attached");

        card.Labels.Add(label);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{cardId}/labels/{labelId}")]
    public async Task<IActionResult> DetachLabel(long boardId, long cardId, long labelId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.Labels)
            .Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == cardId && c.Column.BoardId == boardId);

        if (card == null)
            return NotFound("Card not found");

        var label = card.Labels.FirstOrDefault(l => l.Id == labelId);
        if (label == null)
            return NotFound("Label not attached to card");

        card.Labels.Remove(label);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
