namespace API.Models;

public class BoardMember
{
    public long BoardId { get; set; }
    public required Board Board { get; set; }
    public int UserId { get; set; }
    public required AppUser User { get; set; }
    public BoardMemberRole Role { get; set; } = BoardMemberRole.Member;
}
