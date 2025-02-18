using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ResetPasswordDto
{
    public required string Token { get; set; }

    [EmailAddress]
    public required string Email { get; set; }

    [StringLength(30, MinimumLength = 6, ErrorMessage = "New password must be at least {2} and maximum {1} characters")]
    public required string NewPassword { get; set; }
}
