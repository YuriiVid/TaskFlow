namespace API.Models;

public class Card
{
	public long Id { get; set; }
	public required string Title { get; set; }
	public required string Labels { get; set; }
	public required string Attachments { get; set; }
	public DateTime? DueDate { get; set; }
	public required string Description { get; set; }
	public long ColumnId { get; set; }
	public required Collumn Collumn { get; set; }
	public int? Position { get; set; }
	public ICollection<CardAssignment> CardAssignments { get; } = new List<CardAssignment>();
	public ICollection<Comment> Comments { get; } = new List<Comment>();
}