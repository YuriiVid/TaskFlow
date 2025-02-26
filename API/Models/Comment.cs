namespace API.Models;

public class Comment
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long CardId { get; set; }
    public required Card Card { get; set; }
    public int UserId { get; set; }
    public required AppUser User { get; set; }
}
