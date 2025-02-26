namespace API.Models;

public class Card
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public DateTime? DueDate { get; set; }
    public required string Description { get; set; }
    public long CollumnId { get; set; }
    public required Collumn Collumn { get; set; }
    public int? Position { get; set; }
    public ICollection<AppUser> AssignedUsers { get; } = new List<AppUser>();
    public ICollection<Comment> Comments { get; } = new List<Comment>();
    public required ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public required ICollection<Label> Labels { get; set; } = new List<Label>();
}
