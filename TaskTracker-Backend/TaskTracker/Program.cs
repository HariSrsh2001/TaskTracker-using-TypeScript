using TaskTracker.Domain.Interfaces;
using TaskTracker.Domain.Models;
using TaskTracker.DAL.Respositories;
using TaskTracker.Services.Interfaces;
using TaskTracker.Services.Implementations;
using TaskTracker.DAL.Data;
using TaskTracker.Api.Hubs;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ------------------- SERVICES CONFIGURATION -------------------

// ✅ Database: register EF Core with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Repository + Service layer (Dependency Injection)
builder.Services.AddScoped<IRepository<TaskItem>, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();

// ✅ Controllers + JSON options (serialize enums as strings, not numbers)
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ✅ Swagger (API docs) + SignalR (real-time)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// ✅ CORS: allow frontend (React running on port 5173) to call API + SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // 👈 React dev server URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ------------------- BUILD APP -------------------
var app = builder.Build();

// ------------------- MIDDLEWARE PIPELINE -------------------

// ✅ Enable Swagger only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Request pipeline (order matters!)
app.UseHttpsRedirection();     // redirect HTTP → HTTPS
app.UseRouting();              // enable endpoint routing
app.UseCors("AllowFrontend");  // apply frontend CORS policy
app.UseAuthorization();        // handle auth if needed later

// ✅ Map endpoints
app.MapControllers();                // map REST API controllers
app.MapHub<TasksHub>("/taskHub");    // map SignalR hub

// ✅ Run the app
app.Run();
