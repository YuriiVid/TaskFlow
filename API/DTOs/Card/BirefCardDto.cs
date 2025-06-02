using NodaTime;

namespace API.DTOs;

public class BriefCardDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public IList<LabelDto> Labels { get; set; } = new List<LabelDto>();
    public required int AttachmentsCount { get; set; }
    public Instant? DueDate { get; set; }
    public required bool HasDescription { get; set; }
    public int? Position { get; set; }
    public bool IsCompleted { get; set; }
    public IList<UserDto> AssignedUsers { get; set; } = new List<UserDto>();
    public int CommentsCount { get; set; }
}
