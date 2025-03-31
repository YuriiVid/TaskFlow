namespace API.DTOs;

public class CommentDto
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public long CardId { get; set; }
    public int UserId { get; set; }
}
