namespace API.Models;

public class Comment
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long CardId { get; set; }
    public Card Card { get; set; } = null!;
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
}
