using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Persistence;
using PulseNet.Timeline.Api.Endpoints;
using PulseNet.Timeline.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddMongoDatabase(builder.Configuration);
builder.Services.AddSingleton<TimelineRepository>();

var app = builder.Build();

app.UseServiceDefaults();
app.MapTimelineEndpoints();

app.Run();
