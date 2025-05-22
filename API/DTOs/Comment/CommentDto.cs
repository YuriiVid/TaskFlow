using NodaTime;

namespace API.DTOs;

public class CommentDto
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public Instant CreatedAt { get; set; }
    public Instant? UpdatedAt { get; set; }
    public long CardId { get; set; }
    public UserDto User { get; set; } = null!;
}
