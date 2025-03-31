namespace API.DTOs;

public class FullCollumnDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public IList<BriefCardDto> Cards { get; set; } = new List<BriefCardDto>();
}
