using PulseNet.Auth.Api.Endpoints;
using PulseNet.Auth.Api.Persistence;
using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Auth;
using PulseNet.BuildingBlocks.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddMongoDatabase(builder.Configuration);
builder.Services.AddSingleton<JwtTokenGenerator>();
builder.Services.AddSingleton<AuthRepository>();

var app = builder.Build();

app.UseServiceDefaults();
app.MapAuthEndpoints();

app.Run();
