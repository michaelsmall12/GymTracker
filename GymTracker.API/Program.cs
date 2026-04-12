using GymTracker.Data.EF;
using GymTracker.Data.EF.Repositories;
using GymTracker.Data.EF.Repositories.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<GymTrackerContext>();
builder.Services.AddTransient<IExerciseRepository, ExerciseRepository>();
builder.Services.AddTransient<IGymSessionRepository, GymSessionRepository>();
builder.Services.AddTransient<ILiftSetRepository, LiftSetRepository>();
builder.Services.AddTransient<ILocationRepository, LocationRepository>();
builder.Services.AddTransient<IExerciseNameRepository, ExerciseNameRepository>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeb", builder =>
    {
        builder.WithOrigins("http://localhost:8081")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.UseCors("AllowWeb");
app.Run();
