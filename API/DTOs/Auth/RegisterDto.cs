using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [StringLength(30, MinimumLength = 3, ErrorMessage = "First name must be at least {2} and maximum {1} characters")]
    public required string FirstName { get; set; }

    [StringLength(30, MinimumLength = 3, ErrorMessage = "Last name must be at least {2} and maximum {1} characters")]
    public required string LastName { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email address")]
    public required string Email { get; set; }

    [StringLength(30, MinimumLength = 6, ErrorMessage = "Password must be at least {2} and maximum {1} characters")]
    public required string Password { get; set; }
}
