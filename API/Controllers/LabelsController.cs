using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/boards/{boardId}/labels")]
[Authorize]
[ApiController]
public class LabelsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;

    public LabelsController(AppDbContext context, IBoardValidationService boardValidator)
    {
        _context = context;
        _boardValidationService = boardValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IList<LabelDto>>> GetLabels(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var labels = await _context
            .Labels.Where(l => l.BoardId == boardId)
            .Select(l => new LabelDto
            {
                Id = l.Id,
                Title = l.Title,
                Color = l.Color,
            })
            .ToListAsync();

        return Ok(labels);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LabelDto>> GetLabel(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var label = await _context
            .Labels.Where(l => l.Id == id && l.BoardId == boardId)
            .Select(l => new LabelDto
            {
                Id = l.Id,
                Title = l.Title,
                Color = l.Color,
            })
            .FirstOrDefaultAsync();

        if (label == null)
        {
            return NotFound("Label not found");
        }

        return Ok(label);
    }

    [HttpPost]
    public async Task<ActionResult<LabelDto>> CreateLabel(long boardId, UpsertLabelDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var label = new Label
        {
            Title = dto.Title,
            Color = dto.Color.ToUpper(),
            BoardId = boardId,
        };

        _context.Labels.Add(label);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetLabel),
            new { boardId, id = label.Id },
            new LabelDto
            {
                Id = label.Id,
                Title = label.Title,
                Color = label.Color,
            }
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLabel(long boardId, long id, UpsertLabelDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var label = await _context.Labels.Where(l => l.Id == id && l.BoardId == boardId).FirstOrDefaultAsync();

        if (label == null)
        {
            return NotFound("Label not found");
        }

        label.Title = dto.Title;
        label.Color = dto.Color.ToUpper();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLabel(long boardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var label = await _context.Labels.Where(l => l.Id == id && l.BoardId == boardId).FirstOrDefaultAsync();

        if (label == null)
        {
            return NotFound("Label not found");
        }

        _context.Labels.Remove(label);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
