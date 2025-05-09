using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class JWTService
    {
        private readonly IConfiguration _config;
        private readonly UserManager<AppUser> _userManager;
        private readonly SymmetricSecurityKey _jwtKey;
        private readonly TimeSpan _accessTokenLifetime;
        private readonly TimeSpan _refreshTokenLifetime;

        private const string RefreshProvider = "RefreshToken";
        private const string RefreshTokenName = "MyAppRefreshToken";

        public JWTService(IConfiguration config, UserManager<AppUser> userManager)
        {
            _config = config;
            _userManager = userManager;

            // JWT symmetric key
            _jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Key"]));

            // lifetimes from config (you can also hard-code here)
            _accessTokenLifetime = TimeSpan.FromMinutes(_config.GetValue<int>("JWT:AccessTokenExpiresInMinutes"));
            _refreshTokenLifetime = TimeSpan.FromDays(_config.GetValue<int>("JWT:RefreshTokenExpiresInDays"));
        }

        /// <summary>
        /// Creates a short-lived JWT access token.
        /// </summary>
        public async Task<string> CreateJWT(AppUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var creds = new SigningCredentials(_jwtKey, SecurityAlgorithms.HmacSha512);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.Add(_accessTokenLifetime),
                SigningCredentials = creds,
                Issuer = _config["JWT:Issuer"],
                Audience = _config["JWT:Audience"],
            };

            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateToken(tokenDescriptor);
            return handler.WriteToken(token);
        }

        /// <summary>
        /// Generates a new opaque refresh token *and* removes the old one.
        /// The returned string is of the form "{expiry:o}|{randomBase64}".
        /// </summary>
        public async Task<string> CreateRefreshTokenAsync(AppUser user)
        {
            // 1. Remove any existing one (rotation)
            await _userManager.RemoveAuthenticationTokenAsync(user, RefreshProvider, RefreshTokenName);

            // 2. Generate new random part
            var randomPart = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            // 3. Compute expiry timestamp
            var expires = DateTime.UtcNow.Add(_refreshTokenLifetime).ToString("o"); // ISO-8601

            // 4. Compose "{expiry}|{random}"
            var tokenValue = $"{expires}|{randomPart}";

            // 5. Persist in AspNetUserTokens
            await _userManager.SetAuthenticationTokenAsync(
                user,
                loginProvider: RefreshProvider,
                tokenName: RefreshTokenName,
                tokenValue: tokenValue
            );

            return tokenValue;
        }

        /// <summary>
        /// Validates the stored token string (from Identity store) and returns true if not expired.
        /// </summary>
        public bool IsRefreshTokenValid(string storedToken)
        {
            if (string.IsNullOrEmpty(storedToken))
                return false;
            var parts = storedToken.Split('|', 2);
            if (parts.Length != 2)
                return false;

            if (!DateTime.TryParse(parts[0], null, System.Globalization.DateTimeStyles.RoundtripKind, out var expiry))
                return false;

            return expiry > DateTime.UtcNow;
        }
    }
}
