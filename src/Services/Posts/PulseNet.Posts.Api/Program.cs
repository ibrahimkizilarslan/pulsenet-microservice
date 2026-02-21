using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Persistence;
using PulseNet.Posts.Api.Endpoints;
using PulseNet.Posts.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddMongoDatabase(builder.Configuration);
builder.Services.AddSingleton<PostsRepository>();

var app = builder.Build();

app.UseServiceDefaults();
app.MapPostsEndpoints();

app.Run();
