namespace API.DTOs;

public class BriefBoardDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public int TasksCount { get; set; }
    public IList<UserDto> Members { get; set; } = new List<UserDto>();
}
