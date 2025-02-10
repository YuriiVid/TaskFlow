using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration.AddJsonFile(
		$"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
		optional: false,
		reloadOnChange: true
	 ).AddEnvironmentVariables();

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// Database Connection
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), o => o.MapEnum<BoardMemberRole>("BoardMemberRole")));

// Identity Setup
builder.Services.AddIdentity<AppUser, IdentityRole<int>>()
	.AddEntityFrameworkStores<AppDbContext>()
	.AddDefaultTokenProviders();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
