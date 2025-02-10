namespace API.Models;
public class ActivityLog
{
	public long Id { get; set; }
	public required string Action { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	public long BoardId { get; set; }
	public required Board Board { get; set; }
	public int UserId { get; set; }
	public required AppUser User { get; set; }
}