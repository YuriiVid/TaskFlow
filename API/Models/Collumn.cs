namespace API.Models;

public class Collumn
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public long BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public ICollection<Card> Cards { get; } = new List<Card>();
}
