using PulseNet.Timeline.Api.Domain;
using PulseNet.Timeline.Api.Persistence;

namespace PulseNet.Timeline.Api.Endpoints;

public static class TimelineEndpoints
{
    public static void MapTimelineEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/timeline");

        group.MapGet("/{userId}", async (string userId, TimelineRepository repo) =>
        {
            var entries = await repo.GetTimelineAsync(userId);
            return Results.Ok(entries);
        });

        group.MapPost("/", async (AddTimelineEntryRequest request, TimelineRepository repo) =>
        {
            var entry = new TimelineEntry
            {
                UserId = request.UserId,
                PostId = request.PostId,
                AuthorId = request.AuthorId,
                Content = request.Content,
                PostCreatedAt = request.PostCreatedAt
            };
            await repo.AddEntryAsync(entry);
            return Results.Created($"/api/timeline/{entry.Id}", entry);
        });

        group.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "timeline" }));
    }
}
