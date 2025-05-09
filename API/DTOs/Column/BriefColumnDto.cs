namespace API.DTOs;

public class BriefColumnDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public IList<string> Cards { get; set; } = new List<string>();
}
