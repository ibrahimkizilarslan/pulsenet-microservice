using PulseNet.Follows.Api.Domain;
using PulseNet.Follows.Api.Persistence;

namespace PulseNet.Follows.Api.Endpoints;

public static class FollowsEndpoints
{
    public static void MapFollowsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/follows");

        group.MapGet("/followers/{userId}", async (string userId, FollowsRepository repo) =>
        {
            var followers = await repo.GetFollowersAsync(userId);
            return Results.Ok(followers);
        });

        group.MapGet("/following/{userId}", async (string userId, FollowsRepository repo) =>
        {
            var following = await repo.GetFollowingAsync(userId);
            return Results.Ok(following);
        });

        group.MapPost("/", async (FollowRequest request, FollowsRepository repo) =>
        {
            if (request.FollowerId == request.FolloweeId)
                return Results.BadRequest(new { error = "Cannot follow yourself." });

            var alreadyFollowing = await repo.IsFollowingAsync(request.FollowerId, request.FolloweeId);
            if (alreadyFollowing)
                return Results.Conflict(new { error = "Already following this user." });

            var follow = new Follow
            {
                FollowerId = request.FollowerId,
                FolloweeId = request.FolloweeId
            };
            await repo.CreateAsync(follow);
            return Results.Created($"/api/follows/{follow.Id}", follow);
        });

        group.MapDelete("/{followerId}/{followeeId}", async (string followerId, string followeeId, FollowsRepository repo) =>
        {
            await repo.DeleteAsync(followerId, followeeId);
            return Results.NoContent();
        });

        group.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "follows" }));
    }
}
