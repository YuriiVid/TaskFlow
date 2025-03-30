namespace API.Models;

public class Label
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public required string Color { get; set; }
    public long BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
