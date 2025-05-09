namespace API.DTOs;

public class FullBoardDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public IList<BoardMemberDto> Members { get; set; } = new List<BoardMemberDto>();
    public IList<FullColumnDto> Columns { get; set; } = new List<FullColumnDto>();
}
