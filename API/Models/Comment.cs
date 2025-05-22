using NodaTime;

namespace API.Models;

public class Comment
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public Instant CreatedAt { get; private set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant? UpdatedAt { get; set; }
    public long CardId { get; set; }
    public Card Card { get; set; } = null!;
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
}
