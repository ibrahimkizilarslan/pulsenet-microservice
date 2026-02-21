using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Persistence;
using PulseNet.Users.Api.Endpoints;
using PulseNet.Users.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddMongoDatabase(builder.Configuration);
builder.Services.AddSingleton<UsersRepository>();

var app = builder.Build();

app.UseServiceDefaults();
app.MapUsersEndpoints();

app.Run();
