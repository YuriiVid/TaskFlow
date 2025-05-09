namespace API.DTOs;

public class UpdateCardDto
{
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public long ColumnId { get; set; }
    public DateTime? DueDate { get; set; }
    public int? Position { get; set; }
    public long? AssignedUserId { get; set; }
    public long? AttachmentId { get; set; }
    public long? CommentId { get; set; }
    public long? LabelId { get; set; }
}
