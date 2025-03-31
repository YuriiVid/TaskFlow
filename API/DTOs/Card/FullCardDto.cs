namespace API.DTOs;

public class FullCardDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public DateTime? DueDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public long CollumnId { get; set; }
    public IList<AttachmentDto> Attachments { get; set; } = new List<AttachmentDto>();
    public IList<LabelDto> Labels { get; set; } = new List<LabelDto>();
    public IList<UserDto> AssignedTo { get; set; } = new List<UserDto>();
    public IList<CommentDto> Comments { get; set; } = new List<CommentDto>();
}
