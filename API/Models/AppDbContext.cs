using API.SeedConfiguration;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Models;

public partial class AppDbContext : IdentityDbContext<AppUser, Role, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<ActivityLog> ActivityLogs { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<Board> Boards { get; set; }
    public DbSet<BoardMember> BoardMembers { get; set; }
    public DbSet<Card> Cards { get; set; }
    public DbSet<CardAssignment> CardAssignments { get; set; }
    public DbSet<CardLabel> CardLabels { get; set; }
    public DbSet<Collumn> Collumns { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Label> Labels { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Board>().HasMany(e => e.Users).WithMany(e => e.Boards).UsingEntity<BoardMember>();

        builder
            .Entity<Card>()
            .HasMany(e => e.AssignedUsers)
            .WithMany(e => e.AssignedCards)
            .UsingEntity<CardAssignment>(
                l => l.HasOne<AppUser>().WithMany().HasForeignKey(e => e.UserId),
                r => r.HasOne<Card>().WithMany().HasForeignKey(e => e.CardId)
            );

        builder.Entity<Card>().HasMany(e => e.Labels).WithMany(e => e.Cards).UsingEntity<CardLabel>();

        builder.ApplyConfiguration(new RoleConfiguration());
    }
}
