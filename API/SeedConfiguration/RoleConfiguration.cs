using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.SeedConfiguration;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasData(
            new Role
            {
                Id = 1,
                Name = "User",
                NormalizedName = "USER",
            },
            new Role
            {
                Id = 2,
                Name = "Admin",
                NormalizedName = "ADMIN",
            }
        );
    }
}
