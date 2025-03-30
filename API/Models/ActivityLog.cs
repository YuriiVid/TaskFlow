namespace API.Models;

public class ActivityLog
{
    public long Id { get; set; }
    public required string Action { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
}
