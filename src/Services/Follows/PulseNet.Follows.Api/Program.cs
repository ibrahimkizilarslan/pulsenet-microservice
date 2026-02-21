using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Persistence;
using PulseNet.Follows.Api.Endpoints;
using PulseNet.Follows.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddMongoDatabase(builder.Configuration);
builder.Services.AddSingleton<FollowsRepository>();

var app = builder.Build();

app.UseServiceDefaults();
app.MapFollowsEndpoints();

app.Run();
