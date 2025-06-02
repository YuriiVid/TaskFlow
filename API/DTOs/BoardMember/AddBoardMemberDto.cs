using System.ComponentModel.DataAnnotations;
using API.Models;

namespace API.DTOs;

public class AddBoardMemberDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public required string Email { get; set; }
    public BoardMemberRole BoardMemberRole { get; set; } = BoardMemberRole.Member;
}
