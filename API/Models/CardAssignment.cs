namespace API.Models;

public class CardAssignment
{
	public long Id { get; set; }
	public long CardId { get; set; }
	public required Card Card { get; set; }
	public int UserId { get; set; }
	public required AppUser User { get; set; }
}