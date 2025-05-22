using NodaTime;

namespace API.Models;

public class Card
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public Instant? DueDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public long ColumnId { get; set; }
    public Column Column { get; set; } = null!;
    public int Position { get; set; }
    public ICollection<AppUser> AssignedUsers { get; } = new List<AppUser>();
    public ICollection<Comment> Comments { get; } = new List<Comment>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public ICollection<Label> Labels { get; set; } = new List<Label>();
}
