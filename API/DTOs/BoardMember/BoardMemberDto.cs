namespace API.DTOs;

public class BoardMemberDto : UserDto
{
    public required string Role { get; set; }
}
