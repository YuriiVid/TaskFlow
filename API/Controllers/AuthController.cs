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

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly ILogger _logger;
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly JWTService _jwtService;
    private readonly EmailService _emailService;
    private readonly AppDbContext _context;

    public AuthController(
        IConfiguration config,
        UserManager<AppUser> userManager,
        JWTService jwtService,
        SignInManager<AppUser> signInManager,
        EmailService emailService,
        ILogger<AuthController> logger,
        AppDbContext context
    )
    {
        _config = config;
        _userManager = userManager;
        _jwtService = jwtService;
        _signInManager = signInManager;
        _emailService = emailService;
        _logger = logger;
        _context = context;
    }

    [HttpGet("refresh-user-token")]
    public async Task<IActionResult> RefreshUserToken()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var incomingToken))
            return Unauthorized("No token found");

        var tokenEntry = await _context.UserTokens.SingleOrDefaultAsync(t =>
            t.LoginProvider == "RefreshToken" && t.Name == "MyAppRefreshToken" && t.Value == incomingToken
        );
        if (tokenEntry == null)
            return Unauthorized("Invalid token");

        var user = await _userManager.FindByIdAsync(tokenEntry.UserId.ToString());
        if (user == null)
            return Unauthorized("No user found");

        if (!_jwtService.IsRefreshTokenValid(incomingToken))
        {
            await _userManager.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken");
            return Unauthorized();
        }

        var newRefresh = await _jwtService.CreateRefreshTokenAsync(user);
        Response.Cookies.Append(
            "refreshToken",
            newRefresh,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None, // allow cross-site from your SPA
                Expires = DateTime.UtcNow.AddDays(_config.GetValue<int>("JWT:RefreshTokenExpiresInDays")),
            }
        );

        return await _userManager.IsLockedOutAsync(user) ? Unauthorized() : Ok(await CreateAppUserDto(user));
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

        var refresh = await _jwtService.CreateRefreshTokenAsync(user);
        Response.Cookies.Append(
            "refreshToken",
            refresh,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(_config.GetValue<int>("JWT:RefreshTokenExpiresInDays")),
            }
        );

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

    [HttpPost("forgot-password/{email}")]
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

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        var user = await _userManager.FindByIdAsync(username);
        if (user != null)
        {
            await _userManager.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken");
        }

        Response.Cookies.Delete("refreshToken");
        return Ok(new { title = "Success", message = "Logged out" });
    }

    private async Task<bool> CheckEmailExistsAsync(string email)
    {
        return await _userManager.Users.AnyAsync(x =>
            x.Email!.Equals(email, StringComparison.CurrentCultureIgnoreCase)
        );
    }

    private async Task<AuthUserDto> CreateAppUserDto(AppUser appUser)
    {
        return new AuthUserDto
        {
            User = new UserDto
            {
                Id = appUser.Id,
                FirstName = appUser.FirstName,
                LastName = appUser.LastName,
                Email = appUser.Email,
                UserName = appUser.UserName,
                ProfilePictureUrl = appUser.ProfilePictureUrl,
            },
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
