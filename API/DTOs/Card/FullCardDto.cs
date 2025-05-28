using API.Models;
using AutoMapper;
using NodaTime;

namespace API.DTOs;

[AutoMap(typeof(Card), ReverseMap = true)]
public class FullCardDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public Instant? DueDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public long ColumnId { get; set; }
    public IList<AttachmentDto> Attachments { get; set; } = new List<AttachmentDto>();
    public IList<LabelDto> Labels { get; set; } = new List<LabelDto>();
    public IList<UserDto> AssignedUsers { get; set; } = new List<UserDto>();
    public IList<CommentDto> Comments { get; set; } = new List<CommentDto>();
}
