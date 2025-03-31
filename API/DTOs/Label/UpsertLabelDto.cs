using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpsertLabelDto
{
    [Required(ErrorMessage = "Title is required")]
    public required string Title { get; set; }

    [Required(ErrorMessage = "Color is required")]
    public required string Color { get; set; }
}
