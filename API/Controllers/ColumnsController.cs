using System.Security.Claims;
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

[Route("api/boards/{boardId}/columns")]
[Authorize]
[ApiController]
public class ColumnsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;
    private readonly IMapper _mapper;

    public ColumnsController(AppDbContext context, IBoardValidationService boardValidator, IMapper mapper)
    {
        _boardValidationService = boardValidator;
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BriefColumnDto>>> GetColumns(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());
        var briefColumns = await _context
            .Columns.Where(c => c.BoardId == boardId)
            .ProjectTo<BriefColumnDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return Ok(briefColumns);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FullColumnDto>> GetColumn(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var fullColumn = await _context
            .Columns.AsNoTracking()
            .Where(c => c.Id == id && c.BoardId == boardId)
            .ProjectTo<FullColumnDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        if (fullColumn == null)
        {
            return NotFound("Column not found");
        }

        return Ok(fullColumn);
    }

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
