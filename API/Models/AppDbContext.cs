using API.SeedConfiguration;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Models;

public partial class AppDbContext : IdentityDbContext<AppUser, Role, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Board> Boards { get; set; }
    public DbSet<BoardMember> BoardMembers { get; set; }
    public DbSet<Collumn> Collumns { get; set; }
    public DbSet<Card> Cards { get; set; }
    public DbSet<CardAssignment> CardAssignments { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<ActivityLog> ActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<BoardMember>().HasIndex(bm => new { bm.BoardId, bm.UserId }).IsUnique();

        builder.Entity<CardAssignment>().HasIndex(ta => new { ta.CardId, ta.UserId }).IsUnique();

        builder.ApplyConfiguration(new RoleConfiguration());
    }
}
