using System.ComponentModel.DataAnnotations;
using API.Models;

namespace API.DTOs;

public class AddBoardMemberDto
{
    [Required(ErrorMessage = "UserId is required")]
    public int UserId { get; set; }
    public BoardMemberRole BoardMemberRole { get; set; } = BoardMemberRole.Member;
}
