using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Persistence;
using PulseNet.Posts.Api.Endpoints;
using PulseNet.Posts.Api.Persistence;
using PulseNet.Posts.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddMongoDatabase(builder.Configuration);
builder.Services.AddSingleton<PostsRepository>();
builder.Services.AddHttpClient(nameof(TimelineFanOutService));
builder.Services.AddSingleton<TimelineFanOutService>();

var app = builder.Build();

app.UseServiceDefaults();
app.MapPostsEndpoints();

app.Run();
