using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpsertLabelDto
{
    public string? Title { get; set; }

    [Required(ErrorMessage = "Color is required")]
    public required string Color { get; set; }
}
