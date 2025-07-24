using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using AutoMapper;
using AutoMapper.QueryableExtensions;
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
    private readonly IMapper _mapper;

    public BoardsController(AppDbContext context, IBoardValidationService boardValidator, IMapper mapper)
    {
        _context = context;
        _boardValidationService = boardValidator;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BriefBoardDto>>> GetBoards()
    {
        var boards = await _context
            .Boards.Include(b => b.Members)
            .AsNoTracking()
            .Where(b => b.Members.Any(m => m.UserId == User.GetCurrentUserId()))
            .ProjectTo<BriefBoardDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FullBoardDto>> GetBoard(long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, id, User.GetCurrentUserId());
        var fullBoard = await _context
            .Boards.AsNoTracking()
            .Where(b => b.Id == id)
            .ProjectTo<FullBoardDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return Ok(fullBoard);
    }

    [HttpPost]
    public async Task<ActionResult> CreateBoard(UpsertBoardDto boardDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var board = new Board { Title = boardDto.Title, Description = boardDto.Description };
        var currentUserId = User.GetCurrentUserId();

        board.Members.Add(new BoardMember { UserId = currentUserId, Role = BoardMemberRole.Owner });

        // Create default labels
        var defaultLabels = GetDefaultLabels();
        foreach (var label in defaultLabels)
        {
            label.BoardId = board.Id;
            board.Labels.Add(label);
        }

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

    private static List<Label> GetDefaultLabels()
    {
        return new List<Label>
        {
            new Label { Color = "#ef4444" }, // Red
            new Label { Color = "#f97316" }, // Orange
            new Label { Color = "#eab308" }, // Yellow
            new Label { Color = "#22c55e" }, // Green
            new Label { Color = "#3b82f6" }, // Blue
            new Label { Color = "#8b5cf6" }, // Violet
        };
    }
}
