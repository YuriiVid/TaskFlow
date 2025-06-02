using System.Reflection;
using System.Text;
using API.Filters;
using API.Middleware;
using API.Models;
using API.Profiles;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

builder
    .Configuration.AddJsonFile(
        $"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
        optional: false,
        reloadOnChange: true
    )
    .AddEnvironmentVariables();

// Enum convertertion to be able to send enums as strings in requests and receive them as enums in the backend
builder
    .Services.AddControllers(opt => opt.Filters.Add<GlobalJsonResponseFilter>())
    .AddNewtonsoftJson(opt =>
    {
        opt.SerializerSettings.DateParseHandling = DateParseHandling.None;
        opt.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
        opt.SerializerSettings.Converters.Add(new StringEnumConverter());
    });

// OpenAPI Setup for better Scalar managment in dev
builder.Services.AddOpenApi(options => options.AddDocumentTransformer<BearerSecuritySchemeTransformer>());

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.MapEnum<BoardMemberRole>("BoardMemberRole").UseNodaTime()
    )
);

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
builder.Services.AddScoped<IBoardValidationService, BoardValidationService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

builder.Services.AddAutoMapper(typeof(BoardMappingProfile).Assembly);

builder.Services.AddCors();

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidateIssuer = true,
            ValidateAudience = false,
        };
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                var payload = new { message = "You are not authenticated. Please log in" };
                await context.Response.WriteAsJsonAsync(payload);
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                var payload = new { message = "You are not authorized to access this resource" };
                await context.Response.WriteAsJsonAsync(payload);
            },
        };
    });

builder
    .Services.AddAuthorizationBuilder()
    .AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"))
    .AddDefaultPolicy("UserPolicy", policy => policy.RequireRole("User", "Admin"));

var app = builder.Build();

app.UseCors(opt =>
{
    opt.WithOrigins(builder.Configuration["JWT:ClientUrl"]).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Servers = Array.Empty<ScalarServer>();
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "Uploads")),
        RequestPath = "/uploads",
    }
);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.Run();
