namespace API.DTOs;

public class BoardMemberDto
{
    public int Id { get; set; }
    public required string UserName { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Role { get; set; }
}
