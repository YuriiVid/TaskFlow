namespace API.Models;

public class Board
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public ICollection<Label> Labels { get; } = new List<Label>();
    public ICollection<AppUser> Users { get; } = new List<AppUser>();
    public ICollection<BoardMember> Members { get; } = new List<BoardMember>();
    public ICollection<Collumn> Collumns { get; } = new List<Collumn>();
    public ICollection<ActivityLog> ActivityLogs { get; } = new List<ActivityLog>();
}
