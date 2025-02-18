namespace API.DTOs;

public class AppUserDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string JWT { get; set; }
}
