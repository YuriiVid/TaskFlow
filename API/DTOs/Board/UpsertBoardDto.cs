using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpsertBoardDto
{
    [Required(ErrorMessage = "Title is required")]
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
}
