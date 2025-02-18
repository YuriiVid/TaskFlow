using System.Text;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

// Add services to the container.
builder
    .Configuration.AddJsonFile(
        $"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
        optional: false,
        reloadOnChange: true
    )
    .AddEnvironmentVariables();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database Connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.MapEnum<BoardMemberRole>("BoardMemberRole")
    )
);

// Identity Setup
builder
    .Services.AddIdentityCore<AppUser>(o =>
    {
        o.SignIn.RequireConfirmedAccount = true;
        o.User.RequireUniqueEmail = true;
    })
    .AddRoles<Role>()
    .AddRoleManager<RoleManager<Role>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager<SignInManager<AppUser>>()
    .AddUserManager<UserManager<AppUser>>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<JWTService>();
builder.Services.AddScoped<EmailService>();

builder.Services.AddCors();

// be able to authenticate users using JWT
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // validate the token based on the key we have provided inside appsettings.development.json JWT:Key
            ValidateIssuerSigningKey = true,
            // the issuer singning key based on JWT:Key
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])
            ),
            // the issuer which in here is the api project url we are using
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            // validate the issuer (who ever is issuing the JWT)
            ValidateIssuer = true,
            // don't validate audience (angular side)
            ValidateAudience = false,
        };
    });

builder
    .Services.AddAuthorizationBuilder()
    .AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"))
    .AddDefaultPolicy("UserPolicy", policy => policy.RequireRole("User"));

var app = builder.Build();

app.UseCors(opt =>
{
    opt.AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithOrigins(builder.Configuration["JWT:ClientUrl"]);
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Servers = Array.Empty<ScalarServer>();
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
