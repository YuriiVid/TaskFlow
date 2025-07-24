using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace API.Controllers;

[Route("api/boards/{boardId}/cards/{cardId}/comments")]
[Authorize]
[ApiController]
public class CommentsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;
    private readonly IMapper _mapper;

    public CommentsController(AppDbContext context, IBoardValidationService boardValidator, IMapper mapper)
    {
        _context = context;
        _boardValidationService = boardValidator;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IList<CommentDto>>> GetComments(long boardId, long cardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var comments = await _context
            .Comments.AsNoTracking()
            .Where(c => c.Card.Column.BoardId == boardId && c.CardId == cardId)
            .ProjectTo<CommentDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return Ok(comments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommentDto>> GetComment(long boardId, long cardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var comment = await _context
            .Comments.AsNoTracking()
            .Where(c => c.Id == id && c.CardId == cardId && c.Card.Column.BoardId == boardId)
            .ProjectTo<CommentDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        if (comment == null)
        {
            return NotFound("Comment not found");
        }

        return Ok(comment);
    }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> CreateComment(long boardId, long cardId, UpsertCommentDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var card = await _context.Cards.Where(c => c.Id == cardId && c.Column.BoardId == boardId).FirstOrDefaultAsync();

        if (card == null)
        {
            return NotFound("Card not found");
        }

        var comment = new Comment
        {
            Content = dto.Content,
            CardId = cardId,
            UserId = User.GetCurrentUserId(),
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetComment),
            new
            {
                boardId,
                cardId,
                id = comment.Id,
            },
            new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                CardId = comment.CardId,
            }
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(long boardId, long cardId, long id, UpsertCommentDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var comment = await _context
            .Comments.Where(c => c.Id == id && c.CardId == cardId && c.Card.Column.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (comment == null)
        {
            return NotFound("Comment not found");
        }

        if (comment.UserId != User.GetCurrentUserId())
        {
            return Forbid();
        }

        comment.Content = dto.Content;
        comment.UpdatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(long boardId, long cardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var comment = await _context
            .Comments.Where(c => c.Id == id && c.CardId == cardId && c.Card.Column.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (comment == null)
        {
            return NotFound("Comment not found");
        }

        if (comment.UserId != User.GetCurrentUserId())
        {
            return Forbid();
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
