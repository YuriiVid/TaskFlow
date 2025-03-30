namespace API.Models;

public class BoardMember
{
    public long BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public BoardMemberRole Role { get; set; } = BoardMemberRole.Member;
}
