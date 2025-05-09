using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/boards/{boardId}/cards")]
[Authorize]
[ApiController]
public class CardsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;

    public CardsController(AppDbContext context, IBoardValidationService boardValidator)
    {
        _boardValidationService = boardValidator;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<BriefCardDto>>> GetCards(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var cards = await _context
            .Cards.Include(c => c.Labels)
            .Include(c => c.Attachments)
            .Include(c => c.AssignedUsers)
            .Include(c => c.Comments)
            .Where(c => c.Column.BoardId == boardId)
            .ToListAsync();

        List<BriefCardDto> briefCards = cards
            .Select(card => new BriefCardDto
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
            .ToList();

        return Ok(briefCards);
    }

    private string GetUserLink(AppUser user) =>
        Url.ActionLink(action: nameof(UsersController.GetUser), controller: "Users", values: new { id = user.Id });

    [HttpGet("{id}")]
    public async Task<ActionResult<FullCardDto>> GetCard(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context
            .Cards.Include(c => c.Labels)
            .Include(c => c.Attachments)
            .Include(c => c.AssignedUsers)
            .Include(c => c.Comments)
            .ThenInclude(com => com.User)
            .Include(c => c.Column)
            .Where(c => c.Id == id && c.Column.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (card == null)
        {
            return NotFound("Card not found");
        }

        FullCardDto fullCard = new()
        {
            Id = card.Id,
            Title = card.Title,
            Description = card.Description,
            DueDate = card.DueDate,
            ColumnId = card.ColumnId,
            Attachments = card
                .Attachments.Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                })
                .ToList(),
            Labels = card
                .Labels.Select(l => new LabelDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Color = l.Color,
                })
                .ToList(),
            Comments = card
                .Comments.Select(com => new CommentDto
                {
                    Id = com.Id,
                    Content = com.Content,
                    CreatedAt = com.CreatedAt,
                    CardId = com.CardId,
                    User = new UserDto
                    {
                        Id = com.User.Id,
                        FirstName = com.User.FirstName,
                        LastName = com.User.LastName,
                        ProfilePictureUrl = com.User.ProfilePictureUrl,
                        UserName = com.User.UserName,
                        Email = com.User.Email,
                    },
                })
                .ToList(),
            AssignedTo = card
                .AssignedUsers.Select(u => new UserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    UserName = u.UserName,
                })
                .ToList(),
        };

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
            await _context.Cards.Where(c => c.ColumnId == cardDto.ColumnId).MaxAsync(c => c.Position) ?? -1;

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
}
