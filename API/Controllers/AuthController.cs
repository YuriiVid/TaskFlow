using System.Security.Claims;
using System.Text;
using API.DTOs;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly ILogger _logger;
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly JWTService _jwtService;
    private readonly EmailService _emailService;

    public AuthController(
        IConfiguration config,
        UserManager<AppUser> userManager,
        JWTService jwtService,
        SignInManager<AppUser> signInManager,
        EmailService emailService,
        ILogger<AuthController> logger
    )
    {
        _config = config;
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _emailService = emailService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("refresh-user-token")]
    public async Task<IActionResult> RefreshUserToken()
    {
        var user = await _userManager.FindByNameAsync(User.FindFirstValue(ClaimTypes.Name));

        return await _userManager.IsLockedOutAsync(user)
            ? Unauthorized("You have been locked out")
            : Ok(await CreateAppUserDto(user));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto model)
    {
        if (await CheckEmailExistsAsync(model.Email))
        {
            return BadRequest("Account with given email already exists");
        }

        var userToAdd = new AppUser
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            UserName = model.Email.ToLower(),
            Email = model.Email.ToLower(),
        };

        var result = await _userManager.CreateAsync(userToAdd, model.Password);
        if (!result.Succeeded)
        {
            _logger.LogError(result.Errors.ToString());
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(userToAdd, SD.UserRole);

        try
        {
            return await SendConfirmEmailAsync(userToAdd)
                ? Ok(
                    new
                    {
                        title = "Account Created",
                        message = "Your account has been created, please confirm your email address",
                    }
                )
                : BadRequest("Failed to send email. Please contact admin");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return BadRequest("Failed to send email. Please contact admin");
        }
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model)
    {
        var user = await _userManager.FindByNameAsync(model.UserName);
        if (user == null)
        {
            return Unauthorized("Invalid username or password");
        }

        if (!user.EmailConfirmed)
        {
            return Unauthorized("Please confirm your email.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, true);
        if (result.IsLockedOut)
        {
            return Unauthorized(
                $"Your account has been locked due to too many failed attempts. You should wait until {user.LockoutEnd} (UTC time) to be able to login"
            );
        }

        return result.Succeeded ? Ok(await CreateAppUserDto(user)) : Unauthorized("Invalid username or password");
    }

    [HttpPut("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return Unauthorized("This email address has not been registered yet");

        if (user.EmailConfirmed == true)
            return BadRequest("Your email was confirmed before. Please login to your account");

        try
        {
            var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
            return result.Succeeded
                ? Ok(new { title = "Email confirmed", message = "Your email address is confirmed. You can login now" })
                : BadRequest("Invalid token. Please try again");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return BadRequest("Invalid token. Please try again");
        }
    }

    [HttpPost("resend-email-confirmation-link/{email}")]
    public async Task<IActionResult> ResendEmailConfirmationLink(string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest("Invalid email");
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return Unauthorized("This email address has not been registerd yet");
        if (user.EmailConfirmed == true)
            return BadRequest("Your email address was confirmed before. Please login to your account");

        try
        {
            return await SendConfirmEmailAsync(user)
                ? Ok(new { title = "Confirmation link sent", message = "Please confirm your email address" })
                : BadRequest("Failed to send email. Please contact admin");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return BadRequest("Failed to send email. PLease contact admin");
        }
    }

    [HttpPost("forgot-username-or-password/{email}")]
    public async Task<IActionResult> ForgotUsernameOrPassword(string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest("Invalid email");

        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return Unauthorized("This email address has not been registerd yet");
        if (user.EmailConfirmed == false)
            return BadRequest("Please confirm your email address first.");

        try
        {
            return await SendForgotUsernameOrPasswordEmail(user)
                ? Ok(new { title = "Forgot username or password email sent", message = "Please check your email" })
                : BadRequest("Failed to send email. Please contact admin");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return BadRequest("Failed to send email. Please contact admin");
        }
    }

    [HttpPut("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return Unauthorized("This email address has not been registerd yet");
        if (user.EmailConfirmed == false)
            return BadRequest("PLease confirm your email address first");

        try
        {
            var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
            return result.Succeeded
                ? Ok(new { title = "Password reset success", message = "Your password has been reset" })
                : BadRequest("Invalid token. Please try again");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return BadRequest("Invalid token. Please try again");
        }
    }

    private async Task<bool> CheckEmailExistsAsync(string email)
    {
        return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
    }

    private async Task<AppUserDto> CreateAppUserDto(AppUser appUser)
    {
        return new AppUserDto
        {
            FirstName = appUser.FirstName,
            LastName = appUser.LastName,
            JWT = await _jwtService.CreateJWT(appUser),
        };
    }

    private async Task<bool> SendConfirmEmailAsync(AppUser user)
    {
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ConfirmEmailPath"]}?token={token}&email={user.Email}";

        return await _emailService.SendConfirmationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", url);
    }

    private async Task<bool> SendForgotUsernameOrPasswordEmail(AppUser user)
    {
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ResetPasswordPath"]}?token={token}&email={user.Email}";

        return await _emailService.SendResetPasswordEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", url);
    }
}
