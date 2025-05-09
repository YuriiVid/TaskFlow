namespace API.DTOs;

public class CommentDto
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public long CardId { get; set; }
    public UserDto User { get; set; } = null!;
}
