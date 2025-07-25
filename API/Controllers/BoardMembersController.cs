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

[Route("api/boards/{boardId}/members")]
[Authorize]
[ApiController]
public class BoardMembersController : Controller
{
    private readonly AppDbContext _context;
    private readonly IBoardValidationService _boardValidationService;
    private readonly IMapper _mapper;

    public BoardMembersController(AppDbContext context, IBoardValidationService boardValidator, IMapper mapper)
    {
        _context = context;
        _boardValidationService = boardValidator;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BoardMemberDto>>> GetBoardMembers(long boardId)
    {
        await _boardValidationService.ValidateBoardAsync(_context, boardId, User.GetCurrentUserId());
        var members = await _context
            .BoardMembers.AsNoTracking()
            .Where(m => m.BoardId == boardId)
            .ProjectTo<BoardMemberDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(b => b.Id == boardId);

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

        var userToAdd = await _context.Users.Where(u => u.Email == addMemberDto.Email).FirstOrDefaultAsync();
        if (userToAdd == null)
        {
            return NotFound("User with this email does not exist");
        }

        if (board.Members.Any(m => m.UserId == userToAdd.Id))
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
            UserId = userToAdd.Id,
            Role = addMemberDto.BoardMemberRole,
        };

        board.Members.Add(newMember);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{userId}/role")]
    public async Task<IActionResult> UpdateMemberRole(long boardId, int userId, ChangeBoardMemberRoleDto changeRoleDto)
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

        if (changeRoleDto.Role == BoardMemberRole.Owner)
        {
            return BadRequest("Cannot change owner's role. Use transfer ownership instead");
        }

        // Only owner can manage admins
        if (changeRoleDto.Role == BoardMemberRole.Admin || memberToUpdate.Role == BoardMemberRole.Admin)
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

        memberToUpdate.Role = changeRoleDto.Role;
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
