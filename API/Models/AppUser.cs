using Microsoft.AspNetCore.Identity;

namespace API.Models;

public class AppUser : IdentityUser<int>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<BoardMember> BoardMemberships { get; } = new List<BoardMember>();
    public ICollection<CardAssignment> CardAssignments { get; } = new List<CardAssignment>();
    public ICollection<Comment> Comments { get; } = new List<Comment>();
    public ICollection<ActivityLog> ActivityLogs { get; } = new List<ActivityLog>();
}
