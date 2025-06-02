using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace API.Controllers;

[Route("api/boards/{boardId}/cards/{cardId}/attachments")]
[Authorize]
[ApiController]
public class AttachmentsController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;
    private readonly IFileStorageService _fileStorage;

    public AttachmentsController(
        AppDbContext context,
        IBoardValidationService boardValidator,
        IFileStorageService fileStorage
    )
    {
        _context = context;
        _boardValidationService = boardValidator;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<ActionResult<IList<AttachmentDto>>> GetAttachments(long boardId, long cardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var attachments = await _context
            .Attachments.Where(a => a.Card.Column.BoardId == boardId && a.CardId == cardId)
            .Select(a => new AttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FileUrl = a.FileUrl,
                SizeInBytes = a.SizeInBytes,
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();

        return Ok(attachments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AttachmentDto>> GetAttachment(long boardId, long cardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var attachment = await _context
            .Attachments.Where(a => a.Id == id && a.CardId == cardId && a.Card.Column.BoardId == boardId)
            .Select(a => new AttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FileUrl = a.FileUrl,
                SizeInBytes = a.SizeInBytes,
                CreatedAt = a.CreatedAt,
            })
            .FirstOrDefaultAsync();

        if (attachment == null)
        {
            return NotFound("Attachment not found");
        }

        return Ok(attachment);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadAttachment(long boardId, long cardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var attachment = await _context
            .Attachments.Where(a => a.Id == id && a.CardId == cardId && a.Card.Column.BoardId == boardId)
            .FirstOrDefaultAsync();
        if (attachment == null)
            return NotFound();

        var (stream, contentType) = await _fileStorage.GetFileStreamAsync(attachment.FileUrl);
        if (stream == null)
            return NotFound();

        return File(
            fileStream: stream,
            contentType: contentType ?? "application/octet-stream",
            fileDownloadName: attachment.FileName
        );
    }

    [HttpPost]
    public async Task<ActionResult<AttachmentDto>> CreateAttachment(long boardId, long cardId, IFormFile File)
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

        var fileUrl = await _fileStorage.StoreFileAsync(File);
        var attachment = new Attachment
        {
            FileName = File.FileName,
            FileUrl = fileUrl,
            CardId = cardId,
            SizeInBytes = File.Length,
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAttachment),
            new
            {
                boardId,
                cardId,
                id = attachment.Id,
            },
            new AttachmentDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileUrl = attachment.FileUrl,
                SizeInBytes = attachment.SizeInBytes,
                CreatedAt = attachment.CreatedAt,
            }
        );
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttachment(long boardId, long cardId, long id)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());

        var attachment = await _context
            .Attachments.Where(a => a.Id == id && a.CardId == cardId && a.Card.Column.BoardId == boardId)
            .FirstOrDefaultAsync();

        if (attachment == null)
        {
            return NotFound("Attachment not found");
        }

        await _fileStorage.DeleteFileAsync(attachment.FileUrl);
        _context.Attachments.Remove(attachment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
