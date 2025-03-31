namespace API.DTOs;

public class BriefCollumnDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public IList<string> Cards { get; set; } = new List<string>();
}
