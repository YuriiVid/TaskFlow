using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/boards/{boardId}/members")]
[Authorize]
[ApiController]
public class BoardMembersController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;

    public BoardMembersController(AppDbContext context, IBoardValidationService boardValidator)
    {
        _context = context;
        _boardValidationService = boardValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BoardMemberDto>>> GetBoardMembers(long boardId)
    {
        var board = await _context
            .Boards.Include(b => b.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        _boardValidationService.ValidateBoard(board, User.GetCurrentUserId());

        var members = board!
            .Members.Select(m => new BoardMemberDto
            {
                UserId = m.UserId,
                UserName = m.User.UserName!,
                FirstName = m.User.FirstName,
                LastName = m.User.LastName,
                Role = m.Role.ToString(),
            })
            .ToList();

        return Ok(members);
    }

    [HttpPost]
    public async Task<IActionResult> AddMember(long boardId, AddBoardMemberDto addMemberDto)
    {
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == boardId);
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        var currentUserMember = board!.Members.FirstOrDefault(m => m.UserId == currentUserId);
        if (currentUserMember!.Role != BoardMemberRole.Owner && currentUserMember.Role != BoardMemberRole.Admin)
        {
            return BadRequest("Only admins and owners can add members");
        }

        if (board.Members.Any(m => m.UserId == addMemberDto.UserId))
        {
            return BadRequest("User is already a member of this board");
        }

        if (addMemberDto.BoardMemberRole == BoardMemberRole.Admin)
        {
            if (currentUserMember.Role != BoardMemberRole.Owner)
            {
                return BadRequest("Only the owner can add admins");
            }
        }

        var newMember = new BoardMember
        {
            BoardId = boardId,
            UserId = addMemberDto.UserId,
            Role = addMemberDto.BoardMemberRole,
        };

        board.Members.Add(newMember);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{userId}/role")]
    public async Task<IActionResult> UpdateMemberRole(long boardId, int userId, BoardMemberRole boardMemberRole)
    {
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == boardId);
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        var currentUserMember = board!.Members.FirstOrDefault(m => m.UserId == currentUserId);
        var memberToUpdate = board.Members.FirstOrDefault(m => m.UserId == userId);

        if (memberToUpdate == null)
        {
            return NotFound("Member not found");
        }

        if (memberToUpdate.Role == BoardMemberRole.Owner)
        {
            return BadRequest("Cannot change owner's role. Use transfer ownership instead.");
        }

        // Only owner can manage admins
        if (boardMemberRole == BoardMemberRole.Admin || memberToUpdate.Role == BoardMemberRole.Admin)
        {
            if (currentUserMember!.Role != BoardMemberRole.Owner)
            {
                return BadRequest("Only the owner can manage admins");
            }
        }
        // Admins can only manage regular users and observers
        else if (currentUserMember!.Role != BoardMemberRole.Owner && currentUserMember.Role != BoardMemberRole.Admin)
        {
            return BadRequest("You don't have permission to change roles");
        }

        memberToUpdate.Role = boardMemberRole;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> RemoveMember(long boardId, int userId)
    {
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == boardId);
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        var currentUserMember = board!.Members.FirstOrDefault(m => m.UserId == currentUserId);
        var memberToRemove = board.Members.FirstOrDefault(m => m.UserId == userId);

        if (memberToRemove == null)
        {
            return NotFound("Member to remove is not found");
        }

        if (memberToRemove.Role == BoardMemberRole.Owner)
        {
            return BadRequest("Cannot remove the owner");
        }

        // Only owner can remove admins
        if (memberToRemove.Role == BoardMemberRole.Admin)
        {
            if (currentUserMember!.Role != BoardMemberRole.Owner)
            {
                return BadRequest("Only the owner can remove admins");
            }
        }
        // Admins can only remove regular users and observers
        else if (currentUserMember!.Role != BoardMemberRole.Owner && currentUserMember.Role != BoardMemberRole.Admin)
        {
            return BadRequest("You don't have permission to remove members");
        }

        _context.BoardMembers.Remove(memberToRemove);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{userId}/transfer-ownership")]
    public async Task<IActionResult> TransferOwnership(long boardId, int userId)
    {
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == boardId);
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        var currentOwner = board!.Members.FirstOrDefault(m =>
            m.UserId == currentUserId && m.Role == BoardMemberRole.Owner
        );
        if (currentOwner == null)
        {
            return BadRequest("You are not the owner of this board");
        }

        var newOwner = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (newOwner == null)
        {
            return NotFound("Member not found");
        }

        currentOwner.Role = BoardMemberRole.Admin;
        newOwner.Role = BoardMemberRole.Owner;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("leave")]
    public async Task<IActionResult> LeaveBoard(long boardId)
    {
        var board = await _context.Boards.Include(b => b.Members).FirstOrDefaultAsync(b => b.Id == boardId);
        var currentUserId = User.GetCurrentUserId();
        _boardValidationService.ValidateBoard(board, currentUserId);

        var memberToLeave = board!.Members.FirstOrDefault(m => m.UserId == currentUserId);

        if (memberToLeave == null)
        {
            return NotFound("You are not a member of this board");
        }

        if (memberToLeave.Role == BoardMemberRole.Owner)
        {
            return BadRequest("Board owner cannot leave. Transfer ownership or delete the board.");
        }

        _context.BoardMembers.Remove(memberToLeave);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
